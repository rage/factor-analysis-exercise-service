/* eslint-disable i18next/no-literal-string */
import { createInstance, TFunction } from "i18next"
import type { NextApiRequest, NextApiResponse } from "next"
import React from "react"
import { createRoot, Root } from "react-dom/client"
import { act } from "react-dom/test-utils"
import { initReactI18next } from "react-i18next"

import Exercise from "../src/components/Exercise"
import grade from "../src/pages/api/grade"
import {
  CurrentStateMessage,
  SetStateMessage,
} from "../src/shared-module/exercise-service-protocol-types"
import {
  isAnswerExerciseIframeState,
  isCurrentStateMessage,
  isFocusFirstInvalidMessage,
  isMessageToIframe,
} from "../src/shared-module/exercise-service-protocol-types.guard"
import fiTranslations from "../src/shared-module/locales/fi/factorial-survey.json"
import {
  clearSubmittedAnswerDraft,
  loadAnswerDraft,
  pickAnswerDraft,
  saveAnswerDraft,
} from "../src/util/answerDraft"
import { buildCurrentStateMessage, buildValidityMessages } from "../src/util/currentState"
import { requestFocusFirstInvalid } from "../src/util/focusFirstInvalid"
import {
  AnswerType,
  FactorialSurvey,
  Survey,
  SurveyItem,
  SurveyItemCondition,
  SurveyType,
} from "../src/util/spec-types/privateSpec"
import { PublicFactorialSurveySpec, PublicSpec } from "../src/util/spec-types/publicSpec"
import { AnsweredSurveyItem, RatedQuestion, UserAnswer } from "../src/util/spec-types/userAnswer"
import {
  applyRating,
  applySurveyAnswer,
  restoreRatings,
  restoreSurveyAnswers,
} from "../src/util/surveyAnswers"
import { findUnansweredQuestions, parseDecimal } from "../src/util/utils"

import alustaArkuusFactorial from "./test-data/alusta-arkuus/factorial-public-spec.json"
import alustaArkuusSurvey from "./test-data/alusta-arkuus/non-factorial-public-spec.json"

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const i18n = createInstance()

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: "fi",
    ns: ["factorial-survey"],
    defaultNS: "factorial-survey",
    resources: { fi: { "factorial-survey": fiTranslations } },
    interpolation: { escapeValue: false },
  })
})

afterEach(() => {
  jest.restoreAllMocks()
  window.sessionStorage.clear()
})

const t = i18n.t.bind(i18n) as TFunction

interface ItemOptions {
  type?: AnswerType
  options?: string[]
  mandatory?: boolean
  dependsOn?: SurveyItemCondition[]
  question?: string
}

const surveyItem = (id: string, questionLabel: string, opts: ItemOptions = {}): SurveyItem => ({
  id,
  question: {
    id: `q-${id}`,
    questionLabel,
    question: opts.question ?? `Question ${id}?`,
    mandatory: opts.mandatory ?? true,
  },
  answer: { type: opts.type ?? AnswerType.Text, options: opts.options ?? [] },
  conditional: opts.dependsOn !== undefined,
  dependsOn: opts.dependsOn,
})

const survey = (content: SurveyItem[], id = "survey-1"): Survey => ({
  id,
  type: SurveyType.NonFactorial,
  content,
})

const answersOf = (
  spec: Survey,
  answers: Record<string, AnsweredSurveyItem["answer"]>,
): UserAnswer => ({
  answeredQuestions: restoreSurveyAnswers(spec, {
    answeredQuestions: Object.entries(answers).map(([surveyItemId, answer]) => ({
      surveyItemId,
      answer,
    })),
  }),
})

// Unlike answersOf, keeps answers of hidden items, as a stale or hand-crafted submission would.
const rawAnswersOf = (
  spec: Survey,
  answers: Record<string, AnsweredSurveyItem["answer"]>,
): UserAnswer => ({
  answeredQuestions: spec.content.map((item) => ({
    surveyItemId: item.id,
    questionLabel: item.question.questionLabel,
    answer: answers[item.id] ?? null,
  })),
})

