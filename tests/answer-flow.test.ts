/* eslint-disable i18next/no-literal-string */
import { createInstance, TFunction } from "i18next"
import type { NextApiRequest, NextApiResponse } from "next"
import React from "react"
import { createRoot, Root } from "react-dom/client"
import { act } from "react-dom/test-utils"
import { initReactI18next } from "react-i18next"

import Exercise from "../src/components/Exercise"
import Renderer from "../src/components/Renderer"
import useAnswerReporting from "../src/hooks/useAnswerReporting"
import grade from "../src/pages/api/grade"
import {
  CurrentStateMessage,
  SetStateMessage,
  UserVariablesMap,
} from "../src/shared-module/exercise-service-protocol-types"
import {
  isAnswerExerciseIframeState,
  isCurrentStateMessage,
  isFocusFirstInvalidMessage,
  isMessageFromIframe,
  isMessageToIframe,
} from "../src/shared-module/exercise-service-protocol-types.guard"
import useExerciseServiceParentConnection from "../src/shared-module/hooks/useExerciseServiceParentConnection"
import fiTranslations from "../src/shared-module/locales/fi/factorial-survey.json"
import {
  clearSubmittedAnswerDraft,
  loadAnswerDraft,
  pickAnswerDraft,
  saveAnswerDraft,
} from "../src/util/answerDraft"
import { requestFocusFirstInvalid, UNANSWERED_ITEM_ATTRIBUTE } from "../src/util/focusFirstInvalid"
import {
  buildLoadFailureRecoveryScript,
  LOAD_FAILURE_RELOAD_GUARD,
  recordReloadIfAllowed,
} from "../src/util/reloadGuard"
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
  checkFactorialSpec,
  checkSpec,
  checkSurveyContent,
  findConditionsWithMissingOptions,
  findMandatoryNeverShown,
  findMandatoryWithoutInput,
} from "../src/util/specChecks"
import {
  applyRating,
  applySurveyAnswer,
  restoreRatings,
  restoreSurveyAnswers,
} from "../src/util/surveyAnswers"
import { findUnansweredQuestions, parseDecimal } from "../src/util/utils"
import { buildValidityMessages } from "../src/util/validityMessages"

import alustaArkuusFactorial from "./test-data/alusta-arkuus/factorial-public-spec.json"
import alustaArkuusSurvey from "./test-data/alusta-arkuus/non-factorial-public-spec.json"
import miniTestSpec from "./test-data/factorial/mini-test/private-spec.json"
import personalitySpec from "./test-data/factorial/personality-test/test-spec.json"
import nonFactorialSpec from "./test-data/non-factorial/private-spec.json"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextConfig = require("../next.config.js")

// Renderer imports these only for other views; their dependencies ship ESM that Jest can't load.
jest.mock("../src/components/Editor", () => () => null)
jest.mock("../src/components/PdfDownload/PdfGenerator", () => () => null)

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
    expect(buildValidityMessages(findUnansweredQuestions(spec, answer), t)).toEqual([])
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
    expect(lastPosted(mounted).validityMessages).toBeUndefined()
    expect(isCurrentStateMessage(lastPosted(mounted))).toBe(true)
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
    expect(answerFor(lastPosted(mounted), "n")?.answer).toBeNull()
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

