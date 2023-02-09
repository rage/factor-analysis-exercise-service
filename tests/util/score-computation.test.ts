import {
  Factor,
  FactorialOption,
  NormalizationValues,
  Question,
  RatedQuestion,
} from "../../src/util/stateInterfaces"
import {
  calculateFactors,
  mapRatesToAnswers,
  sanitizeQuestions,
  scaleAndImputRatedQuestions,
  vectorMatrixMultiplication,
} from "../../src/util/utils"

export const testFactors: Factor[] = [
  {
    id: "61cb4b99-8d3b-453d-95f1-b11d06e4a5e0",
    label: "factor_one",
    name: "name of factor one",
    weights: {
      question_one: 1,
      question_two: -0.5,
      three: -1,
      five: 1,
    },
    score: 0,
    range: {
      min: -6,
      max: 10,
    },
    description: "description of factor one\n\ncan be anything",
  },
  {
    id: "cac71a2b-07b6-430e-a26f-5995eeafa712",
    label: "factor_two",
    name: "second factor",
    weights: {
      question_one: -1,
      question_two: 2,
      three: -1.5,
      five: -1,
    },
    score: 0,
    range: {
      min: -5,
      max: 13,
    },
    description: "second factor is good",
  },
  {
    id: "4ddec27a-1b8b-4f2d-badf-7de9039ef675",
    label: "factor_three",
    name: "three",
    weights: {
      question_one: 0.5,
      question_two: 1.5,
      three: 1,
      five: 0,
    },
    score: 0,
    range: {
      min: -2.5,
      max: 15,
    },
    description: "this is not a great factor, should be avoided\n\nask for help",
  },
]

export const testQuestions: Question[] = [
  {
    id: "177c84db-0c81-4ff5-b2a4-d1bf4b3745e8",
    questionLabel: "info",
    question: " this is just an info element to provide some info for the coming section....",
  },
  {
    id: "5b8fcb89-294d-47b3-9b0c-aec435c66cf0",
    questionLabel: "question_one",
    question: " This is the first question",
  },
  {
    id: "aad5183b-594a-4779-9fd2-7892d1e81d28",
    questionLabel: "question_two",
    question: "This is the second",
  },
  {
    id: "305aa478-25df-4748-a416-dfdde1661b81",
    questionLabel: "info",
    question: "Questions should have unique question labels for identification",
  },
  {
    id: "b7dd0f63-d710-4fd0-a55f-92041bb0b332",
    questionLabel: "three",
    question: "otherwise they can contain anything",
  },
  {
    id: "564089ab-f1ec-413f-8440-f247cee1eadf",
    questionLabel: "five",
    question: " newlines should be avoided",
  },
]

export const testOptions: FactorialOption[] = [
  {
    name: "no",
    value: 1,
    id: "10e97e0f-ea25-4eed-b1d8-20ae8306303b",
  },
  {
    name: "maybe",
    value: 2,
    id: "95806e1e-00a7-4431-ab3e-00be3de5870a",
  },
  {
    name: "yes",
    value: 3,
    id: "ae93bc43-3d8f-4296-9f8a-53358ad41ac6",
  },
  {
    name: "Can't tell",
    value: null,
    id: "7cf41679-a0cf-4ef9-a634-782f8132069b",
  },
]

export const testAnswer: RatedQuestion[] = [
  {
    questionLabel: "question_one",
    chosenOption: "maybe",
  },
  {
    questionLabel: "question_two",
    chosenOption: "yes",
  },
  {
    questionLabel: "three",
    chosenOption: "no",
  },
  {
    questionLabel: "five",
    chosenOption: "yes",
  },
]

export const meansAndStandardDeviations: NormalizationValues = {
  means: {
    question_one: 1.7654,
    question_two: -0.545,
    three: -1.36,
    five: 4.8234765,
  },
  standardDeviations: {
    question_one: 0.7,
    question_two: 1.324,
    three: 0.987,
    five: 1.789,
  },
}

