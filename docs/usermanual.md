# User Manual

First select the appropriate exercise type from the exercise selector:

<img src="https://github.com/rage/factor-analysis-exercise-service/blob/docs/docs/imgs/choose_exercise_type.png" width=500 position=left>

## There are 2 types of surveys: 

### - factorial 

This survey type is ment for buiding the factorial survey type for calculating and outputting a factorial report to the user based on the user answers. It can also be used for a set of questions having the same answer options. For example:

<img src="https://github.com/rage/factor-analysis-exercise-service/blob/docs/docs/imgs/questions_with_same_options_example.png" width=500 position=left>

### - non-factorial

This survey type lets you create survey questions of type:
- free text
- number
- date
- multiple-choice
- single choice: 
  - radio-group 
  - drop-down selection: the advanced drop-down selection alowes the user to start typing in the search bar and provides answer alternatives matching the user input, in case of very long option list.
- info element

## Buiding a survey

### General: editing survey questions

Survey questions are identified by their unique `labels`. The question is inputted in the format 

> label; question text
 
where the label and the question text are separeted by a semicolon. The label is _not_ to contain any whitespace. Question editor supports markdown and is rendered above the editor the same way it will be rendered in the actual survey. 

<img src="https://github.com/rage/factor-analysis-exercise-service/blob/docs/docs/imgs/question_editor_example.png" width=500 position=left>

For the **factorial** survey the list of questions is inserted into the list in the format

> label_one; question one text \n other_label; other question text


<img src="https://github.com/rage/factor-analysis-exercise-service/blob/docs/docs/imgs/question_list_editor.png" width=500 position=left>

The list can be modified to insert elements or remove elements from the list. `Info` elements are labeled `info` and can be inserted anywhere into the list.

The **non-factorial** survey has the list insertion as an option only if the survey is empty.

### Non-factorial survey