const unansweredIds = (spec: PublicSpec, answer: UserAnswer) =>
  findUnansweredQuestions(spec, answer).map((q) => q.id)

const yesNo = { type: AnswerType.RadioGroup, options: ["yes", "no"] }

// Two variants of one question share a label so that the export keeps one column.
const duplicateLabelSurvey = survey([
  surveyItem("group", "group", { type: AnswerType.RadioGroup, options: ["a", "b"] }),
  surveyItem("variant-a", "dup", {
    dependsOn: [{ questionLabel: "group", triggeringOption: "a" }],
  }),
  surveyItem("variant-b", "dup", {
    dependsOn: [{ questionLabel: "group", triggeringOption: "b" }],
  }),
])

const chainedSurvey = survey([
  surveyItem("first", "first", yesNo),
  surveyItem("second", "second", {
    ...yesNo,
    dependsOn: [{ questionLabel: "first", triggeringOption: "yes" }],
  }),
  surveyItem("third", "third", {
    dependsOn: [{ questionLabel: "second", triggeringOption: "yes" }],
  }),
  surveyItem("other", "other", { mandatory: false }),
])

const multiChoiceSurvey = survey([
  surveyItem("pets", "pets", { type: AnswerType.MultiChoice, options: ["dog", "cat"] }),
  surveyItem("cat-name", "cat_name", {
    dependsOn: [{ questionLabel: "pets", triggeringOption: "cat" }],
  }),
])

const factorialSpec: PublicFactorialSurveySpec = {
  id: "factorial-1",
  type: SurveyType.Factorial,
  options: [
    { id: "opt-yes", name: "yes", value: 1 },
    { id: "opt-unknown", name: "en osaa sanoa", value: null },
  ],
  questions: [
    { id: "info-1", questionLabel: "info", question: "Read this", mandatory: true },
    { id: "fq-1", questionLabel: "one", question: "One?", mandatory: true },
    { id: "fq-2", questionLabel: "two", question: "Two?", mandatory: true },
    { id: "fq-3", questionLabel: "three", question: "Three?" },
  ],
}

const ratingsOf = (ratings: Record<string, string>): UserAnswer => ({
  answeredQuestions: Object.entries(ratings).reduce(
    (rated, [label, optionId]) => applyRating(rated, label, optionId),
    restoreRatings(factorialSpec, null),
  ),
})

