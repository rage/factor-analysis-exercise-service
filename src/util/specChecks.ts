/* eslint-disable i18next/no-literal-string */
import {
  AnswerType,
  PrivateSpec,
  SurveyItem,
  SurveyItemCondition,
  SurveyType,
} from "./spec-types/privateSpec"
import { PublicFactorialSurveySpec, PublicSpec } from "./spec-types/publicSpec"
import { hasAnswerInput, isConditionalItem, offeredOptions } from "./utils"

/** Which check produced a `SpecFinding`. */
type SpecFindingKind =
  | "mandatory-without-input"
  | "condition-missing-option"
  | "mandatory-never-shown"

/** A spec mistake: a mandatory question students cannot answer or a condition that never holds. */
export interface SpecFinding {
  kind: SpecFindingKind
  /** Id of the survey item or factorial question the finding is about. */
  itemId: string
  questionLabel: string
  message: string
}

const INFO_LABEL = "info"

const CHOICE_TYPES = [
  AnswerType.MultiChoice,
  AnswerType.RadioGroup,
  AnswerType.Dropdown,
  AnswerType.AdvancedDropdown,
  AnswerType.WeightedRadioGroup,
]

const conditionsOf = (item: SurveyItem) => [item.dependsOn ?? []].flat()

const offersOption = (trigger: SurveyItem, condition: SurveyItemCondition): boolean =>
  trigger.question.questionLabel !== INFO_LABEL &&
  trigger.question.questionLabel === condition.questionLabel &&
  offeredOptions(trigger).includes(condition.triggeringOption)

/** Mandatory items the student cannot answer, e.g. no answer type or a choice without options. */
export const findMandatoryWithoutInput = (content: SurveyItem[]): SpecFinding[] =>
  content
    .filter((item) => item.question.mandatory && !hasAnswerInput(item))
    .map((item) => ({
      kind: "mandatory-without-input",
      itemId: item.id,
      questionLabel: item.question.questionLabel,
      message: `"${item.question.questionLabel}" is mandatory but has no input (answer type "${
        item.answer.type
      }"${
        CHOICE_TYPES.includes(item.answer.type) ? " without options" : ""
      }); students cannot answer it.`,
    }))

/** Conditional items that depend on a label and option no answerable item offers. */
export const findConditionsWithMissingOptions = (content: SurveyItem[]): SpecFinding[] =>
  content.flatMap((item) => {
    const missing = conditionsOf(item).filter(
      (condition) => !content.some((trigger) => offersOption(trigger, condition)),
    )
    if (missing.length === 0) {
      return []
    }
    return [
      {
        kind: "condition-missing-option" as const,
        itemId: item.id,
        questionLabel: item.question.questionLabel,
        message: `"${item.question.questionLabel}" depends on options that no item offers: ${missing
          .map((condition) => `${condition.questionLabel} = "${condition.triggeringOption}"`)
          .join(", ")}.`,
      },
    ]
  })

/** Ids of the items that some combination of answers shows. */
const findShowableItemIds = (content: SurveyItem[]): Set<string> => {
  const showable = new Set(
    content.filter((item) => !isConditionalItem(item)).map((item) => item.id),
  )
  let changed = true
  while (changed) {
    changed = false
    for (const item of content) {
      if (showable.has(item.id)) {
        continue
      }
      const canTrigger = conditionsOf(item).some((condition) =>
        content.some((trigger) => showable.has(trigger.id) && offersOption(trigger, condition)),
      )
      if (canTrigger) {
        showable.add(item.id)
        changed = true
      }
    }
  }
  return showable
}

/** Mandatory conditional items that no combination of answers shows. */
export const findMandatoryNeverShown = (content: SurveyItem[]): SpecFinding[] => {
  const showable = findShowableItemIds(content)
  return content
    .filter((item) => item.question.mandatory && !showable.has(item.id))
    .map((item) => ({
      kind: "mandatory-never-shown",
      itemId: item.id,
      questionLabel: item.question.questionLabel,
      message: `"${item.question.questionLabel}" is mandatory but no answers satisfy its conditions, so it is never shown.`,
    }))
}

/** Runs every check for a non-factorial survey's items. */
export const checkSurveyContent = (content: SurveyItem[]): SpecFinding[] => [
  ...findMandatoryWithoutInput(content),
  ...findConditionsWithMissingOptions(content),
  ...findMandatoryNeverShown(content),
]

/** Mandatory factorial questions that cannot be answered. */
export const checkFactorialSpec = (
  spec: Pick<PublicFactorialSurveySpec, "options" | "questions">,
): SpecFinding[] =>
  spec.questions
    .filter(
      (question) =>
        question.mandatory &&
        (question.questionLabel === INFO_LABEL || (spec.options ?? []).length === 0),
    )
    .map((question) => ({
      kind: "mandatory-without-input",
      itemId: question.id,
      questionLabel: question.questionLabel,
      message:
        question.questionLabel === INFO_LABEL
          ? `An "info" row is mandatory but has nothing to answer.`
          : `"${question.questionLabel}" is mandatory but the survey has no answer options; students cannot submit.`,
    }))

/** Runs the checks for the spec's survey type; accepts public and private specs. */
export const checkSpec = (spec: PublicSpec | PrivateSpec): SpecFinding[] => {
  switch (spec?.type) {
    case SurveyType.NonFactorial:
      return checkSurveyContent(spec.content ?? [])
    case SurveyType.Factorial:
      return checkFactorialSpec(spec)
    default:
      return []
  }
}
