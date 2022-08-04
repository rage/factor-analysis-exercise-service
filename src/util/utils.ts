import { Factor, FactorialSurvey, RatedQuestion } from "./stateInterfaces"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const matrixMultiplication = require("matrix-multiplication")

export const calculateFactors = (
  survey: FactorialSurvey,
  ratedQuestions: RatedQuestion[],
): Factor[] => {
  const matrix = survey.matrix
  const factors: Factor[] = survey.factors

  factors.map((f, f_idx) => {
    let score = 0
    ratedQuestions.map((q, q_idx) => {
      score = q.rate ? score + matrix[q_idx][f_idx] * q.rate : score
    })
    f.score = score
  })

  // create the rate vector to be multiplied with matrix, substitute null values with zero, LATER: use average imputation values from the research group
  const questionRateVector = ratedQuestions.map((rq) => rq.rate ?? 0)
  const result = vectorMatrixMultiplication(questionRateVector, matrix)
  console.log(result)
  return factors
}

export const parseLabelQuestion = (input: string): string[] | null => {
  const parsedString = input.split(";")
  if (!parsedString[0] || !parsedString[1]) {
    return null
  }
  const labelQuestion = [parsedString[0].split("\n").join("").split(" ").join(""), parsedString[1]]
  return labelQuestion
}

export const vectorMatrixMultiplication = (
  questionVector: number[],
  matrix: number[][],
): number[][] => {
  const middle = questionVector.length
  const mul = matrixMultiplication()(middle)
  console.log(matrixMultiplication.error)
  console.log(matrix)
  const collapsedMatrix = matrix.flat()
  console.log(collapsedMatrix)
  return mul(questionVector, collapsedMatrix)
}
