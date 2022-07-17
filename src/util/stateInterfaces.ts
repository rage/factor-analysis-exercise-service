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

/** Evaluated survey question contains numerical | NA value as rate */
export interface RatedQuestion {
  questionId: string
  questionNr: number
  question: string
  rate: number | null  
}

/** Option labels for rating the factorial survey question
 */
export interface Label {
  id: string
  label: string
  value: number | null
}

/** FactorialSurvey for factorial analysis, options are constant for the whole set of questions
 * 
 * @factors Factor[]
 * @optionLabels Label[]
 * @questions Question[]
 * @matrix number[factor][question]
 */
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
export interface PublicFactorialSurveySpec {
  id: string
  optionLabels: Label[]
  questions: Question[]
}
