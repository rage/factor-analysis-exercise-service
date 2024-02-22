/* eslint-disable i18next/no-literal-string */
import type { NextApiRequest, NextApiResponse } from "next"

import { ExerciseServiceInfoApi } from "../../shared-module/bindings"
import basePath from "../../shared-module/utils/base-path"
import { cors, runMiddleware } from "../../util/cors"
import { ClientErrorResponse } from "../../util/spec-types/publicSpec"

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ExerciseServiceInfoApi | ClientErrorResponse>,
): Promise<void> => {
  await runMiddleware(req, res, cors)
  if (req.method !== "GET") {
    return res.status(404).json({ message: "Not found" })
  }

  return handlePost(req, res)
}

const handlePost = (_req: NextApiRequest, res: NextApiResponse<ExerciseServiceInfoApi>) => {
  const prefix = basePath()
  res.json({
    service_name: "Factorial analysis survey",
    user_interface_iframe_path: `${prefix}/iframe`,
    grade_endpoint_path: `${prefix}/api/grade`,
    public_spec_endpoint_path: `${prefix}/api/public-spec`,
    model_solution_spec_endpoint_path: `${prefix}/api/model-solution`,
    has_custom_view: true,
  })
}
