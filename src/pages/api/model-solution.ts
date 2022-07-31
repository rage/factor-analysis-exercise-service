/* eslint-disable i18next/no-literal-string */
import { NextApiRequest, NextApiResponse } from "next"

import { cors, runMiddleware } from "../../util/cors"
import {
  ClientErrorResponse,
  ModelSolutionApi,
  PublicAlternative,
} from "../../util/stateInterfaces"

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  await runMiddleware(req, res, cors)

  if (req.method !== "POST") {
    return res.status(404).json({ message: "Not found" })
  }

  return handleRequest(req, res)
}

const handleRequest = (
  req: NextApiRequest,
  res: NextApiResponse<ModelSolutionApi | ClientErrorResponse>,
) => {
  const uncheckedAlternatives: unknown = req.body
  /* if (!Array.isArray(uncheckedAlternatives)) {
    return res
      .status(400)
      .json({ message: "Malformed data:" + JSON.stringify(uncheckedAlternatives) })
  } */

  /* const correctAlternatives: ModelSolutionApi = {
    correctOptionIds: uncheckedAlternatives
      .filter((alt) => Boolean(alt.correct))
      .map<string>((x: PublicAlternative) => x.id),
  } */

  const result: ModelSolutionApi = { correctOptionIds: [] }
  return res.status(200).json(result)
}
