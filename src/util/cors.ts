import Cors from "cors"
import { NextApiRequest, NextApiResponse } from "next"

// Initializing the cors middleware
export const cors = Cors({
  methods: ["GET", "HEAD"],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}
