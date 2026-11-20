import { UserVariablesMap } from "@moocfi/exercise-protocol"
import { TFunction } from "i18next"

import { insertVariablesToText, UnansweredQuestion } from "./utils"

/** Unanswered questions named one by one; the rest are only counted. */
const MAX_NAMED_UNANSWERED_QUESTIONS = 3
const MAX_QUESTION_TEXT_LENGTH = 80

/** Question text as a short plain-text line, without markdown and the trailing "*" teachers use. */
const toQuestionSummary = (
  question: UnansweredQuestion,
  userVariables?: UserVariablesMap | null,
): string => {
  const text = insertVariablesToText(question.question, userVariables)
    .replace(/<[^>]*>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_#>`~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length === 0) {
    return question.questionLabel
  }
  return text.length > MAX_QUESTION_TEXT_LENGTH
    ? `${text.slice(0, MAX_QUESTION_TEXT_LENGTH - 1).trimEnd()}…`
    : text
}

/** Localized `validityMessages` naming the first unanswered questions and counting the rest. */
export const buildValidityMessages = (
  unanswered: UnansweredQuestion[],
  t: TFunction,
  userVariables?: UserVariablesMap | null,
): string[] => {
  const named = unanswered
    .slice(0, MAX_NAMED_UNANSWERED_QUESTIONS)
    .map((q) => t("answer-required-question", { question: toQuestionSummary(q, userVariables) }))
  const remainingCount = unanswered.length - named.length
  if (remainingCount > 0) {
    named.push(t("more-required-questions-unanswered", { count: remainingCount }))
  }
  return named
}
