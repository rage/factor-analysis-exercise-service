import handler from "../../src/pages/api/grade"
import { ExerciseTaskGradingResult } from "../../src/shared-module/bindings"
import { isExerciseTaskGradingResult } from "../../src/shared-module/bindings.guard"
import MiniSpec from "../.test-data/factorial/mini-test/private-spec.json"
import MiniUserInput from "../.test-data/factorial/mini-test/user-input.json"
import GiantSpec from "../.test-data/factorial/personality-test/test-spec.json"
import GiantUserInput from "../.test-data/factorial/personality-test/user-input.json"

import testClient from "./utils/testClient"

const client = testClient(handler)

describe("grade", () => {
  it("returns correct format", async () => {
    const data = {
      exercise_spec: MiniSpec,
    }
    const response = await client.post("/api/grade").send(data)
    expect(isExerciseTaskGradingResult(JSON.parse(response.text)))
  })

  it("grades full points for any submission", async () => {
    const data = {
      exercise_spec: MiniSpec,
      submission_data: MiniUserInput,
    }
    const response = await client.post("/api/grade").send(data)
    const result = JSON.parse(response.text)
    expect(isExerciseTaskGradingResult(result))

    const gradingResult: ExerciseTaskGradingResult = result as ExerciseTaskGradingResult
    expect(gradingResult.score_given).toBe(1)
  })

  it("contains factor report for factorial survey", async () => {
    const data = {
      exercise_spec: GiantSpec,
      submission_data: GiantUserInput,
    }
    const response = await client.post("/api/grade").send(data)
    const result = JSON.parse(response.text)
    expect(isExerciseTaskGradingResult(result))

    const gradingResult: ExerciseTaskGradingResult = result as ExerciseTaskGradingResult
    const report = gradingResult.feedback_json
    expect(report).toBeTruthy
    expect(typeof report).toBe("object")
  })
})
