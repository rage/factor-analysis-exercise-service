# User Manual

First select the appropriate exercise type from the exercise selector:

<img src="https://github.com/rage/factor-analysis-exercise-service/blob/docs/docs/imgs/choose_exercise_type.png" width=500 position=left>

### There are 2 types of surveys:

| factorial | non-factorial |
| ------- | -------|
| This survey type is meant for building the factorial survey type for calculating and outputting a factorial report to the user based on the user answers. It can also be used for a set of questions having the same answer options (single-choice). For example: | This survey type lets you create survey questions of type: |
<img src="https://github.com/rage/factor-analysis-exercise-service/blob/docs/docs/imgs/questions_with_same_options_example.png" width=500 position=left> | <ul><li> free text</li><li> number</li><li>date</li><li>multiple-choice</li><li>single choice:<ul><li>radio-group</li><li>drop-down selection: the advanced drop-down selection allows the user to start typing in the search bar and provides answer alternatives matching the user input, in case of a very long option list.</li></ul></li><li>info element</li></ul> |

## Building a survey

### General: editing survey questions

Survey questions are identified by their unique `labels`. The question is inputted in the format

> label; question text
 
where the label and the question text are separated by a `;` (semicolon). The label should _not_ contain any whitespace, the whitespaces will be automatically removed. Question editor supports markdown and the question text is rendered above the editor the same way it will be rendered in the actual survey.

<img src="https://github.com/rage/factor-analysis-exercise-service/blob/docs/docs/imgs/question_editor_example.png" width=500 position=left>

For the **factorial** survey the list of questions is inserted into the list editor in the format

> label_one; question one text \n other_label; other question text


<img src="https://github.com/rage/factor-analysis-exercise-service/blob/docs/docs/imgs/question_list_editor.png" width=500 position=left>

The list can be modified to insert elements or remove elements from the list. `Info` elements are labeled `info` and can be inserted anywhere into the list.

The **non-factorial** survey has the list insertion as an option only if the survey is empty.

## Non-factorial survey

Either insert questions as a list to the list editor, or create a survey item one by one. Each question (survey item) is placed in its own box for editing. Once the label and question text are defined the selector for specifying the answer type will be rendered.

<img src="https://github.com/rage/factor-analysis-exercise-service/blob/docs/docs/imgs/non-factorial-answer-selector.png" width=500 position=left>

#### Adding answer options

For answer-types `multiple-choice`, `radio-group`, `dropdown-selection` and `advanced-dropdown` the options can be inserted one by one or as a .csv-file ([Comma Separated Values](https://en.wikipedia.org/wiki/Comma-separated_values)). The allowed delimiter for the .csv files are: `,` and `;`. Each value will be added as an option.

> After parsing the .csv file each option can still be edited or deleted manually as well as new options can be added. **Applying the .csv file will always overwrite any existing options.**

For options containing `,` either *escape* the it by wrapping the option in double-quotes `""`, like so:
```
,option one,"option two, contains comma"
"option three"
```
yielding the following result:

<img src="https://github.com/rage/factor-analysis-exercise-service/blob/docs/docs/imgs/add_options_non-factorial.png" width=500 position=left>

Be careful with the no whitespaces between `"` and the preceding delimiter (in this case `,`).

By clicking the "duplicate item" button, a new survey item will be inserted below containing the same options and of the same answer-type. Once the question label is defined, the answer-selector will appear. You can freely switch between answer-types that contain options without losing your list of options. Choosing an answer type that does not contain options (text, number, date) will clear the list of options.

#### Making questions render conditionally

By ticking the box "Conditional" you can choose what condition the question will be rendered on. The condition is another question within the same `task` containing options. The conditional question will be rendered once the survey user selects that particular option from that question. Questions can be made "double conditional" (or triple and so on) by depending on other conditional questions.

#### Make global

By ticking the box "Make global" the answer of this question is made available for questions in other tasks of the same exercise type, for this particular course. Once the user has answered the "global" question her answer can be inputted into questions and info elements in other tasks using this format:

> ${question_label=default value}

where on the left hand side of `=` the `question_label` is the unique question label of the global question and on the right-hand-side `default value` is any value (text) that is rendered in case the user has not answered that question yet. The `default value` can be left empty.

## Factorial
The factorial survey type is ment for

| | factor_label $1$ | $$\dots$$ | factor_label $n$ |
| -- | -- | -- | -- |
| question_label $1$ | $$a_{1,1}$$ | $$\dots$$ | $$a_{1,m}$$ |
| $$\vdots$$ | $$\vdots$$ | $$\ddots$$ | $$\dots$$ |
| question_label $n$ | $$a_{n,1}$$ | $$\dots$$ | $$a_{n,m}$$ |

The score for each factor $j$ is calculated by

$$factor_j=\sum_{i=1}^{n}a_{i,j}\*x_i,$$ where $x_i$ is the numerical value that the survey user has rated question $i$.

