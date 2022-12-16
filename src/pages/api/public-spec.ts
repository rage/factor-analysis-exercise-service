/* eslint-disable i18next/no-literal-string */
import { NextApiRequest, NextApiResponse } from "next"

import { SpecRequest } from "../../shared-module/bindings"
import { cors, runMiddleware } from "../../util/cors"
import {
  ClientErrorResponse,
  FactorialSurvey,
  PrivateSpec,
  PublicFactorialSurveySpec,
  Survey,
  SurveyType,
} from "../../util/stateInterfaces"

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  await runMiddleware(req, res, cors)

  if (req.method !== "POST") {
    return res.status(404).json({ message: "Not found" })
  }

  return handlePost(req, res)
}

function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<PublicFactorialSurveySpec | Survey | ClientErrorResponse>,
) {
  // const form: PrivateSpec = req.body
  const specRequest = req.body as SpecRequest
  const unfilledForm: PrivateSpec = specRequest.private_spec as PrivateSpec

  // Add a reasonable error checking here!
  if (!unfilledForm) {
    return res.status(400).json({ message: "Malformed data:" + JSON.stringify(unfilledForm) })
  }

  const publicForm =
    unfilledForm.type === SurveyType.Factorial
      ? ({
          id: unfilledForm.id,
          type: unfilledForm.type,
          options: (unfilledForm as FactorialSurvey).options,
          questions: (unfilledForm as FactorialSurvey).questions,
        } as PublicFactorialSurveySpec)
      : (unfilledForm as Survey)

  return res.status(200).json(publicForm)
}
