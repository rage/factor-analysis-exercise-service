/* eslint-disable i18next/no-literal-string */
import { NextApiRequest, NextApiResponse } from "next"

import { cors, runMiddleware } from "../../util/cors"
import { ClientErrorResponse } from "../../util/stateInterfaces"

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  await runMiddleware(req, res, cors)

  if (req.method !== "POST") {
    return res.status(404).json({ message: "Not found" })
  }

  return handleRequest(req, res)
}

const handleRequest = (_req: NextApiRequest, res: NextApiResponse<null | ClientErrorResponse>) => {
  return res.status(200).json(null)
}
