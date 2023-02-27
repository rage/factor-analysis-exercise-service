/**
 * RatedQuesiton[] | SurveyItem[]
 */
export interface UserAnswer {
  answeredQuestions: RatedQuestion[] | AnsweredSurveyItem[]
}

/** Evaluated survey question contains numerical | NA value as rate */
export interface RatedQuestion {
  /** The question label is saved here for retrieval of facotr weights from the factor matrix */
  questionLabel: string
  /** The id of the chosen option */
  chosenOptionId: string
}

export interface AnsweredSurveyItem {
  /** Use both id and questionLabel because questionLabel is needed for filtering out conditional questions, and id is used because questionLabel may not be unique */
  surveyItemId: string
  questionLabel: string
  answer: string[] | string | number | null
}
