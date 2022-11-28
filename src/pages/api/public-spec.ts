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
  const specRequest = req.body as SpecRequest
  const form: PrivateSpec = specRequest.private_spec as PrivateSpec

  // Add a reasonable error checking here!
  if (!form) {
    return res.status(400).json({ message: "Malformed data:" + JSON.stringify(form) })
  }

  const publicForm =
    form.type === SurveyType.Factorial
      ? ({
          id: form.id,
          type: form.type,
          options: (form as FactorialSurvey).options,
          questions: (form as FactorialSurvey).questions,
        } as PublicFactorialSurveySpec)
      : (form as Survey)

  return res.status(200).json(publicForm)
}
