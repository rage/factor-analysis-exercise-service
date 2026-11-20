import { Survey } from "./spec-types/privateSpec"
import { PublicFactorialSurveySpec } from "./spec-types/publicSpec"
import { AnsweredSurveyItem, RatedQuestion } from "./spec-types/userAnswer"
import { clearHiddenAnswers } from "./utils"

type SurveyItemAnswer = AnsweredSurveyItem["answer"]

const isSurveyItemAnswer = (value: unknown): value is SurveyItemAnswer =>
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  (Array.isArray(value) && value.every((v) => typeof v === "string"))

const draftEntries = (draft: unknown): Record<string, unknown>[] => {
  if (draft === null || typeof draft !== "object") {
    return []
  }
  const entries = (draft as { answeredQuestions?: unknown }).answeredQuestions
  if (!Array.isArray(entries)) {
    return []
  }
  return entries.filter((entry) => entry !== null && typeof entry === "object")
}

/** Sets one item's answer and clears the answers of the items that the change hides. */
export const applySurveyAnswer = (
  survey: Survey,
  answeredItems: AnsweredSurveyItem[],
  surveyItemId: string,
  answer: SurveyItemAnswer,
): AnsweredSurveyItem[] =>
  clearHiddenAnswers(
    survey.content,
    answeredItems.map((a) => (a.surveyItemId === surveyItemId ? { ...a, answer } : a)),
  )

/**
 * The answer list a survey form starts from: one entry per answerable item, filled from `draft`
 * (a previously reported `UserAnswer`) where it has a well-formed answer for the same item id.
 */
export const restoreSurveyAnswers = (survey: Survey, draft: unknown): AnsweredSurveyItem[] => {
  const entries = draftEntries(draft)
  const answeredItems = survey.content
    .filter((item) => item.question.questionLabel !== "info")
    .map((item) => {
      const saved = entries.find((entry) => entry.surveyItemId === item.id)?.answer
      return {
        surveyItemId: item.id,
        questionLabel: item.question.questionLabel,
        answer: isSurveyItemAnswer(saved) ? saved : null,
      }
    })
  return clearHiddenAnswers(survey.content, answeredItems)
}

/** Sets the chosen option of every factorial question with the label. */
export const applyRating = (
  ratedQuestions: RatedQuestion[],
  questionLabel: string,
  chosenOptionId: string,
): RatedQuestion[] =>
  ratedQuestions.map((q) => (q.questionLabel === questionLabel ? { ...q, chosenOptionId } : q))

/**
 * The ratings a factorial form starts from, filled from `draft` where it names an existing option
 * for the same question label.
 */
export const restoreRatings = (
  spec: PublicFactorialSurveySpec,
  draft: unknown,
): RatedQuestion[] => {
  const entries = draftEntries(draft)
  const optionIds = new Set(spec.options.map((o) => o.id))
  return spec.questions
    .filter((q) => q.questionLabel !== "info")
    .map((q) => {
      const saved = entries.find((entry) => entry.questionLabel === q.questionLabel)?.chosenOptionId
      return {
        questionLabel: q.questionLabel,
        chosenOptionId: typeof saved === "string" && optionIds.has(saved) ? saved : "",
      }
    })
}
