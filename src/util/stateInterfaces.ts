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
  rate: number
}

export interface Label {
  id: string
  label: string
  value: number
}

export interface FactorialSurvey {
  id: string
  factorAmount: number
  optionLabels: Label[]
  questions: Question[]
  matrix: number[][]
}

export interface SubmittedForm {
  answeredQuestions: RatedQuestion[]
}

// Shouldthere be a public version of Question without factorial vector
export interface PublicSurvey {
  id: string
  optionLabels: Label[]
  questions: Question[]
}
