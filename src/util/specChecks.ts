/* eslint-disable i18next/no-literal-string */
import { AnswerType, PrivateSpec, SurveyItem, SurveyType } from "./spec-types/privateSpec"
import { PublicFactorialSurveySpec, PublicSpec } from "./spec-types/publicSpec"
import { validateConditionConsistency } from "./utils"

export type SpecFindingKind =
  | "shadowed-duplicate-label"
  | "mandatory-without-input"
  | "condition-missing-option"
  | "mandatory-never-shown"
  | "mandatory-number"

/** A spec problem that can stop students from submitting or make the form behave unexpectedly. */
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
]

const isChoiceType = (type: AnswerType) =>
  CHOICE_TYPES.includes(type) || type === AnswerType.WeightedRadioGroup

const offeredOptions = (item: SurveyItem): string[] =>
  item.answer.type === AnswerType.WeightedRadioGroup
    ? (item.answer.factorialOptions ?? []).map((option) => option.name)
    : item.answer.options ?? []

/** Mirrors the cases `SurveyExerciseItem` renders an input for. */
const hasInput = (item: SurveyItem): boolean => {
  if (item.question.questionLabel === INFO_LABEL) {
    return false
  }
  if (isChoiceType(item.answer.type)) {
    return offeredOptions(item).length > 0
  }
  return [AnswerType.Text, AnswerType.Number, AnswerType.Date, AnswerType.ConsentCheckbox].includes(
    item.answer.type,
  )
}

const conditionsOf = (item: SurveyItem) => [item.dependsOn ?? []].flat()

/** Matches `SurveyExercise`: only items with both `conditional` and `dependsOn` are ever hidden. */
const isHideable = (item: SurveyItem): boolean => item.conditional && item.dependsOn !== undefined

/**
 * Mandatory items whose answer `validateAnsweredQuestions` reads from an earlier item with the same
 * label, so they count as unanswered whenever that item is hidden or left empty.
 */
export const findShadowedDuplicateLabels = (content: SurveyItem[]): SpecFinding[] => {
  const firstIndexByLabel = new Map<string, number>()
  const findings: SpecFinding[] = []
  content.forEach((item, index) => {
    const label = item.question.questionLabel
    if (label === INFO_LABEL) {
      return
    }
    const firstIndex = firstIndexByLabel.get(label)
    if (firstIndex === undefined) {
      firstIndexByLabel.set(label, index)
      return
    }
    const first = content[firstIndex]
    if (!item.question.mandatory || (!isHideable(first) && first.question.mandatory)) {
      return
    }
    findings.push({
      kind: "shadowed-duplicate-label",
      itemId: item.id,
      questionLabel: label,
      message: `Mandatory item #${index + 1} shares the label "${label}" with ${
        isHideable(first) ? "conditional" : "optional"
      } item #${
        firstIndex + 1
      }, whose answer is checked instead; students may be unable to submit.`,
    })
  })
  return findings
}

/** Mandatory items the student cannot answer, e.g. no answer type or a choice without options. */
export const findMandatoryWithoutInput = (content: SurveyItem[]): SpecFinding[] =>
  content
    .filter((item) => item.question.mandatory && !hasInput(item))
    .map((item) => ({
      kind: "mandatory-without-input",
      itemId: item.id,
      questionLabel: item.question.questionLabel,
      message: `"${item.question.questionLabel}" is mandatory but has no input (answer type "${
        item.answer.type
      }"${
        isChoiceType(item.answer.type) ? " without options" : ""
      }); students cannot submit while it is shown.`,
    }))

/** Conditional items that depend on a label and option no answerable item offers. */
export const findConditionsWithMissingOptions = (content: SurveyItem[]): SpecFinding[] => {
  const inconsistencies = validateConditionConsistency(content)
  return content.flatMap((item) => {
    const unmetConditions = inconsistencies
      .filter((inconsistency) => inconsistency.questionLabel === item.question.questionLabel)
      .flatMap((inconsistency) => inconsistency.conditions)
    const missing = conditionsOf(item).filter((condition) =>
      unmetConditions.some(
        (unmet) =>
          unmet.questionLabel === condition.questionLabel &&
          unmet.triggeringOption === condition.triggeringOption,
      ),
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
}

/** Ids of the items that some combination of answers shows. */
const findShowableItemIds = (content: SurveyItem[]): Set<string> => {
  const showable = new Set(content.filter((item) => !isHideable(item)).map((item) => item.id))
  let changed = true
  while (changed) {
    changed = false
    for (const item of content) {
      if (showable.has(item.id)) {
        continue
      }
      const canTrigger = conditionsOf(item).some((condition) =>
        content.some(
          (trigger) =>
            showable.has(trigger.id) &&
            trigger.question.questionLabel !== INFO_LABEL &&
            trigger.question.questionLabel === condition.questionLabel &&
            offeredOptions(trigger).includes(condition.triggeringOption),
        ),
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

/** Mandatory number fields: browsers report text like "n. 5" as empty while still showing it. */
export const findMandatoryNumberItems = (content: SurveyItem[]): SpecFinding[] =>
  content
    .filter((item) => item.question.mandatory && item.answer.type === AnswerType.Number)
    .map((item) => ({
      kind: "mandatory-number",
      itemId: item.id,
      questionLabel: item.question.questionLabel,
      message: `"${item.question.questionLabel}" is a mandatory number field; some browsers treat non-numeric input as empty and block submitting.`,
    }))

/** Runs every check for a non-factorial survey's items. */
export const checkSurveyContent = (content: SurveyItem[]): SpecFinding[] => [
  ...findShadowedDuplicateLabels(content),
  ...findMandatoryWithoutInput(content),
  ...findConditionsWithMissingOptions(content),
  ...findMandatoryNeverShown(content),
  ...findMandatoryNumberItems(content),
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
          ? `An "info" row is mandatory but cannot be answered; students cannot submit.`
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
