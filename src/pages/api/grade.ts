/* eslint-disable i18next/no-literal-string */
import type { NextApiRequest, NextApiResponse } from "next"

import { UserVariablesMap } from "../../shared-module/exercise-service-protocol-types"
import { cors, runMiddleware } from "../../util/cors"
import {
  ClientErrorResponse,
  FactorReport,
  PrivateSpec,
  RatedQuestion,
  ReportVariable,
  SubmittedForm,
  Survey,
  SurveyItem,
  SurveyType,
} from "../../util/stateInterfaces"
import {
  calculateFactors,
  getGlobalVariables,
  mapRatesToAnswers,
  sanitizeQuestions,
  scaleAndImputRatedQuestions,
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
  userVar?: ReportVariable
  comparingVar?: ReportVariable
  zeroVar?: ReportVariable
  titleText?: string
  noReportMessage?: string
  factorReport: FactorReport[] | null
}

export interface Rate {
  questionLabel: string
  rate: number | null
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
    const scaledAnswers = scaleAndImputRatedQuestions(
      mapRatesToAnswers(
        gradingRequest.exercise_spec.options,
        sanitizeQuestions(
          gradingRequest.submission_data.answeredQuestions as RatedQuestion[],
        ) as RatedQuestion[],
      ),
      gradingRequest.exercise_spec.meansAndStandardDeviations ?? null,
      gradingRequest.exercise_spec.allowedNans ?? 0,
    )
    const factorReports: FactorReport[] | null = scaledAnswers
      ? calculateFactors(gradingRequest.exercise_spec.factors, scaledAnswers)
      : null
    const userVar = gradingRequest.exercise_spec.reportVariables?.userVariable
    const comparingVar = gradingRequest.exercise_spec.reportVariables?.comparingVariable
    const zeroVar = gradingRequest.exercise_spec.reportVariables?.zeroVariable

    return res.status(200).json({
      grading_progress: "FullyGraded",
      score_given: 1,
      score_maximum: 1,
      feedback_text: factorReports
        ? gradingRequest.exercise_spec.reportVariables?.reportSuccessMessage ?? null
        : gradingRequest.exercise_spec.reportVariables?.reportFailureMessage ?? null,
      feedback_json: {
        userVar: userVar,
        comparingVar: comparingVar,
        zeroVar: zeroVar,
        factorReport: factorReports,
        titleText: gradingRequest.exercise_spec.reportVariables?.titleText,
      },
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
    feedback_text: (gradingRequest.exercise_spec as Survey).reportSuccessMessage ?? null,
    feedback_json: null,
    set_user_variables: vars,
  })
}
