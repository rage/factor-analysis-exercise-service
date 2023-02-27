/**
 * RatedQuesiton[] | SurveyItem[]
 */
export interface SubmittedForm {
  //TODO: rename to useranswer
  answeredQuestions: RatedQuestion[] | AnsweredSurveyItem[]
}

/** Evaluated survey question contains numerical | NA value as rate */
export interface RatedQuestion {
  //TODO, rahter use the ID than chosenOption
  questionLabel: string
  //TODO use optionId instead
  chosenOption: string
}

export interface AnsweredSurveyItem {
  surveyItemId: string
  //TODO, use only id
  questionLabel: string
  answer: string[] | string | number | null
}
