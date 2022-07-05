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
  question: string
  rate: number | null
  factorWeights: string
}

export interface Matrix {
  vector: number[][]
}

export interface Label {
  id: string
  label: string
  value: number
}

export interface FactorialSurvey {
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

// Shouldthere be a public version of Question without factorial vector
export interface PublicSurvey {
  id: string
  optionLabels: Label[]
  questions: Question[]
}