describe("When all questions are rated propperly, thus not null", () => {
  test("factor weights matrix multiplication is correct small question set", () => {
    const sanitizedAnswers = sanitizeQuestions(testAnswer) as RatedQuestion[]
    sanitizedAnswers.map((a) => {
      expect(a.questionLabel).not.toBe("info")
    })
    const rates = mapRatesToAnswers(testOptions, sanitizedAnswers)
    const rateVector: number[] = rates.map((e) => e.rate as number)
    const weightsMatrix = sanitizedAnswers.map((e) => {
      return testFactors.map((f) => f.weights[e.questionLabel])
    })

    const scoredFactors = calculateFactors(testFactors, rates)
    const derivedScoreVector = vectorMatrixMultiplication(rateVector, weightsMatrix)
    expect(scoredFactors.map((e) => e.score)).toEqual(derivedScoreVector)
  })

  test("factor weight matrix multiplication correct with random rates, small question set", () => {
    const answeredQuestions = (sanitizeQuestions(testAnswer) as RatedQuestion[]).map((e) => {
      return { ...e, rate: Math.floor(Math.random() * 10) }
    })

    const rateVector: number[] = answeredQuestions.map((e) => e.rate as number)
    const weightsMatrix = answeredQuestions.map((e) => {
      return testFactors.map((f) => f.weights[e.questionLabel])
    })

    const scoredFactors = calculateFactors(testFactors, answeredQuestions)
    const derivedScoreVector = vectorMatrixMultiplication(rateVector, weightsMatrix)
    expect(scoredFactors.map((e) => e.score)).toEqual(derivedScoreVector)
  })
})

describe("Scaling rated questions", () => {
  test("scale rated questions scales correctly", () => {
    const answeredQuestions = sanitizeQuestions(testAnswer) as RatedQuestion[]
    const rates = mapRatesToAnswers(testOptions, answeredQuestions)

    const scaledAnswers = scaleAndImputRatedQuestions(rates, meansAndStandardDeviations, 0)
    const expected = rates.map((q) => {
      return {
        ...q,
        rate:
          ((q.rate as number) - meansAndStandardDeviations.means[q.questionLabel]) /
          meansAndStandardDeviations.standardDeviations[q.questionLabel],
      }
    })
    expect(scaledAnswers).toEqual(expected)
  })

  test("scale rated questions scales correctly when some rates are nan", () => {
    const answeredQuestions = sanitizeQuestions(testAnswer) as RatedQuestion[]
    let p = 0
    const rates = mapRatesToAnswers(testOptions, answeredQuestions)

    const newRates = rates.map((q) => {
      p++
      return { ...q, rate: p > 3 ? null : q.rate }
    })
    const expected = newRates.map((q) => {
      return {
        ...q,
        rate: q.rate
          ? (q.rate - meansAndStandardDeviations.means[q.questionLabel]) /
            meansAndStandardDeviations.standardDeviations[q.questionLabel]
          : 0,
      }
    })
    expect(scaleAndImputRatedQuestions(newRates, meansAndStandardDeviations, 0)).toBeNull()
    expect(scaleAndImputRatedQuestions(newRates, meansAndStandardDeviations, 0)).not.toBe(expected)
    expect(scaleAndImputRatedQuestions(newRates, meansAndStandardDeviations, 1)).not.toBeNull()
    expect(scaleAndImputRatedQuestions(newRates, meansAndStandardDeviations, 1)).toEqual(expected)
  })

  test("scale rated questions scales correctly with random means and sds", () => {
    const answeredQuestions = sanitizeQuestions(testAnswer) as RatedQuestion[]
    const rates = mapRatesToAnswers(testOptions, answeredQuestions)

    const means: { [id: string]: number } = {}
    const standardDeviations: { [id: string]: number } = {}
    answeredQuestions.map((q) => {
      means[q.questionLabel] = Math.random() * 10
      standardDeviations[q.questionLabel] = Math.random() + 1
    })
    const randomMeansAndStandardDeviations: NormalizationValues = { means, standardDeviations }
    const scaledAnswers = scaleAndImputRatedQuestions(rates, randomMeansAndStandardDeviations, 0)
    const expected = rates.map((q) => {
      return {
        ...q,
        rate:
          ((q.rate as number) - randomMeansAndStandardDeviations.means[q.questionLabel]) /
          randomMeansAndStandardDeviations.standardDeviations[q.questionLabel],
      }
    })
    expect(scaledAnswers).toEqual(expected)
  })
})
