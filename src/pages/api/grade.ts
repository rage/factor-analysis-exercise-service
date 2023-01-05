/* eslint-disable i18next/no-literal-string */
import type { NextApiRequest, NextApiResponse } from "next"

import { UserVariablesMap } from "../../shared-module/exercise-service-protocol-types"
import { cors, runMiddleware } from "../../util/cors"
import {
  ClientErrorResponse,
  FactorReport,
  PrivateSpec,
  RatedQuestion,
  SubmittedForm,
  SurveyItem,
  SurveyType,
} from "../../util/stateInterfaces"
import {
  calculateFactors,
  getGlobalVariables,
  sanitizeQuestions,
  scaleRatedQuestions,
} from "../../util/utils"

export default async (
  req: NextApiRequest,
  res: NextApiResponse<GradingResult | ClientErrorResponse>,
): Promise<void> => {
  await runMiddleware(req, res, cors)

  if (req.method !== "POST") {
    return res.status(404).json({ message: "Not found" })
  }

  return handlePost(req, res)
}

interface GradingResult {
  grading_progress: "FullyGraded" | "Pending" | "PendingManual" | "Failed"
  score_given: number
  score_maximum: number
  feedback_text: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feedback_json: ExerciseFeedback | null
  set_user_variables?: UserVariablesMap | null
}

export interface ExerciseFeedback {
  nameKey?: string
  breedKey?: string
  factorReport: FactorReport[]
}

interface GradingRequest {
  exercise_spec: PrivateSpec
  submission_data: SubmittedForm
}

const handlePost = (req: NextApiRequest, res: NextApiResponse<GradingResult>) => {
  const gradingRequest: GradingRequest = req.body

  if (!gradingRequest?.submission_data) {
    return res.status(200).json({
      grading_progress: "FullyGraded",
      score_given: 0,
      score_maximum: 1,
      feedback_text: "You didn't select anything",
      feedback_json: null,
    })
  }

  if (
    gradingRequest.exercise_spec?.type === SurveyType.Factorial &&
    gradingRequest.exercise_spec.calculateFeedback
  ) {
    const sanitizedAnswers = sanitizeQuestions(
      gradingRequest.submission_data.answeredQuestions as RatedQuestion[],
    ) as RatedQuestion[]
    const scaledAnswers =
      gradingRequest.exercise_spec.meansAndStandardDeviations &&
      gradingRequest.exercise_spec.allowedNans
        ? scaleRatedQuestions(
            sanitizedAnswers,
            gradingRequest.exercise_spec.meansAndStandardDeviations,
            gradingRequest.exercise_spec.allowedNans,
          )
        : sanitizedAnswers
    const factorReports: FactorReport[] | null = scaledAnswers
      ? calculateFactors(gradingRequest.exercise_spec.factors, scaledAnswers)
      : null
    const nameKey = gradingRequest.exercise_spec.reportVariables?.name
    const breedKey = gradingRequest.exercise_spec.reportVariables?.breed

    return res.status(200).json({
      grading_progress: "FullyGraded",
      score_given: 1,
      score_maximum: 1,
      feedback_text: "Thank you for you submission!",
      feedback_json: factorReports
        ? { nameKey: nameKey, breedKey: breedKey, factorReport: factorReports }
        : null, //TODO instead of returning null, return message from teachers that factor report could not be provided because of nan exceeds
    })
  }

  const vars =
    gradingRequest.exercise_spec?.type === SurveyType.NonFactorial
      ? (getGlobalVariables(
          gradingRequest.submission_data.answeredQuestions as SurveyItem[],
        ) as UserVariablesMap)
      : null

  res.status(200).json({
    grading_progress: "FullyGraded",
    score_given: 1,
    score_maximum: 1,
    feedback_text: "Thank you for you submission!",
    feedback_json: null,
    set_user_variables: vars,
  })
}
