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
  rate: number | "NaN"
}

export interface Label {
  id: string
  label: string
  value: number | "NaN"
}

export interface FactorialSurvey {
  id: string
  factorAmount: number
  factors: Factor[]
  optionLabels: Label[]
  questions: Question[]
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

export interface PublicSurvey {
  id: string
  optionLabels: Label[]
  questions: Question[]
}