describe("validation, non-factorial", () => {
  it("matches answers by survey item id, not by label", () => {
    const spec = survey([surveyItem("a", "same"), surveyItem("b", "same")])
    expect(unansweredIds(spec, answersOf(spec, { a: "answer" }))).toEqual(["b"])
    expect(unansweredIds(spec, answersOf(spec, { a: "x", b: "y" }))).toEqual([])
  })

  it("accepts the shown variant of a duplicate label whether the hidden one comes first or second", () => {
    const spec = duplicateLabelSurvey
    expect(unansweredIds(spec, answersOf(spec, { group: "b", "variant-b": "x" }))).toEqual([])
    expect(unansweredIds(spec, answersOf(spec, { group: "a", "variant-a": "x" }))).toEqual([])
    expect(unansweredIds(spec, answersOf(spec, { group: "b" }))).toEqual(["variant-b"])
  })

  it("requires conditional items only while shown", () => {
    const spec = chainedSurvey
    expect(unansweredIds(spec, answersOf(spec, { first: "no" }))).toEqual([])
    expect(unansweredIds(spec, answersOf(spec, { first: "yes" }))).toEqual(["second"])
  })

  it("follows chained conditions, also through a hidden trigger with a stale answer", () => {
    const spec = chainedSurvey
    expect(unansweredIds(spec, answersOf(spec, { first: "yes", second: "yes" }))).toEqual(["third"])
    expect(unansweredIds(spec, rawAnswersOf(spec, { first: "no", second: "yes" }))).toEqual([])
  })

  it("lets any chosen option of a multi-choice trigger a condition", () => {
    const spec = multiChoiceSurvey
    expect(unansweredIds(spec, answersOf(spec, { pets: ["dog", "cat"] }))).toEqual(["cat-name"])
    expect(unansweredIds(spec, answersOf(spec, { pets: ["dog"] }))).toEqual([])
  })

  it("treats empty and whitespace-only text as unanswered", () => {
    const spec = survey([surveyItem("text", "text")])
    expect(unansweredIds(spec, answersOf(spec, { text: "" }))).toEqual(["text"])
    expect(unansweredIds(spec, answersOf(spec, { text: "  \n " }))).toEqual(["text"])
    expect(unansweredIds(spec, answersOf(spec, { text: "words" }))).toEqual([])
  })

  it("requires a parsable number in number fields", () => {
    const spec = survey([surveyItem("n", "n", { type: AnswerType.Number })])
    expect(unansweredIds(spec, answersOf(spec, { n: "0" }))).toEqual([])
    expect(unansweredIds(spec, answersOf(spec, { n: 0 }))).toEqual([])
    expect(unansweredIds(spec, answersOf(spec, { n: "2,5" }))).toEqual([])
    expect(unansweredIds(spec, answersOf(spec, { n: "" }))).toEqual(["n"])
    expect(unansweredIds(spec, answersOf(spec, { n: "n. 5" }))).toEqual(["n"])
  })

  it("treats an empty multi-choice selection as unanswered", () => {
    const spec = survey([surveyItem("m", "m", { type: AnswerType.MultiChoice, options: ["x"] })])
    expect(unansweredIds(spec, answersOf(spec, { m: [] }))).toEqual(["m"])
    expect(unansweredIds(spec, answersOf(spec, { m: ["x"] }))).toEqual([])
  })

  it("requires the consent checkbox to be checked", () => {
    const spec = survey([
      surveyItem("consent", "consent", { type: AnswerType.ConsentCheckbox, options: ["I agree"] }),
    ])
    expect(unansweredIds(spec, answersOf(spec, { consent: "" }))).toEqual(["consent"])
    expect(unansweredIds(spec, answersOf(spec, { consent: "checked" }))).toEqual([])
  })

  it("skips mandatory items that render no input", () => {
    const spec = survey([
      surveyItem("none", "none", { type: AnswerType.None }),
      surveyItem("upload", "upload", { type: AnswerType.FileUpload }),
      surveyItem("no-options", "no_options", { type: AnswerType.RadioGroup, options: [] }),
      surveyItem("info", "info", { type: AnswerType.Text }),
    ])
    expect(unansweredIds(spec, answersOf(spec, {}))).toEqual([])
  })

  it("requires the input of an info-header item", () => {
    const spec = survey([surveyItem("header", "info-header", yesNo)])
    expect(unansweredIds(spec, answersOf(spec, {}))).toEqual(["header"])
    expect(unansweredIds(spec, answersOf(spec, { header: "yes" }))).toEqual([])
  })

  it("tolerates malformed submissions", () => {
    const spec = survey([surveyItem("text", "text")])
    expect(unansweredIds(spec, { answeredQuestions: [null] } as unknown as UserAnswer)).toEqual([
      "text",
    ])
    expect(unansweredIds(spec, {} as UserAnswer)).toEqual(["text"])
    expect(findUnansweredQuestions(spec, null).map((q) => q.id)).toEqual(["text"])
  })
})

describe("validation, factorial", () => {
  it("is valid when every mandatory question is rated", () => {
    expect(unansweredIds(factorialSpec, ratingsOf({ one: "opt-yes", two: "opt-yes" }))).toEqual([])
  })

  it("lists the unrated mandatory questions", () => {
    expect(unansweredIds(factorialSpec, ratingsOf({ one: "opt-yes" }))).toEqual(["fq-2"])
  })

  it("counts an option without a value as an answer", () => {
    expect(
      unansweredIds(factorialSpec, ratingsOf({ one: "opt-unknown", two: "opt-unknown" })),
    ).toEqual([])
  })

  it("ignores info rows", () => {
    expect(findUnansweredQuestions(factorialSpec, ratingsOf({})).map((q) => q.id)).toEqual([
      "fq-1",
      "fq-2",
    ])
  })
})

