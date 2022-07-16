import { Factor, FactorialSurvey, RatedQuestion } from "./stateInterfaces"


export const calculateFactors = (
  survey: FactorialSurvey,
  ratedQuestions: RatedQuestion[]
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

  return (factors)
}