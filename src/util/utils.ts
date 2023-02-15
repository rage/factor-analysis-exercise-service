import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"

import { Rate } from "./spec-types/grading"
import { SurveyItemCondition } from "./spec-types/privateSpec"
import {
  AnsweredSurveyItem,
  Factor,
  FactorialOption,
  FactorReport,
  NormalizationValues,
  Question,
  RatedQuestion,
  SurveyItem,
} from "./stateInterfaces"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const matrixMultiplication = require("matrix-multiplication")

/**
 * Calculates the scores for factors
 * @param factors contains the weight matrix to by multiplied with rated questions
 * @param rates used to create vector of scores for the matrix multiplication
 * @returns FactorReports with calculated score
 */
export const calculateFactors = (factors: Factor[], rates: Rate[]): FactorReport[] => {
  const report = factors.map((factor) => {
    let score = 0
    rates.map((item) => {
      if (typeof factor.weights[item.questionLabel] === "undefined") {
        console.log("Did not find data for question:", item.questionLabel)
        return
      }
      score = item.rate ? score + factor.weights[item.questionLabel] * item.rate : score
    })
    return { ...factor, score: score } as FactorReport
  })

  return report
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

export const getGlobalVariables = (
  answeredSurvey: AnsweredSurveyItem[],
  survey: SurveyItem[],
): UserVariablesMap | undefined => {
  const surveyItems: SurveyItem[] = survey.filter((item) => item.globalVariable === true)
  if (surveyItems.length > 0) {
    const globalVariables: UserVariablesMap = {}
    surveyItems.map((item) => {
      globalVariables[item.question.questionLabel] =
        answeredSurvey.find((i) => i.surveyItemId === item.id)?.answer ?? null
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
 * @param rates: list of question_label; rate pairs
 * @param meansAndStandardDeviations used to scale the answers before adding up the factors,
 * @param maxNanAllowed allowed limit amount of nan-answers, beyond which report is not calculated
 * @returns scaled ratedQuestions or null if max nan exceeded
 */
export const scaleAndImputRatedQuestions = (
  rates: Rate[],
  meansAndStandardDeviations: NormalizationValues | null,
  maxNanAllowed: number,
): Rate[] | null => {
  let amount = 0
  const scaledRates: Rate[] = rates.map((q) => {
    if (q.rate == null) {
      amount++
    }
    const scaledRate =
      q.rate != null && meansAndStandardDeviations
        ? (q.rate - meansAndStandardDeviations.means[q.questionLabel]) /
          meansAndStandardDeviations.standardDeviations[q.questionLabel]
        : q.rate ?? 0
    const scaledQuestion = { ...q, rate: scaledRate }
    return scaledQuestion
  })
  if (amount > maxNanAllowed) {
    return null
  }
  return scaledRates
}

export const mapRatesToAnswers = (
  options: FactorialOption[],
  ratedQuestions: RatedQuestion[],
): Rate[] => {
  const rates: Rate[] = ratedQuestions.map((q) => {
    return {
      questionLabel: q.questionLabel,
      rate: options.find((o) => o.name === q.chosenOption)?.value ?? null,
    }
  })
  return rates
}

export const checkCondition = (
  answeredItems: AnsweredSurveyItem[],
  dependsOn: SurveyItemCondition[],
): boolean => {
  const chosenAlternatives: SurveyItemCondition[] = answeredItems
    .filter((i) => i.answer)
    .map((i) => {
      if (Array.isArray(i.answer)) {
        return i.answer.map((it) => {
          return {
            questionLabel: i.questionLabel,
            triggeringOption: it,
          } as SurveyItemCondition
        })
      }
      return {
        questionLabel: i.questionLabel,
        triggeringOption: i.answer,
      } as SurveyItemCondition
    })
    .flat()

  const matchingOptions = chosenAlternatives.filter((alt) =>
    [dependsOn]
      .flat()
      .find(
        (obj) =>
          obj.questionLabel === alt.questionLabel && obj.triggeringOption === alt.triggeringOption,
      ),
  )
  return matchingOptions.length > 0
}

export const validateConditionConsistency = (surveyItems: SurveyItem[]) => {
  const possibleConditions = surveyItems
    .filter((i) => Array.isArray(i.answer.options))
    .map((i) => {
      return i.answer.options.map((it) => {
        return {
          questionLabel: i.question.questionLabel,
          triggeringOption: it,
        } as SurveyItemCondition
      })
    })
    .flat()

  const dependableItems = surveyItems
    .filter((i) => i.dependsOn)
    .map((i) => {
      return {
        questionLabel: i.question.questionLabel,
        conditions: [i.dependsOn].flat() as SurveyItemCondition[],
      }
    })

  const inconsistencies = dependableItems.filter((item) => {
    const unmet = item.conditions.filter(
      (con) =>
        !possibleConditions.find(
          (obj) =>
            obj.questionLabel === con.questionLabel &&
            obj.triggeringOption === con.triggeringOption,
        ),
    )
    if (unmet.length) {
      return { ...item, conditions: unmet }
    }
  })
  console.log(inconsistencies)
  return inconsistencies
}