describe("number parsing", () => {
  it.each([
    ["5", 5],
    ["0", 0],
    ["2,5", 2.5],
    [" 2.5 ", 2.5],
    ["-3", -3],
    ["1 000", 1000],
    [".5", 0.5],
  ])("parses %p", (text, expected) => {
    expect(parseDecimal(text)).toBe(expected)
  })

  it.each(["", " ", "n. 5", "5 kg", "1,2,3", "abc", "1e3"])("rejects %p", (text) => {
    expect(parseDecimal(text)).toBeNull()
  })
})

describe("answer reducer", () => {
  const answerOf = (items: AnsweredSurveyItem[], id: string) =>
    items.find((i) => i.surveyItemId === id)?.answer

  it("clears an item hidden by changing its trigger", () => {
    const spec = duplicateLabelSurvey
    let items = restoreSurveyAnswers(spec, null)
    items = applySurveyAnswer(spec, items, "group", "a")
    items = applySurveyAnswer(spec, items, "variant-a", "answer")
    items = applySurveyAnswer(spec, items, "group", "b")
    expect(answerOf(items, "variant-a")).toBeNull()
  })

  it("clears chained dependants", () => {
    const spec = chainedSurvey
    let items = restoreSurveyAnswers(spec, null)
    items = applySurveyAnswer(spec, items, "first", "yes")
    items = applySurveyAnswer(spec, items, "second", "yes")
    items = applySurveyAnswer(spec, items, "third", "deep")
    items = applySurveyAnswer(spec, items, "first", "no")
    expect(answerOf(items, "second")).toBeNull()
    expect(answerOf(items, "third")).toBeNull()
  })

  it("clears dependants when a multi-choice option is unchecked", () => {
    const spec = multiChoiceSurvey
    let items = restoreSurveyAnswers(spec, null)
    items = applySurveyAnswer(spec, items, "pets", ["cat"])
    items = applySurveyAnswer(spec, items, "cat-name", "Mirri")
    items = applySurveyAnswer(spec, items, "pets", ["dog"])
    expect(answerOf(items, "cat-name")).toBeNull()
  })

  it("does not resurrect a cleared answer when the item is shown again", () => {
    const spec = chainedSurvey
    let items = restoreSurveyAnswers(spec, null)
    items = applySurveyAnswer(spec, items, "first", "yes")
    items = applySurveyAnswer(spec, items, "second", "no")
    items = applySurveyAnswer(spec, items, "first", "no")
    items = applySurveyAnswer(spec, items, "first", "yes")
    expect(answerOf(items, "second")).toBeNull()
  })

  it("leaves unrelated answers untouched and returns a new array", () => {
    const spec = chainedSurvey
    const before = applySurveyAnswer(spec, restoreSurveyAnswers(spec, null), "other", "kept")
    const after = applySurveyAnswer(spec, before, "first", "no")
    expect(after).not.toBe(before)
    expect(after.find((i) => i.surveyItemId === "other")).toBe(
      before.find((i) => i.surveyItemId === "other"),
    )
    expect(before.find((i) => i.surveyItemId === "first")?.answer).toBeNull()
  })

  it("updates factorial ratings immutably", () => {
    const before = restoreRatings(factorialSpec, null)
    const after = applyRating(before, "one", "opt-yes")
    expect(after).not.toBe(before)
    expect(before.every((q) => q.chosenOptionId === "")).toBe(true)
    expect(after.find((q) => q.questionLabel === "one")?.chosenOptionId).toBe("opt-yes")
  })
})