describe("useAnswerReporting", () => {
  interface HookProps {
    spec: Survey
    answeredQuestions: UserAnswer["answeredQuestions"]
    userVariables?: UserVariablesMap | null
  }

  interface MountedHook {
    port: FakePort
    posted: () => CurrentStateMessage[]
    result: () => ReturnType<typeof useAnswerReporting>
    render: (props: HookProps) => void
    unmount: () => void
  }

  // Marks unanswered items the way RequiredItemWrapper does, so focus requests have a target.
  const mountHook = (props: HookProps): MountedHook => {
    const container = document.createElement("div")
    document.body.appendChild(container)
    const port = createFakePort()
    let result: ReturnType<typeof useAnswerReporting> | undefined
    const Probe = ({ spec, answeredQuestions, userVariables }: HookProps) => {
      result = useAnswerReporting(
        port as unknown as MessagePort,
        spec,
        answeredQuestions,
        userVariables,
      )
      return React.createElement(
        React.Fragment,
        null,
        spec.content.map((item) =>
          React.createElement(
            "div",
            {
              key: item.id,
              [UNANSWERED_ITEM_ATTRIBUTE]: result?.unansweredIds.has(item.id) ? "true" : undefined,
            },
            React.createElement("input", { id: `input-${item.id}` }),
          ),
        ),
      )
    }
    const root = createRoot(container)
    const render = (nextProps: HookProps) =>
      act(() => {
        root.render(React.createElement(Probe, nextProps))
      })
    render(props)
    return {
      port,
      posted: () => port.postMessage.mock.calls.map(([message]) => message as CurrentStateMessage),
      result: () => {
        if (!result) {
          throw new Error("hook not rendered")
        }
        return result
      },
      render,
      unmount: () => {
        act(() => root.unmount())
        container.remove()
      },
    }
  }

  const spec = survey(
    [
      surveyItem("q1", "q1", yesNo),
      surveyItem("q2", "q2", yesNo),
      surveyItem("optional", "optional", { mandatory: false }),
    ],
    "hook-survey",
  )
  const emptyAnswers = answersOf(spec, {}).answeredQuestions

  it("posts the current state on mount", () => {
    const mounted = mountHook({ spec, answeredQuestions: emptyAnswers })
    expect(mounted.posted()).toEqual([
      {
        message: "current-state",
        data: { answeredQuestions: emptyAnswers },
        valid: false,
        validityMessages: ["Vastaa kysymykseen: Question q1?", "Vastaa kysymykseen: Question q2?"],
      },
    ])
    expect(isCurrentStateMessage(mounted.posted()[0])).toBe(true)
    mounted.unmount()
  })

  it("posts once per answer change and not on re-renders with the same inputs", () => {
    const props = { spec, answeredQuestions: emptyAnswers, userVariables: null }
    const mounted = mountHook(props)
    mounted.render({ ...props })
    mounted.render({ ...props })
    expect(mounted.posted()).toHaveLength(1)

    const q1Answered = answersOf(spec, { q1: "yes" }).answeredQuestions
    mounted.render({ ...props, answeredQuestions: q1Answered })
    expect(mounted.posted()).toHaveLength(2)
    mounted.render({ ...props, answeredQuestions: q1Answered })
    expect(mounted.posted()).toHaveLength(2)
    mounted.unmount()
  })

  it("turns valid and drops validityMessages once the last mandatory item is answered", () => {
    const mounted = mountHook({
      spec,
      answeredQuestions: answersOf(spec, { q1: "yes" }).answeredQuestions,
    })
    expect(mounted.posted()[0].valid).toBe(false)
    expect(mounted.posted()[0].validityMessages).toEqual(["Vastaa kysymykseen: Question q2?"])

    mounted.render({
      spec,
      answeredQuestions: answersOf(spec, { q1: "yes", q2: "no" }).answeredQuestions,
    })
    const last = mounted.posted()[1]
    expect(last.valid).toBe(true)
    expect(last).not.toHaveProperty("validityMessages")
    expect(mounted.result().unansweredIds.size).toBe(0)
    mounted.unmount()
  })

  it("reports the unanswered items by survey item id", () => {
    const mounted = mountHook({
      spec,
      answeredQuestions: answersOf(spec, { q2: "yes" }).answeredQuestions,
    })
    expect([...mounted.result().unansweredIds]).toEqual(["q1"])
    mounted.unmount()
  })

  it("fills user variables into the validity messages", () => {
    const variableSpec = survey([
      surveyItem("pet", "pet", { question: "Onko ${pet_name=koiralla} ongelmia?" }),
    ])
    const answeredQuestions = answersOf(variableSpec, {}).answeredQuestions
    const mounted = mountHook({ spec: variableSpec, answeredQuestions })
    expect(mounted.posted()[0].validityMessages).toEqual([
      "Vastaa kysymykseen: Onko koiralla ongelmia?",
    ])

    mounted.render({
      spec: variableSpec,
      answeredQuestions,
      userVariables: { pet_name: "Mustilla" },
    })
    expect(mounted.posted()).toHaveLength(2)
    expect(mounted.posted()[1].validityMessages).toEqual([
      "Vastaa kysymykseen: Onko Mustilla ongelmia?",
    ])
    mounted.unmount()
  })

  it("saves the draft under the spec id on each post", () => {
    const mounted = mountHook({ spec, answeredQuestions: emptyAnswers })
    expect(loadAnswerDraft(spec.id)).toEqual({ answeredQuestions: emptyAnswers })

    const q1Answered = answersOf(spec, { q1: "yes" }).answeredQuestions
    mounted.render({ spec, answeredQuestions: q1Answered })
    expect(loadAnswerDraft(spec.id)).toEqual({ answeredQuestions: q1Answered })
    expect(loadAnswerDraft("other-spec")).toBeNull()
    mounted.unmount()
  })

  it("keeps posting when sessionStorage throws", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied")
    })
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    const mounted = mountHook({ spec, answeredQuestions: emptyAnswers })
    mounted.render({ spec, answeredQuestions: answersOf(spec, { q1: "yes" }).answeredQuestions })
    expect(mounted.posted()).toHaveLength(2)
    mounted.unmount()
  })

  it("highlights and focuses the first unanswered item on a focus request", () => {
    const mounted = mountHook({
      spec,
      answeredQuestions: answersOf(spec, { q1: "yes" }).answeredQuestions,
    })
    expect(mounted.result().shouldHighlightUnanswered).toBe(false)

    act(() => requestFocusFirstInvalid())

    expect(mounted.result().shouldHighlightUnanswered).toBe(true)
    expect(document.activeElement?.id).toBe("input-q2")
    mounted.unmount()
  })

  it("ignores focus requests after unmount", () => {
    const mounted = mountHook({ spec, answeredQuestions: emptyAnswers })
    mounted.unmount()

    const stray = document.createElement("input")
    stray.setAttribute(UNANSWERED_ITEM_ATTRIBUTE, "true")
    document.body.appendChild(stray)
    act(() => requestFocusFirstInvalid())
    expect(document.activeElement).not.toBe(stray)
    stray.remove()
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

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

interface FakePort {
  onmessage: ((event: { data: unknown }) => void) | null
  postMessage: jest.Mock
}

function createFakePort(): FakePort {
  return { onmessage: null, postMessage: jest.fn() }
}

describe("parent connection handshake", () => {
  const fakeParent = { postMessage: jest.fn() }
  const originalParent = window.parent
  let root: Root | null = null
  let container: HTMLDivElement
  let receivedPort: MessagePort | null = null
  const onMessage = jest.fn((messageData: unknown, port: MessagePort) => {
    port.postMessage({ message: "current-state", data: messageData, valid: true })
  })

  const ConnectionProbe: React.FC = () => {
    receivedPort = useExerciseServiceParentConnection(onMessage)
    return null
  }

  const readyPostCount = () =>
    fakeParent.postMessage.mock.calls.filter(([message]) => message === "ready").length

  const sendPortFrom = (source: unknown, port: FakePort) => {
    const event = new Event("message")
    Object.defineProperties(event, {
      source: { value: source },
      ports: { value: [port] },
      data: { value: "communication-port" },
    })
    act(() => {
      window.dispatchEvent(event)
    })
  }

  beforeEach(() => {
    jest.spyOn(console, "info").mockImplementation(() => undefined)
    jest.spyOn(console, "groupCollapsed").mockImplementation(() => undefined)
    jest.spyOn(console, "groupEnd").mockImplementation(() => undefined)
    jest.useFakeTimers()
    fakeParent.postMessage.mockClear()
    onMessage.mockClear()
    receivedPort = null
    Object.defineProperty(window, "parent", { value: fakeParent, configurable: true })
    container = document.createElement("div")
    root = createRoot(container)
    act(() => {
      root?.render(React.createElement(ConnectionProbe))
    })
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    root = null
    Object.defineProperty(window, "parent", { value: originalParent, configurable: true })
    jest.useRealTimers()
  })

  test("posts ready at once and keeps retrying until a port arrives", () => {
    expect(fakeParent.postMessage).toHaveBeenCalledWith("ready", "*")
    expect(readyPostCount()).toBe(1)

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(readyPostCount()).toBe(2)
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(readyPostCount()).toBe(3)

    sendPortFrom(fakeParent, createFakePort())
    expect(receivedPort).not.toBeNull()
    act(() => {
      jest.advanceTimersByTime(60_000)
    })
    expect(readyPostCount()).toBe(3)
  })

  test("ignores ports from other windows", () => {
    sendPortFrom({ postMessage: jest.fn() }, createFakePort())
    expect(receivedPort).toBeNull()
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(readyPostCount()).toBe(2)
  })

  test("routes messages from the first port to the callback and keeps that port", () => {
    const firstPort = createFakePort()
    const secondPort = createFakePort()
    sendPortFrom(fakeParent, firstPort)
    sendPortFrom(fakeParent, secondPort)

    expect(receivedPort).toBe(firstPort)
    expect(secondPort.onmessage).toBeNull()

    const setState = { message: "set-state", view_type: "answer-exercise" }
    act(() => {
      firstPort.onmessage?.({ data: setState })
    })
    expect(onMessage).toHaveBeenCalledWith(setState, firstPort)
    expect(firstPort.postMessage).toHaveBeenCalledWith({
      message: "current-state",
      data: setState,
      valid: true,
    })
  })

  test("stops retrying after unmount", () => {
    act(() => {
      root?.unmount()
    })
    root = null
    act(() => {
      jest.advanceTimersByTime(60_000)
    })
    expect(readyPostCount()).toBe(1)
  })
})

describe("reload guard", () => {
  const config = LOAD_FAILURE_RELOAD_GUARD

  test("allows reloads up to the limit within the window", () => {
    const storage = new MemoryStorage()
    expect(recordReloadIfAllowed(storage, 1_000, config)).toBe(true)
    expect(recordReloadIfAllowed(storage, 2_000, config)).toBe(true)
    expect(recordReloadIfAllowed(storage, 3_000, config)).toBe(false)
    expect(recordReloadIfAllowed(storage, 1_000 + config.windowMs - 1, config)).toBe(false)
  })

  test("allows reloading again once earlier reloads leave the window", () => {
    const storage = new MemoryStorage()
    recordReloadIfAllowed(storage, 1_000, config)
    recordReloadIfAllowed(storage, 2_000, config)
    expect(recordReloadIfAllowed(storage, 1_000 + config.windowMs, config)).toBe(true)
    expect(recordReloadIfAllowed(storage, 1_001 + config.windowMs, config)).toBe(false)
  })

  test("treats unreadable stored data as no earlier reloads", () => {
    const storage = new MemoryStorage()
    storage.setItem(config.storageKey, "{not json")
    expect(recordReloadIfAllowed(storage, 1_000, config)).toBe(true)
    storage.setItem(config.storageKey, JSON.stringify({ count: 5 }))
    expect(recordReloadIfAllowed(storage, 1_000, config)).toBe(true)
  })

  test("refuses to reload when the reload can't be recorded", () => {
    expect(recordReloadIfAllowed(null, 1_000, config)).toBe(false)
    const throwingOnRead = {
      getItem: () => {
        throw new Error("SecurityError")
      },
      setItem: jest.fn(),
    }
    expect(recordReloadIfAllowed(throwingOnRead, 1_000, config)).toBe(false)
    const throwingOnWrite = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError")
      },
    }
    expect(recordReloadIfAllowed(throwingOnWrite, 1_000, config)).toBe(false)
  })

  describe("inline script", () => {
    type Listener = (event: unknown) => void

    function loadPageWithScript(sessionStorage: () => Storage | MemoryStorage) {
      const listeners: Record<string, Listener[]> = {}
      const reload = jest.fn()
      const fakeWindow = {
        addEventListener: (type: string, listener: Listener) => {
          ;(listeners[type] ??= []).push(listener)
        },
        get sessionStorage() {
          return sessionStorage()
        },
        location: { reload },
      }
      new Function("window", buildLoadFailureRecoveryScript())(fakeWindow)
      const dispatch = (type: string, event: unknown) =>
        (listeners[type] ?? []).forEach((listener) => listener(event))
      return { reload, dispatch }
    }

    const failedScriptEvent = { target: { tagName: "SCRIPT" }, error: undefined }

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(100_000)
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test("reloads at most twice per minute on failed script loads", () => {
      const storage = new MemoryStorage()
      const reloads = [1, 2, 3].map(() => {
        const page = loadPageWithScript(() => storage)
        page.dispatch("error", failedScriptEvent)
        return page.reload.mock.calls.length
      })
      expect(reloads).toEqual([1, 1, 0])

      jest.setSystemTime(100_000 + LOAD_FAILURE_RELOAD_GUARD.windowMs)
      const page = loadPageWithScript(() => storage)
      page.dispatch("error", failedScriptEvent)
      expect(page.reload).toHaveBeenCalledTimes(1)
    })

    test("reloads once per page even when several assets fail", () => {
      const storage = new MemoryStorage()
      const page = loadPageWithScript(() => storage)
      page.dispatch("error", failedScriptEvent)
      page.dispatch("error", { target: { tagName: "LINK", rel: "stylesheet" } })
      expect(page.reload).toHaveBeenCalledTimes(1)
      expect(
        JSON.parse(storage.getItem(LOAD_FAILURE_RELOAD_GUARD.storageKey) ?? "[]"),
      ).toHaveLength(1)
    })

    test("reloads on chunk load errors", () => {
      const chunkError = Object.assign(new Error("Loading chunk 182 failed."), {
        name: "ChunkLoadError",
      })
      const rejected = loadPageWithScript(() => new MemoryStorage())
      rejected.dispatch("unhandledrejection", { reason: chunkError })
      expect(rejected.reload).toHaveBeenCalledTimes(1)

      const thrown = loadPageWithScript(() => new MemoryStorage())
      thrown.dispatch("error", { target: {}, error: new Error("Loading CSS chunk 7 failed.") })
      expect(thrown.reload).toHaveBeenCalledTimes(1)
    })

    test("ignores unrelated errors", () => {
      const page = loadPageWithScript(() => new MemoryStorage())
      page.dispatch("error", { target: {}, error: new TypeError("x is undefined") })
      page.dispatch("error", { target: { tagName: "IMG" } })
      page.dispatch("error", { target: { tagName: "LINK", rel: "icon" } })
      page.dispatch("unhandledrejection", { reason: new Error("fetch failed") })
      expect(page.reload).not.toHaveBeenCalled()
    })

    test("does not reload when session storage is blocked", () => {
      const page = loadPageWithScript(() => {
        throw new Error("SecurityError")
      })
      page.dispatch("error", failedScriptEvent)
      expect(page.reload).not.toHaveBeenCalled()
    })
  })
})

