/* eslint-disable i18next/no-literal-string */
import type { NextApiRequest, NextApiResponse } from "next"
import { cors, runMiddleware } from "../../util/cors"

import { ClientErrorResponse, Factor, PrivateSpec, SubmittedForm } from "../../util/stateInterfaces"

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
}

export interface ExerciseFeedback {
  factorReport: Factor[] 
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

  res.status(200).json({
    grading_progress: "FullyGraded",
    score_given: 1,
    score_maximum: 1,
    feedback_text: "Good job!",
    feedback_json: null   // put the calculated factor scores here for now
  })
}