describe("validity messages", () => {
  it("names the unanswered questions in plain text", () => {
    const spec = survey([
      surveyItem("a", "a", { question: " **Onko koiralla** ongelmia? * " }),
      surveyItem("b", "b", { question: "" }),
    ])
    expect(buildValidityMessages(findUnansweredQuestions(spec, answersOf(spec, {})), t)).toEqual([
      "Vastaa kysymykseen: Onko koiralla ongelmia?",
      "Vastaa kysymykseen: b",
    ])
  })

  it("counts the questions beyond the first three", () => {
    const spec = survey(["a", "b", "c", "d", "e"].map((id) => surveyItem(id, id)))
    const messages = buildValidityMessages(findUnansweredQuestions(spec, answersOf(spec, {})), t)
    expect(messages).toHaveLength(4)
    expect(messages[3]).toBe("Lisäksi 2 muuta pakollista kysymystä on vastaamatta.")
  })

  it("is empty for a valid answer", () => {
    const spec = survey([surveyItem("a", "a")])
    const answer = answersOf(spec, { a: "x" })
    const message = buildCurrentStateMessage(answer, findUnansweredQuestions(spec, answer), t)
    expect(message).toEqual({
      message: "current-state",
      data: answer,
      valid: true,
      validityMessages: [],
    })
    expect(isCurrentStateMessage(message)).toBe(true)
  })
})

describe("protocol additions", () => {
  it("recognises focus-first-invalid as a message to the iframe", () => {
    expect(isFocusFirstInvalidMessage({ message: "focus-first-invalid" })).toBe(true)
    expect(isMessageToIframe({ message: "focus-first-invalid" })).toBe(true)
  })

  it("accepts answer_draft on the answer-exercise state", () => {
    expect(
      isAnswerExerciseIframeState({
        view_type: "answer-exercise",
        exercise_task_id: "task",
        user_information: { pseudonymous_id: "p", signed_in: true },
        data: { public_spec: {}, previous_submission: null },
        answer_draft: { answeredQuestions: [] },
      }),
    ).toBe(true)
  })

  it("rejects malformed validityMessages", () => {
    expect(
      isCurrentStateMessage({ message: "current-state", valid: false, validityMessages: [1] }),
    ).toBe(false)
  })
})

interface MountedExercise {
  container: HTMLDivElement
  posted: CurrentStateMessage[]
  render: (spec: PublicSpec, answerDraft?: unknown) => void
  unmount: () => void
}

const mountExercise = (spec: PublicSpec, answerDraft?: unknown): MountedExercise => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const posted: CurrentStateMessage[] = []
  const port = { postMessage: (m: CurrentStateMessage) => posted.push(m) } as unknown as MessagePort
  const root: Root = createRoot(container)
  const render = (nextSpec: PublicSpec, nextDraft?: unknown) =>
    act(() => {
      root.render(
        React.createElement(Exercise, {
          state: nextSpec,
          port,
          userVariables: null,
          answerDraft: nextDraft,
        }),
      )
    })
  render(spec, answerDraft)
  return {
    container,
    posted,
    render,
    unmount: () => {
      act(() => root.unmount())
      container.remove()
    },
  }
}

const click = (element: Element | null) => {
  if (!element) {
    throw new Error("element not found")
  }
  act(() => {
    ;(element as HTMLElement).click()
  })
}

const typeInto = (input: HTMLInputElement, value: string) => {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value)
    input.dispatchEvent(new Event("input", { bubbles: true }))
  })
}

const lastPosted = (mounted: MountedExercise) => mounted.posted[mounted.posted.length - 1]
const answerFor = (message: CurrentStateMessage, surveyItemId: string) =>
  (message.data as UserAnswer).answeredQuestions.find(
    (a) => (a as AnsweredSurveyItem).surveyItemId === surveyItemId,
  ) as AnsweredSurveyItem | undefined

