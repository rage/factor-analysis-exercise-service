export type PrivateSpec = FactorialSurvey | Survey | null

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
    titleText?: string
    reportFailureMessage?: string
    reportSuccessMessage?: string | null
    userVariable?: ReportVariable
    comparingVariable?: ReportVariable
    zeroVariable?: ReportVariable
  }
}

/** A grouping of non-factorial questions, cannot be right or wrong. */
export interface Survey {
  id: string
  /** All surveys are non-factorial */
  type: SurveyType.NonFactorial
  /** List of things to be displayed */
  content: SurveyItem[]
  /** Rendered to student upon submission. */
  reportSuccessMessage?: string | null
}

/** Specifies the types of possible surveys */
export enum SurveyType {
  /** Contains identical answering options, calculates report based on predefined weights and user answers */
  Factorial = "factorial",
  /** Contains arbitrary asurvey elements with arbitrary answering possibilities */
  NonFactorial = "non-factorial",
}

/** Answer option for rating factorial survey questions
 */
export interface FactorialOption {
  id: string
  /** What is shown to the survey user e.g. "yes" or "no". */
  name: string
  /** The number this option maps to, i.e. numerical value used in factor computation. */
  value: number | null
}

/** Survey item can either be a question to ask or just an info-element. */
export interface Question {
  /** Unique identifier. Why does this one exist when there is the questionLabel, too? questionLabels are not unique because the "info" label may occur multiple times and questionLabels can be repeated across surveys. */
  id: string
  /** Question identification label, human readable, provided by the teacher. Examples: "hobby_frequency_home", "hobby_frequency_out". The "info" label can occur multiple times and cannot be answered to.
   *
   * In factorial analysis: used as keys for factor weight retrieval
   * In non-factorial surveys: use as an identifier when conditionally rendering questions to students
   */
  questionLabel: string
  /** The question shown to the survey user */
  question: string
}

/** Contains information for calculating factorial analysis report
 */
export interface Factor {
  id: string
  /** Unique identifier for factor. Provided by the teacher. Examples "insecurity", "training_focus". */
  label: string
  /** Factor name shown to the student as factor title. */
  name: string
  /** Text describing the factor. */
  description?: string
  /** Weigths associated with the questions used in factor score calculation. [QuestionLabel: weight] for each question, a value (weight) to be multiplied with the chosen option value after form submission . */
  weights: { [key: string]: number }
  /** The range of the factor. The factor may get score values between min and max. */
  range?: {
    min: number
    max: number
  }
  /** The value of main average that the calculated user score will be compared to on the factor report. This value is defined by the teacher. If not defined, zero is used (0). */
  mainComparingVar?: number
  /** Another value that the user may be compared toin the factor report based on the user answer to a previuos surveyItem marked "globalVariable".
   * [variableKey: [variableItem: avg-score] ] variableKey is the questionLabel of the global survey item, [variableItem: avg-score] is the list of the answer options for that survey item, toghether with their values. */
  comparingVariable?: { [key: string]: { [key: string]: number } }
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

/** Legend key used with factor range to display score after answering factorial survey. */
export interface ReportVariable {
  //TODO RENAME to legend key or sopmething
  /** The label for the legend key displayed to the user if global key is not defined. Example "The average of all submitted surveys". */
  label?: string
  /** Refering to a global variable derived from a previuos user answer used to label the legend key. This key is the questionLabel of the survey item marked "globalVariable". */
  globalKey?: string
  /** A name that identifies the graphical icon representing the score on the report scale. */
  logo?: string
}

/** Defines one question or info-element of the non-factorial survey. */
export interface SurveyItem {
  id: string
  /** What is asked from the student. */
  question: Question
  /** Specifies how this item can be answered. */
  answer: Answer
  /** Defines if question is rendered conditionally */
  conditional: boolean
  /** If this item is conditional, this one defines the rule for the condition. */
  dependsOn?: SurveyItemCondition[]
  /** If marked as globalVariabel a <key: questionLabel, value: userAnswer> pair will be created upon submission and saved to the database, available in other exercises */
  globalVariable?: boolean
}

/** Specifies how a non-factorial survey item can be answered. */
export interface Answer {
  // TODO poistetaan se
  id: string
  /** Specifies the kind of answer required. */
  type: AnswerType
  /** The list of predefined options student can choose from. Examples ["yes", "no", "maybe"] or ["dog", "cat", "horse"]. */
  options: string[]
}

/** Specifies the types of possible answers. */
export enum AnswerType {
  /** This survey item cannot be answered to. */
  None = "",
  /** Can be answered with free text. */
  Text = "text",
  /** Types a number. */
  Number = "number",
  /** Select multiple options from a list */
  MultiChoice = "multiple-choice",
  /** Select one option from a list, shown as a radio group. */
  RadioGroup = "radio-group",
  /** Select a date from a calendar drop-down */
  Date = "date",
  /** Select one option from a drop-down menu */
  Dropdown = "dropdown-selection",
  /** Will be removed. Copntains one option only, checkbox. */
  ConsentCheckbox = "consent-checkbox",
  /** Not supported */
  FileUpload = "file-upload",
  /** Select one option from a drop-down menu, where one can filter available options by typing. */
  AdvancedDropdown = "advanced-dropdown",
}

/** Condition for whether to display the question or not
 * Triggering item must be from the same Survey.
 * Triggering questionLabel and option: if the triggering option is chosen by the student, the conditional survey item will be displayed.
 */
export interface SurveyItemCondition {
  /** Identifier, refers to the questionLabel in the Question interface */
  questionLabel: string
  /** Refers to one of the options in the options list in the Answer interface */
  triggeringOption: string
}
