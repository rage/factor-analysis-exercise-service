import { FactorialOption, Question, Survey, SurveyType } from "./privateSpec"

export interface ClientErrorResponse {
  message: string
}

export type PublicSpec = PublicFactorialSurveySpec | Survey

/** PublicSpec for Factorial survey contains only questions and options
 */
export interface PublicFactorialSurveySpec {
  id: string
  type: SurveyType.Factorial
  options: FactorialOption[]
  questions: Question[]
}