describe("posted state", () => {
  const spec = survey([surveyItem("q1", "q1", yesNo), surveyItem("q2", "q2", { mandatory: false })])

  it("posts the initial state once on mount, naming the unanswered question", () => {
    const mounted = mountExercise(spec)
    expect(mounted.posted).toHaveLength(1)
    expect(mounted.posted[0].valid).toBe(false)
    expect(mounted.posted[0].validityMessages).toEqual(["Vastaa kysymykseen: Question q1?"])
    mounted.unmount()
  })

  it("posts one current-state per change with matching validity", () => {
    const mounted = mountExercise(spec)
    click(mounted.container.querySelector('input[value="yes"]'))
    expect(mounted.posted).toHaveLength(2)
    expect(lastPosted(mounted).valid).toBe(true)
    expect(lastPosted(mounted).validityMessages).toEqual([])
    expect(answerFor(lastPosted(mounted), "q1")?.answer).toBe("yes")
    mounted.unmount()
  })

  it("never posts an empty answer on a repeated set-state with the same spec", () => {
    const mounted = mountExercise(spec)
    click(mounted.container.querySelector('input[value="yes"]'))
    const postedBefore = mounted.posted.length
    mounted.render(JSON.parse(JSON.stringify(spec)))
    expect(mounted.posted.length).toBeGreaterThanOrEqual(postedBefore)
    mounted.posted.slice(postedBefore).forEach((m) => {
      expect(answerFor(m, "q1")?.answer).toBe("yes")
      expect(m.valid).toBe(true)
    })
    mounted.unmount()
  })

  it("starts over for a new spec", () => {
    const mounted = mountExercise(spec)
    click(mounted.container.querySelector('input[value="yes"]'))
    mounted.render(survey(spec.content, "survey-2"))
    expect(answerFor(lastPosted(mounted), "q1")?.answer).toBeNull()
    expect(lastPosted(mounted).valid).toBe(false)
    mounted.unmount()
  })

  it("posts factorial ratings", () => {
    const mounted = mountExercise(factorialSpec)
    expect(mounted.posted[0].valid).toBe(false)
    click(mounted.container.querySelector("#one-factorial-option-1"))
    click(mounted.container.querySelector("#two-factorial-option-2"))
    expect(mounted.posted).toHaveLength(3)
    expect(lastPosted(mounted).valid).toBe(true)
    mounted.unmount()
  })

  it("stores parsed numbers and shows an error for text that is not a number", () => {
    const numberSpec = survey([surveyItem("n", "n", { type: AnswerType.Number })])
    const mounted = mountExercise(numberSpec)
    const input = mounted.container.querySelector("input") as HTMLInputElement
    expect(input.type).toBe("text")
    expect(input.inputMode).toBe("decimal")

    typeInto(input, "n. 5")
    expect(lastPosted(mounted).valid).toBe(false)
    expect(input.value).toBe("n. 5")
    expect(mounted.container.textContent).toContain(fiTranslations["invalid-number"])

    typeInto(input, "2,5")
    expect(lastPosted(mounted).valid).toBe(true)
    expect(answerFor(lastPosted(mounted), "n")?.answer).toBe("2.5")
    expect(mounted.container.textContent).not.toContain(fiTranslations["invalid-number"])
    mounted.unmount()
  })
})

describe("focus-first-invalid", () => {
  it("focuses and highlights the first unanswered required item", () => {
    const spec = survey([
      surveyItem("done", "done", yesNo),
      surveyItem("missing", "missing", yesNo),
      surveyItem("also-missing", "also_missing"),
    ])
    const mounted = mountExercise(spec)
    click(mounted.container.querySelectorAll('input[value="yes"]')[0])
    expect(mounted.container.textContent).not.toContain(
      fiTranslations["required-question-unanswered"],
    )

    act(() => requestFocusFirstInvalid())

    const missingRadio = mounted.container.querySelectorAll('input[value="yes"]')[1]
    expect(document.activeElement).toBe(missingRadio)
    const highlights = mounted.container.textContent?.split(
      fiTranslations["required-question-unanswered"],
    )
    expect(highlights).toHaveLength(3)
    mounted.unmount()
  })
})

