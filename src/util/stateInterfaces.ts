export interface ClientErrorResponse {
  message: string
}

export interface Question {
  id: string
  questionLabel: string
  question: string
}

/** Evaluated survey question contains numerical | NA value as rate */
export interface RatedQuestion {
  questionId: string
  questionLabel: string
  question: string
  rate: number | null
  chosenOption: string
}

/** Answer option for rating factorial survey questions
 */
export interface FactorialOption {
  id: string
  name: string
  value: number | null
}

/** FactorialSurvey for factorial analysis, options are constant for the whole set of questions
 */
export interface FactorialSurvey {
  id: string
  type: SurveyType.Factorial
  factorAmount: number
  calculateFeedback: boolean
  factors: Factor[]
  options: FactorialOption[]
  questions: Question[]
  /**
   *  Matrix for caculating factor scores for the factorial survey
   *  weights to be multiplied with the evaluated question rates
   *  row by question, col by factor: [question, factor] * question_rate
   */
  matrix: number[][]
}

export interface SubmittedForm {
  answeredQuestions: RatedQuestion[] | SurveyItem[]
}

export interface Factor {
  id: string
  name: string
  score: number | null
}

/** PublicSpec for Factorial survey
 */
export interface PublicFactorialSurveySpec {
  id: string
  type: SurveyType.Factorial
  options: FactorialOption[]
  questions: Question[]
}

export interface SurveyItem {
  id: string
  question: Question
  answer: Answer
  conditional: boolean
  dependsOn?: SurveyItemCondition
}

export interface SurveyItemCondition {
  id: string
  questionLabel: string
  triggeringOption: string //one string for now, have to check with research group what they need
}

export interface Answer {
  id: string
  type: AnswerType
  options: string[]
  answer: string[] | string | number | null
}

export interface Survey {
  id: string
  type: SurveyType.NonFactorial
  content: SurveyItem[]
}

export enum SurveyType {
  Factorial = "factorial",
  NonFactorial = "non-factorial",
}

export enum AnswerType {
  None = "",
  Text = "text",
  Number = "number",
  MultiChoice = "multiple-choice",
  RadioGroup = "radio-group",
  BreedList = "breed-list",
  Date = "date",
}

export type PrivateSpec = FactorialSurvey | Survey | null

export type PublicSpec = PublicFactorialSurveySpec | Survey