describe("cache headers", () => {
  type HeaderRule = { source: string; headers: { key: string; value: string }[] }

  async function headerValue(source: string, key: string) {
    const rules: HeaderRule[] = await nextConfig.headers()
    const values = rules
      .filter((rule) => rule.source === source)
      .flatMap((rule) => rule.headers)
      .filter((header) => header.key.toLowerCase() === key.toLowerCase())
      .map((header) => header.value)
    return values[values.length - 1]
  }

  test("the iframe page is always revalidated", async () => {
    expect(await headerValue("/iframe", "Cache-Control")).toBe("no-cache")
  })

  test("every response stays embeddable", async () => {
    expect(await headerValue("/(.*)", "Access-Control-Allow-Origin")).toBe("*")
    expect(await headerValue("/(.*)", "X-Frame-Options")).toBeUndefined()
  })
})

describe("renderer error boundary", () => {
  it("shows an error and asks the host to reload the iframe", () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined)
    const postMessage = jest.fn()
    const port = { postMessage } as unknown as MessagePort
    const brokenState = {
      view_type: "answer-exercise" as const,
      public_spec: {
        id: "broken",
        type: SurveyType.NonFactorial,
        content: null,
      } as unknown as Survey,
    }
    const container = document.createElement("div")
    const root = createRoot(container)
    act(() => {
      root.render(React.createElement(Renderer, { port, setState: jest.fn(), state: brokenState }))
    })

    expect(container.querySelector('[role="alert"]')).not.toBeNull()
    expect(postMessage).toHaveBeenCalledTimes(1)
    expect(postMessage).toHaveBeenCalledWith({ message: "request-iframe-reload" })
    expect(isMessageFromIframe(postMessage.mock.calls[0][0])).toBe(true)

    const nextState = {
      ...brokenState,
      public_spec: { id: "fixed", type: SurveyType.NonFactorial, content: [] } as unknown as Survey,
    }
    act(() => {
      root.render(React.createElement(Renderer, { port, setState: jest.fn(), state: nextState }))
    })
    expect(container.querySelector('[role="alert"]')).toBeNull()
    act(() => root.unmount())
  })
})