describe("answer draft", () => {
  const spec = survey([surveyItem("q1", "q1", yesNo), surveyItem("q2", "q2")])
  const draftWith = (answer: string) => ({
    answeredQuestions: [{ surveyItemId: "q2", questionLabel: "q2", answer }],
  })

  it("is saved per spec id", () => {
    const mounted = mountExercise(spec)
    click(mounted.container.querySelector('input[value="no"]'))
    mounted.unmount()
    expect(answerFor({ data: loadAnswerDraft("survey-1") } as CurrentStateMessage, "q1")).toEqual(
      expect.objectContaining({ answer: "no" }),
    )
    expect(loadAnswerDraft("survey-2")).toBeNull()
  })

  it("is restored on mount for the same spec only", () => {
    saveAnswerDraft("survey-1", draftWith("from storage"))
    const same = mountExercise(spec)
    expect(answerFor(same.posted[0], "q2")?.answer).toBe("from storage")
    same.unmount()

    const other = mountExercise(survey(spec.content, "survey-2"))
    expect(answerFor(other.posted[0], "q2")?.answer).toBeNull()
    other.unmount()
  })

  it("ignores entries for items the spec does not have", () => {
    const restored = restoreSurveyAnswers(spec, {
      answeredQuestions: [
        { surveyItemId: "unknown", answer: "x" },
        { surveyItemId: "q1", answer: {} },
      ],
    })
    expect(restored.every((a) => a.answer === null)).toBe(true)
    expect(
      restoreRatings(factorialSpec, {
        answeredQuestions: [{ questionLabel: "one", chosenOptionId: "nope" }],
      })[0].chosenOptionId,
    ).toBe("")
  })

  it("prefers the draft the host re-sent over storage", () => {
    saveAnswerDraft("survey-1", draftWith("from storage"))
    const mounted = mountExercise(spec, draftWith("from host"))
    expect(answerFor(mounted.posted[0], "q2")?.answer).toBe("from host")
    mounted.unmount()
    const stored = pickAnswerDraft("survey-1", undefined) as UserAnswer
    expect(answerFor({ data: stored } as CurrentStateMessage, "q2")?.answer).toBe("from host")
    expect(pickAnswerDraft("survey-1", draftWith("newer"))).toEqual(draftWith("newer"))
  })

  it("is cleared when the host shows the submission", () => {
    saveAnswerDraft("survey-1", draftWith("x"))
    const answerExercise = {
      message: "set-state",
      view_type: "answer-exercise",
      data: { public_spec: spec },
    } as unknown as SetStateMessage
    clearSubmittedAnswerDraft(answerExercise)
    expect(loadAnswerDraft("survey-1")).not.toBeNull()

    const viewSubmission = {
      message: "set-state",
      view_type: "view-submission",
      data: { public_spec: spec, user_answer: draftWith("x"), grading: null },
    } as unknown as SetStateMessage
    clearSubmittedAnswerDraft(viewSubmission)
    expect(loadAnswerDraft("survey-1")).toBeNull()
  })

  it("survives storage throwing", () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied")
    })
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied")
    })
    const mounted = mountExercise(spec)
    click(mounted.container.querySelector('input[value="yes"]'))
    expect(answerFor(lastPosted(mounted), "q1")?.answer).toBe("yes")
    mounted.unmount()
    expect(loadAnswerDraft("survey-1")).toBeNull()
  })
})

describe("server validation in grade", () => {
  const callGrade = async (exerciseSpec: Survey | FactorialSurvey, submission: UserAnswer) => {
    const req = {
      method: "POST",
      headers: {},
      body: { exercise_spec: exerciseSpec, submission_data: submission },
    } as unknown as NextApiRequest
    let body: unknown
    let status = 0
    const res = {
      setHeader: jest.fn(),
      getHeader: jest.fn(),
      status: jest.fn((code: number) => {
        status = code
        return res
      }),
      json: jest.fn((json: unknown) => {
        body = json
      }),
    } as unknown as NextApiResponse
    await grade(req, res)
    return { status, body: body as { grading_progress: string; score_given: number } }
  }

  const privateFactorialSpec: FactorialSurvey = {
    ...factorialSpec,
    calculateFeedback: false,
    factors: [],
  }

  const cases: Array<[string, Survey | FactorialSurvey, UserAnswer, string[]]> = [
    ["complete survey", chainedSurvey, answersOf(chainedSurvey, { first: "no" }), []],
    ["empty survey answer", chainedSurvey, { answeredQuestions: [] }, ["first"]],
    [
      "duplicate label, shown variant answered",
      duplicateLabelSurvey,
      answersOf(duplicateLabelSurvey, { group: "b", "variant-b": "x" }),
      [],
    ],
    ["empty multi-choice", multiChoiceSurvey, answersOf(multiChoiceSurvey, { pets: [] }), ["pets"]],
    ["partial factorial", privateFactorialSpec, ratingsOf({ one: "opt-yes" }), ["two"]],
    [
      "complete factorial",
      privateFactorialSpec,
      ratingsOf({ one: "opt-yes", two: "opt-unknown" }),
      [],
    ],
  ]

  it.each(cases)(
    "%s: flags exactly what the client flags and still grades",
    async (_name, spec, answer, labels) => {
      const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined)
      const clientLabels = findUnansweredQuestions(spec as PublicSpec, answer).map(
        (q) => q.questionLabel,
      )
      expect(clientLabels).toEqual(labels)

      const { status, body } = await callGrade(spec, answer)
      expect(status).toBe(200)
      expect(body.grading_progress).toBe("FullyGraded")
      expect(body.score_given).toBe(1)
      if (labels.length === 0) {
        expect(warn).not.toHaveBeenCalled()
      } else {
        expect(warn).toHaveBeenCalledTimes(1)
        expect(JSON.parse(warn.mock.calls[0][1] as string)).toEqual({
          specId: spec.id,
          unansweredQuestionLabels: labels,
        })
      }
    },
  )
})

