import { ItemWithCondition } from "../components/Survey/Editors/SurveyEditor"
import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"

import { FactorReport, Rate } from "./spec-types/grading"
import {
  AnswerType,
  Factor,
  FactorialOption,
  NormalizationValues,
  Question,
  SurveyItem,
  SurveyItemCondition,
  SurveyType,
} from "./spec-types/privateSpec"
import { PublicSpec } from "./spec-types/publicSpec"
import { AnsweredSurveyItem, RatedQuestion, UserAnswer } from "./spec-types/userAnswer"

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
      rate: options.find((o) => o.id === q.chosenOptionId)?.value ?? null,
    }
  })
  return rates
}

/** Check if the the dependsOn condition is met, that is, the triggering option is amongst the answered items */
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
    .filter((i) => Array.isArray(i.answer.options) || Array.isArray(i.answer.factorialOptions))
    .map((i) => {
      if (i.answer.factorialOptions) {
        return i.answer.factorialOptions.map((fop) => {
          return {
            questionLabel: i.question.questionLabel,
            triggeringOption: fop.name,
          } as SurveyItemCondition
        })
      }
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

  const inconsistencies = dependableItems
    .map((item) => {
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
    .filter((item) => item !== undefined)

  return inconsistencies as ItemWithCondition[]
}

/** A required question that an answer leaves unanswered. */
export interface UnansweredQuestion {
  /** Survey item id for non-factorial surveys, question id for factorial ones. */
  id: string
  questionLabel: string
  question: string
}

/**
 * Parses a number the way a student may type it: decimal comma or point, spaces as thousand
 * separators. Returns null for anything else, including the empty string.
 */
export const parseDecimal = (text: string): number | null => {
  const normalized = text.replace(/\s/g, "").replace(",", ".")
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(normalized)) {
    return null
  }
  return Number(normalized)
}

/** Whether the item is shown to the student, given the current answers. */
export const isSurveyItemShown = (item: SurveyItem, answeredItems: AnsweredSurveyItem[]): boolean =>
  !item.conditional || !item.dependsOn || checkCondition(answeredItems, item.dependsOn)

/**
 * Clears the answers of items whose condition no longer holds, repeating until stable so that
 * items depending on a cleared item are cleared too. Returns the input when nothing changes.
 */
export const clearHiddenAnswers = (
  surveyItems: SurveyItem[],
  answeredItems: AnsweredSurveyItem[],
): AnsweredSurveyItem[] => {
  let current = answeredItems
  for (;;) {
    const hiddenIds = new Set(
      surveyItems.filter((item) => !isSurveyItemShown(item, current)).map((item) => item.id),
    )
    if (!current.some((a) => hiddenIds.has(a.surveyItemId) && a.answer !== null)) {
      return current
    }
    current = current.map((a) =>
      hiddenIds.has(a.surveyItemId) && a.answer !== null ? { ...a, answer: null } : a,
    )
  }
}

/** Whether the item renders something the student can answer with. */
export const hasAnswerInput = (item: SurveyItem): boolean => {
  if (item.question.questionLabel === "info") {
    return false
  }
  switch (item.answer.type) {
    case AnswerType.Text:
    case AnswerType.Number:
    case AnswerType.Date:
    case AnswerType.ConsentCheckbox:
      return true
    case AnswerType.RadioGroup:
    case AnswerType.Dropdown:
    case AnswerType.MultiChoice:
    case AnswerType.AdvancedDropdown:
      return (item.answer.options?.length ?? 0) > 0
    case AnswerType.WeightedRadioGroup:
      return (item.answer.factorialOptions?.length ?? 0) > 0
    default:
      return false
  }
}

const isAnswerGiven = (item: SurveyItem, answer: AnsweredSurveyItem["answer"] | undefined) => {
  if (Array.isArray(answer)) {
    return answer.length > 0
  }
  if (typeof answer === "number") {
    return Number.isFinite(answer)
  }
  if (typeof answer !== "string") {
    return false
  }
  if (item.answer.type === AnswerType.Number) {
    return parseDecimal(answer) !== null
  }
  return answer.trim().length > 0
}

// Submissions reach the grade endpoint unchecked, so tolerate any shape.
const answerEntries = <T>(userAnswer: UserAnswer | null | undefined): T[] => {
  const entries: unknown = userAnswer?.answeredQuestions
  if (!Array.isArray(entries)) {
    return []
  }
  return entries.filter((entry) => entry !== null && typeof entry === "object") as T[]
}

/**
 * Lists the required questions the answer leaves unanswered, in form order. Non-factorial items
 * are matched by survey item id; items hidden by their condition (also through a hidden trigger)
 * or rendering no input are not required. Shared by the iframe and the grade endpoint.
 */
export const findUnansweredQuestions = (
  spec: PublicSpec,
  userAnswer: UserAnswer | null | undefined,
): UnansweredQuestion[] => {
  switch (spec.type) {
    case SurveyType.Factorial: {
      const ratedQuestions = answerEntries<RatedQuestion>(userAnswer)
      return spec.questions
        .filter((q) => q.mandatory && q.questionLabel !== "info")
        .filter((q) => {
          const chosenOptionId = ratedQuestions.find(
            (item) => item.questionLabel === q.questionLabel,
          )?.chosenOptionId
          return typeof chosenOptionId !== "string" || chosenOptionId.length === 0
        })
        .map((q) => ({ id: q.id, questionLabel: q.questionLabel, question: q.question }))
    }
    case SurveyType.NonFactorial: {
      const answeredItems = clearHiddenAnswers(
        spec.content,
        answerEntries<AnsweredSurveyItem>(userAnswer),
      )
      return spec.content
        .filter(
          (item) =>
            item.question.mandatory &&
            hasAnswerInput(item) &&
            isSurveyItemShown(item, answeredItems) &&
            !isAnswerGiven(item, answeredItems.find((a) => a.surveyItemId === item.id)?.answer),
        )
        .map((item) => ({
          id: item.id,
          questionLabel: item.question.questionLabel,
          question: item.question.question,
        }))
    }
    default:
      return []
  }
}

export const calculateSumFactorScore = (
  surveyContent: SurveyItem[],
  answeredQuestions: AnsweredSurveyItem[],
): number | null => {
  const weightedItems = surveyContent.filter(
    (obj) => obj.answer.type === AnswerType.WeightedRadioGroup,
  )

  let score = 0
  weightedItems.map((item) => {
    const answeredItem = answeredQuestions.find((ans) => {
      return ans.surveyItemId === item.id
    })
    score +=
      item.answer.factorialOptions?.find((opt) => {
        return opt.name === answeredItem?.answer
      })?.value ?? 0
  })

  return score
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
export const getTextWidth = (text: string, font: string): number => {
  // re-use canvas object for better performance
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (context) {
    context.font = font
    const metrics = context.measureText(text)
    return metrics.width
  }
  return 0
}
