import {
  AnswerType,
  FactorialSurvey,
  Survey,
  SurveyItem,
  SurveyItemCondition,
  SurveyType,
} from "../src/util/spec-types/privateSpec"
import {
  checkFactorialSpec,
  checkSpec,
  checkSurveyContent,
  findConditionsWithMissingOptions,
  findMandatoryNeverShown,
  findMandatoryNumberItems,
  findMandatoryWithoutInput,
  findShadowedDuplicateLabels,
} from "../src/util/specChecks"

import miniTestSpec from "./test-data/factorial/mini-test/private-spec.json"
import personalitySpec from "./test-data/factorial/personality-test/test-spec.json"
import surveySpec from "./test-data/non-factorial/private-spec.json"

let nextId = 0

const surveyItem = (
  questionLabel: string,
  type: AnswerType,
  {
    options = [],
    mandatory = false,
    dependsOn,
  }: { options?: string[]; mandatory?: boolean; dependsOn?: SurveyItemCondition[] } = {},
): SurveyItem => {
  nextId += 1
  return {
    id: `item-${nextId}`,
    question: { id: `question-${nextId}`, questionLabel, question: questionLabel, mandatory },
    answer: { type, options },
    conditional: dependsOn !== undefined,
    dependsOn,
  }
}

const trigger = surveyItem("has_dog", AnswerType.RadioGroup, {
  options: ["yes", "no"],
  mandatory: true,
})
const ifYes = [{ questionLabel: "has_dog", triggeringOption: "yes" }]
const ifNo = [{ questionLabel: "has_dog", triggeringOption: "no" }]