describe("fixtures: Alusta-arkuus (Minä ja koirani, chapter 2)", () => {
  const surveySpec = alustaArkuusSurvey as Survey
  const factorial = alustaArkuusFactorial as PublicFactorialSurveySpec

  it("is valid when every visible mandatory item is answered, with the follow-up hidden", () => {
    const answer = answersOf(surveySpec, {
      "8943cd76-3caf-4c2b-8423-c3760171fccf": "ei",
      "2cc21810-ab19-4acf-b2f5-b801701b3069": "alusta-arkuus on vähentynyt",
    })
    expect(findUnansweredQuestions(surveySpec, answer)).toEqual([])
  })

  it("requires the follow-up once it is shown", () => {
    let items = restoreSurveyAnswers(surveySpec, null)
    items = applySurveyAnswer(surveySpec, items, "8943cd76-3caf-4c2b-8423-c3760171fccf", "kyllä")
    items = applySurveyAnswer(
      surveySpec,
      items,
      "2cc21810-ab19-4acf-b2f5-b801701b3069",
      "alusta-arkuus on lisääntynyt",
    )
    expect(unansweredIds(surveySpec, { answeredQuestions: items })).toEqual([
      "c48779a4-6de7-45f5-bc67-b900ae561d7d",
    ])
    items = applySurveyAnswer(
      surveySpec,
      items,
      "c48779a4-6de7-45f5-bc67-b900ae561d7d",
      "1–1,5 vuoden iässä",
    )
    expect(unansweredIds(surveySpec, { answeredQuestions: items })).toEqual([])
  })

  it("is valid for the factorial task when every question is rated, including 'en osaa sanoa'", () => {
    const unknownOption = factorial.options.find((o) => o.value === null)?.id as string
    const rated = factorial.questions
      .filter((q) => q.questionLabel !== "info")
      .reduce(
        (ratings: RatedQuestion[], q, index) =>
          applyRating(
            ratings,
            q.questionLabel,
            index === 0 ? unknownOption : factorial.options[0].id,
          ),
        restoreRatings(factorial, null),
      )
    expect(findUnansweredQuestions(factorial, { answeredQuestions: rated })).toEqual([])
    expect(findUnansweredQuestions(factorial, { answeredQuestions: [] })).toHaveLength(6)
  })

  it("posts a valid state from the rendered forms once answered", () => {
    const mounted = mountExercise(factorial)
    factorial.questions
      .filter((q) => q.questionLabel !== "info")
      .forEach((q) =>
        click(mounted.container.querySelector(`#${q.questionLabel}-factorial-option-1`)),
      )
    expect(lastPosted(mounted).valid).toBe(true)
    mounted.unmount()

    const surveyMounted = mountExercise(surveySpec)
    click(surveyMounted.container.querySelector('input[value="ei"]'))
    click(surveyMounted.container.querySelector('input[value="alusta-arkuus on vähentynyt"]'))
    expect(lastPosted(surveyMounted).valid).toBe(true)
    surveyMounted.unmount()
  })
})
