import polars as pl
import json 
from collections.abc import Iterable
from collections import ChainMap
from datetime import datetime
import os
from os import listdir
from os.path import isfile, join

# Function for flattening an array of arbitrary nested arrays or objects
def flatten(xs):
    result = []
    for x in xs:
        if isinstance(x, Iterable) and not isinstance(x, (str, bytes, type({}))):
            result.extend(flatten(x))
        else:
            result.append(x)
    return result

# Check that the ./data folder exsists
try:
    dir = os.listdir("./data")
except OSError as error:
    print(error)

# Read the needed files from the ./data repository
submission_files = []
userdetail_files = []
exercisetasks_files = []
datafiles = [f for f in listdir('./data/') if isfile(join('./data/', f))]

for f in datafiles:
    [course_name, file_name] = f.split(' - ', 1)
    if 'Submissions' in file_name:
        submission_files.append(f)
    elif 'Exercise tasks' in file_name:
        exercisetasks_files.append(f)
    elif 'User Details' in file_name:
        userdetail_files.append(f)

# Sort the files by date, most recent first
submission_files = sorted(submission_files, key=lambda x: (x.split(' ')[-1]), reverse=True)
exercisetasks_files = sorted(exercisetasks_files, key=lambda x: (x.split(' ')[-1]), reverse=True)
userdetail_files = sorted(userdetail_files, key=lambda x: (x.split(' ')[-1]), reverse=True)

try:
    exercise_tasks = pl.read_csv(join('./data/', exercisetasks_files[0]))
except OSError as error:
    print(error)


try:
    submissions = (pl.read_csv(join('./data/', submission_files[0]))
            # remove outdated format
            .filter(pl.col('created_at') >= '2023-03-03'))  
except OSError as error:
    print(error)

try:
    user_details = (pl.read_csv(join('./data/', userdetail_files[0]))
                .select(['user_id', pl.concat_str(pl.col('^.*_name$').fill_null('').alias('name'), separator=' '), 'email']))
except OSError as error:
    print(error)

cleaned_subs = (submissions
            .join(user_details.select(pl.exclude('created_at')), on='user_id', how='left')
            .join(exercise_tasks.select(['id', 'exercise_type']), left_on='exercise_task_id', right_on='id', how='left')
            .filter(pl.col('exercise_type') == 'dogs-factorial-analysis-survey')
            .drop(['course_instance_id', 'score_given','exercise_type'])
            .sort('created_at', descending=True)
            .unique(subset=['exercise_task_id', 'user_id'], keep='first')
        )

# The map of private-specs: { exercise_task_id : { private_spec } }
exercise_tasks_map = dict([(x[0], json.loads(x[4])) for x in exercise_tasks.rows() if 'factorial' in x[3]])

# Formatting the private_specs to needed fields for exstracting submission info
keys_to_delete = []
for k,v in exercise_tasks_map.items():

# factorial survey type: {
#   id, 
#   options: [{id, name, value}],
#   questions: [{id, questionLabel}],
#   type: 'factorial'
# }
    if v['type'] == 'factorial':
        exercise_tasks_map[k] = dict([(key, val) for key, val in dict(v).items() if key in ['id', 'type', 'questions', 'options']])
        exercise_tasks_map[k]['questions'] = ([
            dict([(key, val) for key,val in dict(quest).items() if key not in ['question', 'mandatory']]) 
            for quest in exercise_tasks_map[k]['questions'] if quest['questionLabel'] not in 'info'
            ])
# non-factorial survey type: {
#   id,
#   content: [{surveyItemId, options, questionLabel, answer-type}],
#   type: 'non-factorial'
# }
    else:
        exercise_tasks_map[k] = dict([(un, val) for un, val in dict(v).items() if un in ['id', 'type', 'content']])
        content = exercise_tasks_map[k]['content']
        
        content = ([
            dict([(key, value ) for key, value in dict(item).items() if key in ['id', 'answer', 'question']]) 
            for item in content if item['question']['questionLabel'] not in ['info']])

        for idx,item in enumerate(content):
            newItem = {'surveyItemId': item['id'],
                       'options': item['answer']['options'],
                       'answer-type': item['answer']['type'],
                       'questionLabel': item['question']['questionLabel']}
            content[idx] = newItem
        if content:
            exercise_tasks_map[k]['content'] = content
        else:
            keys_to_delete.append(k)

for key in keys_to_delete:
    del exercise_tasks_map[key]

# Building additional columns to final dataframe exercise tasks at a time
for k,v in exercise_tasks_map.items():
    submissions_data = cleaned_subs.filter(pl.col('exercise_task_id') == k).select('user_id','data_json').rows()

    user_submissions, col_labels, typed_col_labels = [],[],{}

    if v['type'] == 'factorial':
        col_labels = [lab['questionLabel'] for lab in v['questions']]
        col_labels.append('user_id')

        typed_col_labels = dict(ChainMap(*[{lab['questionLabel']: pl.Int8} for lab in v['questions']]))
        typed_col_labels['user_id'] = pl.Utf8

        options = dict([(option['id'], option['value']) for option in v['options']])
    
        for row in submissions_data:
            row = [row[0], json.loads(row[1])]
            user_answers = dict(row[1])

            submission = dict(ChainMap(*[{item['questionLabel']: options.get(item.get('chosenOptionId'))} for item  in user_answers.get('answeredQuestions')]))

            submission['user_id'] = row[0]
            user_submissions.append(submission)

    else: 
        # Columns are "questionLabel", unless it is mulptiple-choice question,
        # then columns are "questionLabel option" per option. Some options
        # end with empty space, we strip it away.
        col_labels = [[' '.join([item['questionLabel'], option.strip()]) for option in item['options']] if item['answer-type'] == 'multiple-choice' else item['questionLabel'] for item in v['content']]

        col_labels = flatten(col_labels)
        col_labels.append('user_id')
 
        typed_col_labels = dict(ChainMap(*[{col: pl.Utf8} for col in col_labels]))

        for row in submissions_data:
            row = [row[0], json.loads(row[1])]

            user_answer = dict(row[1])
            user_answer = dict([(answeredQ.get('questionLabel'), answeredQ.get('answer')) for answeredQ in user_answer.get('answeredQuestions')])

            submission = []
            for col in col_labels:
                questionAnswer = user_answer.get(col.split(' ', 1)[0], None)
                # The question is not multipple-choice
                if len(col.split(' ', 1)) == 1:     
                    submission.append({col: questionAnswer if questionAnswer else None})
                # The question is multipple-choice
                else:
                    # If user has not answered this question, all cloumns belonging to this question are NaN, 
                    # otherwise "1" indicates option is checked else "0".
                    # Have to consider that the column names contain the stripped option
                    submission.append({col: (1 if col.split(' ', 1)[1] in list(map(str.strip, questionAnswer)) else 0) if questionAnswer else None})

            submission = dict(ChainMap(*submission))
            
            submission['user_id']= row[0]

            user_submissions.append(submission)

    data = user_submissions if user_submissions else [[None for _ in col_labels]]

    additional_cols = pl.DataFrame(data, schema=typed_col_labels).select(col_labels)

    user_details = user_details.join(additional_cols, how='left', on='user_id')

try:
    os.mkdir("./parsed-outputs")
except OSError as error:
    if error.errno == 17:
        pass
    else: print(error)
        
dt = datetime.now().strftime('%d-%m-%Y %H:%M:%S')
filename = f'./parsed-outputs/Submissions {dt}.csv'
user_details.write_csv(filename, has_header=True, quote='"', null_value='', separator=';')