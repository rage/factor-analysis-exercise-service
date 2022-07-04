export interface Question {
  id: string
  question: string
  rate: number 
  factorWeights: number[]
}

export interface Matrix {
  vector: number[][]
}

export interface Label {
  id: string
  label: string
  value: number
}

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

export interface FactorQuery {
  id: string
  labelAmount: number
  questionAmount: number
  isFactorial: boolean
  factorAmount: number | null
  optionLabels: Label[]
  questions: Question[]
}

export interface SubmittedForm {
  answeredQuestions: Question[]
}

export interface PublicOption {
  id: string
  optionLabels: Label[]
  questions: Question[]
}