describe("spec audit checks", () => {
  describe("fixtures", () => {
    test("the non-factorial fixture has no findings", () => {
      expect(checkSpec(surveySpec as unknown as Survey)).toEqual([])
    })

    test("the factorial fixtures have no findings", () => {
      expect(checkSpec(miniTestSpec as unknown as FactorialSurvey)).toEqual([])
      expect(checkSpec(personalitySpec as unknown as FactorialSurvey)).toEqual([])
    })

    test("a null spec has no findings", () => {
      expect(checkSpec(null)).toEqual([])
    })
  })

  describe("shadowed duplicate labels", () => {
    test("flags a mandatory variant after a conditional one with the same label", () => {
      const hidden = surveyItem("dog_age", AnswerType.Text, { mandatory: true, dependsOn: ifYes })
      const visible = surveyItem("dog_age", AnswerType.Text, { mandatory: true, dependsOn: ifNo })
      const findings = findShadowedDuplicateLabels([trigger, hidden, visible])
      expect(findings).toHaveLength(1)
      expect(findings[0]).toMatchObject({
        kind: "shadowed-duplicate-label",
        itemId: visible.id,
        questionLabel: "dog_age",
      })
    })

    test("flags a mandatory variant after an optional unconditional one", () => {
      const optional = surveyItem("dog_age", AnswerType.Text)
      const mandatory = surveyItem("dog_age", AnswerType.Text, { mandatory: true })
      expect(findShadowedDuplicateLabels([optional, mandatory])).toHaveLength(1)
    })

    test("passes when the first variant is always shown and mandatory", () => {
      const first = surveyItem("dog_age", AnswerType.Text, { mandatory: true })
      const second = surveyItem("dog_age", AnswerType.Text, { mandatory: true, dependsOn: ifNo })
      expect(findShadowedDuplicateLabels([trigger, first, second])).toEqual([])
    })

    test("passes optional later variants and repeated info rows", () => {
      const hidden = surveyItem("dog_age", AnswerType.Text, { mandatory: true, dependsOn: ifYes })
      const optional = surveyItem("dog_age", AnswerType.Text, { dependsOn: ifNo })
      const info = [surveyItem("info", AnswerType.None), surveyItem("info", AnswerType.None)]
      expect(findShadowedDuplicateLabels([trigger, hidden, optional, ...info])).toEqual([])
    })
  })

  describe("mandatory items without input", () => {
    test.each([
      ["no answer type", surveyItem("q", AnswerType.None, { mandatory: true })],
      ["file upload", surveyItem("q", AnswerType.FileUpload, { mandatory: true })],
      ["unknown answer type", surveyItem("q", "slider" as AnswerType, { mandatory: true })],
      ["radio group without options", surveyItem("q", AnswerType.RadioGroup, { mandatory: true })],
      [
        "weighted radio group without options",
        surveyItem("q", AnswerType.WeightedRadioGroup, { mandatory: true }),
      ],
      ["info row", surveyItem("info", AnswerType.Text, { mandatory: true })],
    ])("flags %s", (_name, item) => {
      expect(findMandatoryWithoutInput([item])).toMatchObject([
        { kind: "mandatory-without-input", itemId: item.id },
      ])
    })

    test("passes answerable and optional items", () => {
      const weighted = surveyItem("w", AnswerType.WeightedRadioGroup, { mandatory: true })
      weighted.answer.factorialOptions = [{ id: "o1", name: "often", value: 2 }]
      const items = [
        trigger,
        weighted,
        surveyItem("text", AnswerType.Text, { mandatory: true }),
        surveyItem("date", AnswerType.Date, { mandatory: true }),
        surveyItem("info-header", AnswerType.ConsentCheckbox, { mandatory: true, options: ["ok"] }),
        surveyItem("optional", AnswerType.None),
      ]
      expect(findMandatoryWithoutInput(items)).toEqual([])
    })
  })

  describe("conditions pointing at missing options", () => {
    test("flags a condition on an option no item offers", () => {
      const item = surveyItem("dog_name", AnswerType.Text, {
        dependsOn: [{ questionLabel: "has_dog", triggeringOption: "maybe" }],
      })
      const findings = findConditionsWithMissingOptions([trigger, item])
      expect(findings).toMatchObject([{ kind: "condition-missing-option", itemId: item.id }])
      expect(findings[0].message).toContain('has_dog = "maybe"')
    })

    test("flags only the variant whose condition is broken", () => {
      const valid = surveyItem("dog_name", AnswerType.Text, { dependsOn: ifYes })
      const broken = surveyItem("dog_name", AnswerType.Text, {
        dependsOn: [{ questionLabel: "missing", triggeringOption: "yes" }],
      })
      expect(findConditionsWithMissingOptions([trigger, valid, broken])).toMatchObject([
        { itemId: broken.id },
      ])
    })

    test("passes conditions on offered options", () => {
      const item = surveyItem("dog_name", AnswerType.Text, { dependsOn: ifYes })
      expect(findConditionsWithMissingOptions([trigger, item])).toEqual([])
    })
  })

  describe("mandatory items that can never be shown", () => {
    test("flags an item whose trigger option does not exist", () => {
      const item = surveyItem("dog_name", AnswerType.Text, {
        mandatory: true,
        dependsOn: [{ questionLabel: "has_dog", triggeringOption: "maybe" }],
      })
      expect(findMandatoryNeverShown([trigger, item])).toMatchObject([
        { kind: "mandatory-never-shown", itemId: item.id },
      ])
    })

    test("flags an item behind a trigger that can never be shown", () => {
      const unreachable = surveyItem("breed", AnswerType.RadioGroup, {
        options: ["husky"],
        dependsOn: [{ questionLabel: "has_dog", triggeringOption: "maybe" }],
      })
      const chained = surveyItem("husky_age", AnswerType.Text, {
        mandatory: true,
        dependsOn: [{ questionLabel: "breed", triggeringOption: "husky" }],
      })
      expect(findMandatoryNeverShown([trigger, unreachable, chained])).toMatchObject([
        { itemId: chained.id },
      ])
    })

    test("flags items that only trigger each other", () => {
      const a = surveyItem("a", AnswerType.RadioGroup, {
        options: ["x"],
        mandatory: true,
        dependsOn: [{ questionLabel: "b", triggeringOption: "x" }],
      })
      const b = surveyItem("b", AnswerType.RadioGroup, {
        options: ["x"],
        dependsOn: [{ questionLabel: "a", triggeringOption: "x" }],
      })
      expect(findMandatoryNeverShown([a, b])).toMatchObject([{ itemId: a.id }])
    })

    test("passes chained conditions, multi-choice and weighted triggers", () => {
      const breed = surveyItem("breed", AnswerType.MultiChoice, {
        options: ["husky", "poodle"],
        dependsOn: ifYes,
      })
      const weighted = surveyItem("walks", AnswerType.WeightedRadioGroup)
      weighted.answer.factorialOptions = [{ id: "o1", name: "daily", value: 1 }]
      const items = [
        trigger,
        breed,
        weighted,
        surveyItem("husky_age", AnswerType.Text, {
          mandatory: true,
          dependsOn: [{ questionLabel: "breed", triggeringOption: "husky" }],
        }),
        surveyItem("walk_length", AnswerType.Text, {
          mandatory: true,
          dependsOn: [{ questionLabel: "walks", triggeringOption: "daily" }],
        }),
      ]
      expect(findMandatoryNeverShown(items)).toEqual([])
    })

    test("treats an item marked conditional without conditions as always shown", () => {
      const item = { ...surveyItem("q", AnswerType.Text, { mandatory: true }), conditional: true }
      expect(findMandatoryNeverShown([item])).toEqual([])
    })
  })

  describe("mandatory number fields", () => {
    test("flags mandatory number fields only", () => {
      const mandatory = surveyItem("weight", AnswerType.Number, { mandatory: true })
      const optional = surveyItem("height", AnswerType.Number)
      expect(findMandatoryNumberItems([mandatory, optional])).toMatchObject([
        { kind: "mandatory-number", itemId: mandatory.id },
      ])
    })
  })

  describe("factorial specs", () => {
    const options = [
      { id: "o1", name: "yes", value: 1 },
      { id: "o2", name: "en osaa sanoa", value: null },
    ]
    const question = (questionLabel: string, mandatory: boolean) => ({
      id: `${questionLabel}-id`,
      questionLabel,
      question: questionLabel,
      mandatory,
    })

    test("flags a mandatory info row", () => {
      expect(
        checkFactorialSpec({ options, questions: [question("info", true), question("q1", true)] }),
      ).toMatchObject([{ kind: "mandatory-without-input", itemId: "info-id" }])
    })

    test("flags mandatory questions when there are no options", () => {
      expect(
        checkFactorialSpec({
          options: [],
          questions: [question("q1", true), question("q2", false)],
        }),
      ).toMatchObject([{ itemId: "q1-id" }])
    })

    test("passes answerable questions and optional info rows", () => {
      expect(
        checkFactorialSpec({ options, questions: [question("info", false), question("q1", true)] }),
      ).toEqual([])
    })
  })

  test("checkSurveyContent combines every non-factorial check", () => {
    const content = [
      trigger,
      surveyItem("dog_age", AnswerType.Text, { mandatory: true, dependsOn: ifYes }),
      surveyItem("dog_age", AnswerType.Text, { mandatory: true, dependsOn: ifNo }),
      surveyItem("photo", AnswerType.FileUpload, { mandatory: true }),
      surveyItem("ghost", AnswerType.Text, {
        mandatory: true,
        dependsOn: [{ questionLabel: "has_dog", triggeringOption: "maybe" }],
      }),
      surveyItem("weight", AnswerType.Number, { mandatory: true }),
    ]
    const kinds = checkSurveyContent(content).map((finding) => finding.kind)
    expect(kinds.sort()).toEqual(
      [
        "condition-missing-option",
        "mandatory-never-shown",
        "mandatory-number",
        "mandatory-without-input",
        "shadowed-duplicate-label",
      ].sort(),
    )
    expect(checkSpec({ id: "s", type: SurveyType.NonFactorial, content })).toHaveLength(5)
  })
})
