export interface PublicAlternative {
  id: string
  name: string
}

export interface Alternative {
  id: string
  name: string
  correct: boolean
}

export interface Answer {
  selectedOptionId: string
}

export interface ClientErrorResponse {
  message: string
}

export interface ModelSolutionApi {
  correctOptionIds: string[]
}

export interface Question {
  id: string
  questionNr: number
  question: string
}

export interface RatedQuestion {
  questionId: string
  questionNr: number
  question: string
  rate: number | null  // use rather null
}

export interface Label {
  id: string
  label: string
  value: number | null
}

/** FactorialSurvey is super cool */
export interface FactorialSurvey {
  id: string
  factorAmount: number
  factors: Factor[]
  optionLabels: Label[]
  questions: Question[]
  /**
   *  Matrix for caculating factors for the factorial survey
   *  weights to be multiplied with the evaluated question rates
   *  row by question, col by factor: [question, factor] * question_rate
   */
  matrix: number[][]
}

export interface SubmittedForm {
  answeredQuestions: RatedQuestion[]
}

export interface Factor {
  id: string
  name: string
  score: number
}

//map to public spec
export interface PublicSurvey {
  id: string
  optionLabels: Label[]
  questions: Question[]
}