describe("spec audit checks", () => {
  const trigger = surveyItem("has-dog", "has_dog", yesNo)
  const ifYes = [{ questionLabel: "has_dog", triggeringOption: "yes" }]
  const ifMaybe = [{ questionLabel: "has_dog", triggeringOption: "maybe" }]

  describe("fixtures", () => {
    it("finds nothing in the test-data and Alusta-arkuus specs", () => {
      expect(checkSpec(nonFactorialSpec as unknown as Survey)).toEqual([])
      expect(checkSpec(miniTestSpec as unknown as FactorialSurvey)).toEqual([])
      expect(checkSpec(personalitySpec as unknown as FactorialSurvey)).toEqual([])
      expect(checkSpec(alustaArkuusSurvey as Survey)).toEqual([])
      expect(checkSpec(alustaArkuusFactorial as PublicFactorialSurveySpec)).toEqual([])
    })

    it("finds nothing in a null spec", () => {
      expect(checkSpec(null)).toEqual([])
    })

    it("accepts duplicate labels and mandatory number fields, which no longer block submitting", () => {
      expect(checkSurveyContent(duplicateLabelSurvey.content)).toEqual([])
      expect(
        checkSurveyContent([surveyItem("weight", "weight", { type: AnswerType.Number })]),
      ).toEqual([])
    })
  })

  describe("mandatory items without input", () => {
    it.each([
      ["no answer type", surveyItem("q", "q", { type: AnswerType.None })],
      ["file upload", surveyItem("q", "q", { type: AnswerType.FileUpload })],
      ["unknown answer type", surveyItem("q", "q", { type: "slider" as AnswerType })],
      ["radio group without options", surveyItem("q", "q", { type: AnswerType.RadioGroup })],
      [
        "weighted radio group without options",
        surveyItem("q", "q", { type: AnswerType.WeightedRadioGroup }),
      ],
      ["info row", surveyItem("q", "info")],
    ])("flags %s", (_name, item) => {
      expect(findMandatoryWithoutInput([item])).toMatchObject([
        { kind: "mandatory-without-input", itemId: item.id },
      ])
    })

    it("passes answerable and optional items", () => {
      const weighted = surveyItem("w", "w", { type: AnswerType.WeightedRadioGroup })
      weighted.answer.factorialOptions = [{ id: "o1", name: "often", value: 2 }]
      const items = [
        trigger,
        weighted,
        surveyItem("text", "text"),
        surveyItem("date", "date", { type: AnswerType.Date }),
        surveyItem("consent", "consent", { type: AnswerType.ConsentCheckbox, options: ["ok"] }),
        surveyItem("optional", "optional", { type: AnswerType.None, mandatory: false }),
      ]
      expect(findMandatoryWithoutInput(items)).toEqual([])
    })
  })

  describe("conditions pointing at missing options", () => {
    it("flags a condition on an option no item offers", () => {
      const item = surveyItem("dog-name", "dog_name", { dependsOn: ifMaybe })
      const findings = findConditionsWithMissingOptions([trigger, item])
      expect(findings).toMatchObject([{ kind: "condition-missing-option", itemId: item.id }])
      expect(findings[0].message).toContain('has_dog = "maybe"')
    })

    it("flags only the variant whose condition is broken", () => {
      const valid = surveyItem("valid", "dog_name", { dependsOn: ifYes })
      const broken = surveyItem("broken", "dog_name", {
        dependsOn: [{ questionLabel: "missing", triggeringOption: "yes" }],
      })
      expect(findConditionsWithMissingOptions([trigger, valid, broken])).toMatchObject([
        { itemId: broken.id },
      ])
    })

    it("passes conditions on offered options", () => {
      const item = surveyItem("dog-name", "dog_name", { dependsOn: ifYes })
      expect(findConditionsWithMissingOptions([trigger, item])).toEqual([])
    })
  })

  describe("mandatory items that can never be shown", () => {
    it("flags an item whose trigger option does not exist", () => {
      const item = surveyItem("dog-name", "dog_name", { dependsOn: ifMaybe })
      expect(findMandatoryNeverShown([trigger, item])).toMatchObject([
        { kind: "mandatory-never-shown", itemId: item.id },
      ])
    })

    it("flags an item behind a trigger that can never be shown", () => {
      const unreachable = surveyItem("breed", "breed", {
        type: AnswerType.RadioGroup,
        options: ["husky"],
        mandatory: false,
        dependsOn: ifMaybe,
      })
      const chained = surveyItem("husky-age", "husky_age", {
        dependsOn: [{ questionLabel: "breed", triggeringOption: "husky" }],
      })
      expect(findMandatoryNeverShown([trigger, unreachable, chained])).toMatchObject([
        { itemId: chained.id },
      ])
    })

    it("flags items that only trigger each other", () => {
      const a = surveyItem("a", "a", {
        type: AnswerType.RadioGroup,
        options: ["x"],
        dependsOn: [{ questionLabel: "b", triggeringOption: "x" }],
      })
      const b = surveyItem("b", "b", {
        type: AnswerType.RadioGroup,
        options: ["x"],
        mandatory: false,
        dependsOn: [{ questionLabel: "a", triggeringOption: "x" }],
      })
      expect(findMandatoryNeverShown([a, b])).toMatchObject([{ itemId: a.id }])
    })

    it("passes chained conditions, multi-choice and weighted triggers", () => {
      const breed = surveyItem("breed", "breed", {
        type: AnswerType.MultiChoice,
        options: ["husky", "poodle"],
        mandatory: false,
        dependsOn: ifYes,
      })
      const walks = surveyItem("walks", "walks", {
        type: AnswerType.WeightedRadioGroup,
        mandatory: false,
      })
      walks.answer.factorialOptions = [{ id: "o1", name: "daily", value: 1 }]
      const items = [
        trigger,
        breed,
        walks,
        surveyItem("husky-age", "husky_age", {
          dependsOn: [{ questionLabel: "breed", triggeringOption: "husky" }],
        }),
        surveyItem("walk-length", "walk_length", {
          dependsOn: [{ questionLabel: "walks", triggeringOption: "daily" }],
        }),
      ]
      expect(findMandatoryNeverShown(items)).toEqual([])
    })

    it("treats an item marked conditional without conditions as always shown", () => {
      const item = { ...surveyItem("q", "q"), conditional: true }
      expect(findMandatoryNeverShown([item])).toEqual([])
      expect(
        findMandatoryNeverShown([{ ...item, dependsOn: null } as unknown as SurveyItem]),
      ).toEqual([])
    })
  })

  describe("factorial specs", () => {
    const question = (questionLabel: string, mandatory: boolean) => ({
      id: `${questionLabel}-id`,
      questionLabel,
      question: questionLabel,
      mandatory,
    })
    const options = factorialSpec.options

    it("flags a mandatory info row", () => {
      expect(
        checkFactorialSpec({ options, questions: [question("info", true), question("q1", true)] }),
      ).toMatchObject([{ kind: "mandatory-without-input", itemId: "info-id" }])
    })

    it("flags mandatory questions when there are no options", () => {
      expect(
        checkFactorialSpec({
          options: [],
          questions: [question("q1", true), question("q2", false)],
        }),
      ).toMatchObject([{ itemId: "q1-id" }])
    })

    it("passes answerable questions and optional info rows", () => {
      expect(
        checkFactorialSpec({ options, questions: [question("info", false), question("q1", true)] }),
      ).toEqual([])
    })
  })

  it("checkSurveyContent combines every non-factorial check", () => {
    const content = [
      trigger,
      surveyItem("photo", "photo", { type: AnswerType.FileUpload }),
      surveyItem("ghost", "ghost", { dependsOn: ifMaybe }),
    ]
    expect(
      checkSurveyContent(content)
        .map((finding) => finding.kind)
        .sort(),
    ).toEqual(["condition-missing-option", "mandatory-never-shown", "mandatory-without-input"])
    expect(checkSpec(survey(content))).toHaveLength(3)
  })
})
