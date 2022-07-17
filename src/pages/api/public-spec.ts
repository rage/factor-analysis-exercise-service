/* eslint-disable i18next/no-literal-string */
import { NextApiRequest, NextApiResponse } from "next"
import { cors, runMiddleware } from "../../util/cors"

import { ClientErrorResponse, FactorialSurvey, PublicFactorialSurveySpec } from "../../util/stateInterfaces"

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  await runMiddleware(req, res, cors)

  if (req.method !== "POST") {
    return res.status(404).json({ message: "Not found" })
  }

  return handlePost(req, res)
}

function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<PublicFactorialSurveySpec | ClientErrorResponse>,
) {

  const form: FactorialSurvey = req.body

  // Add a reasonable error checking here!
  if (!form) {
    return res
      .status(400)
      .json({ message: "Malformed data:" + JSON.stringify(form) })
  }

  const publicForm: PublicFactorialSurveySpec = {
    id: form.id,
    optionLabels: form.optionLabels,
    questions: form.questions
  }

  return res.status(200).json(publicForm)
}
