import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"

import { Factor, NormalizationValues, Question, RatedQuestion, SurveyItem } from "./stateInterfaces"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const matrixMultiplication = require("matrix-multiplication")

/**
 * Calculates the scores for factors
 * @param factors contains the weight matrix to by multiplied with rated questions
 * @param ratedQuestions used to create vector of scores for the matrix multiplication
 * @returns factors with calculated score
 */
export const calculateFactors = (factors: Factor[], ratedQuestions: RatedQuestion[]): Factor[] => {
  // If have to use number[][] as the weights matrix in some parts
  /* const matrix = survey.matrix

  factors.map((f, f_idx) => {
    let score = 0
    ratedQuestions.map((q, q_idx) => {
      score = q.rate ? score + matrix[q_idx][f_idx] * q.rate : score
    })
    f.score = score
  })

  // create the rate vector to be multiplied with matrix, substitute null values with zero, LATER: use average imputation values from the research group
  const questionRateVector = ratedQuestions.map((rq) => rq.rate ?? 0)
  const result = vectorMatrixMultiplication(questionRateVector, matrix)
  console.log(result) */

  factors.map((factor) => {
    factor.score = 0
    ratedQuestions.map((item) => {
      if (typeof factor.weights[item.questionLabel] === "undefined") {
        console.log("Did not find data for question:", item.questionLabel)
        return
      }

      factor.score = item.rate
        ? factor.score + factor.weights[item.questionLabel] * item.rate
        : factor.score
    })
  })

  return factors
}

/**
 * parses one row from the list of raw questionLabel;questiontext string
 * @param input string
 * @returns [questionLabel: string, questionText: string]
 */
export const parseLabelQuestion = (input: string): string[] | null => {
  const parsedString = input.split(";")
  if (!parsedString[0] || !parsedString[1]) {
    return null
  }
  const [label, ...text] = parsedString

  const labelQuestion = [label.split("\n").join("").split(" ").join(""), text.join(";")]
  return labelQuestion
}

/**
 * reverses parsing of questionLabel;question raw string needed for the textArea value to work properly
 * @param label string
 * @param question string
 * @returns string: "label;question"
 */
export const reverseParseLabelQuestion = (label: string, question: string): string => {
  if (label.length > 0) {
    return label + ";" + question
  }
  return ""
}

/**
 * Performs vector [1*n] and matrix [n*k] multiplication
 * @param questionVector number[] dim n
 * @param matrix number[][] dim n*k
 * @returns number[] dim k
 */
export const vectorMatrixMultiplication = (
  questionVector: number[],
  matrix: number[][],
): number[][] => {
  const middle = questionVector.length
  const mul = matrixMultiplication()(middle)
  if (matrixMultiplication.error.length) {
    console.log(matrixMultiplication.error)
  }
  const collapsedMatrix = matrix.flat()
  return mul(questionVector, collapsedMatrix)
}

/**
 * Clenses survey item list for info items, returns set of only answerable survey items
 * @param questions RatedQuestion[] | Question[]
 * @returns RatedQuestion[] | Question[]
 */
export const sanitizeQuestions = (questions: QuestionItem[]) => {
  const sanitizedForm = questions.filter(
    (item: Question | RatedQuestion) => item.questionLabel !== "info",
  )
  return sanitizedForm
}

type QuestionItem = RatedQuestion | Question

export const getGlobalVariables = (answeredSurvey: SurveyItem[]): UserVariablesMap | undefined => {
  const surveyItems: SurveyItem[] = answeredSurvey.filter((item) => item.globalVariable === true)
  if (surveyItems.length > 0) {
    const globalVariables: UserVariablesMap = {}
    surveyItems.map((item) => {
      globalVariables[item.question.questionLabel] = item.answer.answer
    })
    return globalVariables
  }
}

interface LabelValuePair {
  label: string
  val: string
}

/**
 * prossesses text replacing the referrences to global variables with user's
 * variables, or default values
 *
 * @param textItem text to process, string
 * @param userVaiablesMap Map or null
 * @returns processed text
 */
export const insertVariablesToText = (
  textItem: string,
  userVaiablesMap?: UserVariablesMap | null,
): string => {
  // format of variable is ${question_label=default_value}
  const regexp = /\$\{[\w\s-]*=[\w\s-]*\}/g
  const matches = [...textItem.matchAll(regexp)]
  const values = new Map<string, LabelValuePair>()
  matches?.map((match) => {
    match.map((l) => {
      const strippedString = l.replace("${", "").replace("}", "")
      const pair = strippedString.split("=")
      values.set(l, {
        label: pair[0],
        val: userVaiablesMap ? userVaiablesMap[pair[0]] ?? pair[1] : pair[1],
      } as LabelValuePair)
      return pair
    })
  })
  let newContent = textItem
  matches?.map((match) => {
    match.map((m) => {
      newContent = newContent.replace(m, (values.get(m) as LabelValuePair).val)
    })
  })
  return newContent
}

/**
 *
 * @param ratedQuestions used to create vector of scores for the matrix multiplication
 * @param meansAndStandardDeviations used to scale the answers before adding up the factors,
 * means also used to impute nan-answers
 * @param maxNanAllowed allowed limit amount of nan-answers, beyond which report is not calculated
 * @returns scaled ratedQuestions or null if max nan exceeded
 */
export const scaleRatedQuestions = (
  ratedQuestions: RatedQuestion[],
  meansAndStandardDeviations: NormalizationValues,
  maxNanAllowed: number,
): RatedQuestion[] | null => {
  let amount = 0
  const questions: RatedQuestion[] = ratedQuestions.map((q) => {
    if (!q.rate) {
      amount++
    }
    const rate = q.rate
      ? (q.rate - meansAndStandardDeviations.means[q.questionLabel]) /
        meansAndStandardDeviations.standardDeviations[q.questionLabel]
      : meansAndStandardDeviations.means[q.questionLabel]
    const scaledQuestion = { ...q, rate: rate }
    return scaledQuestion
  })
  if (amount > maxNanAllowed) {
    console.log(amount, maxNanAllowed, amount > maxNanAllowed)
    return null
  }
  return questions
}
