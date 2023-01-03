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
  options: FactorialOption[]
  questions: Question[]
  calculateFeedback: boolean
  factors: Factor[]
  meansAndStandardDeviations?: NormalizationValues
  allowedNans?: number
  reportVariables?: {
    titleText: string
    name: string
    breed: string
  }
}

/**
 * Normalization vectors [mean] [std] for each question used to normalize question rates in
 * report calculations
 */
export interface NormalizationValues {
  /** [QuestionLabel: mean] also used for nan-value imputation */
  means: { [key: string]: number }
  /** [QuestionLabel: std] for normalization of the variable */
  standardDeviations: { [key: string]: number }
}

/**
 * RatedQuesiton[] | SurveyItem[]
 */
export interface SubmittedForm {
  answeredQuestions: RatedQuestion[] | SurveyItem[]
}

/** Contains information for calculating factorial analysis report
 */
export interface Factor {
  id: string
  label: string
  name: string
  description?: string
  /** [QuestionLabel: weight] to be multiplied with the chosen option value for given question after form submission */
  weights: { [key: string]: number }
  range?: {
    min: number
    max: number
  }
  score: number
  /** [breed: avg-score] to be compared to in the factor report */
  breedAvgs?: { [key: string]: number }
}

/** PublicSpec for Factorial survey contains only questions and options
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
  /** If marked as globalVariabel a <key: questionLabel, value: userAnswer> pair will be created upon submission and saved to the database, available in other exercises */
  globalVariable?: boolean
}

/** Condition for whether to display the question or not
 *  triggering questionLabel and option: if chosen by student will display the conditional SurveyItem */
export interface SurveyItemCondition {
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
  Dropdown = "dropdown-selection",
  ConsentCheckbox = "consent-checkbox",
  FileUpload = "file-upload",
}

export type PrivateSpec = FactorialSurvey | Survey | null

export type PublicSpec = PublicFactorialSurveySpec | Survey
