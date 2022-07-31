import { css } from "@emotion/css"
import React from "react"

import { ExerciseFeedback } from "../pages/api/grade"
import { baseTheme } from "../shared-module/styles"
import { ModelSolutionApi, PublicSpec, SubmittedForm } from "../util/stateInterfaces"

interface SubmissionProps {
  port: MessagePort
  publicSpec: PublicSpec
  answer: SubmittedForm
  gradingFeedback: ExerciseFeedback | null
  modelSolutionSpec: ModelSolutionApi | null
}

const Submission: React.FC<React.PropsWithChildren<SubmissionProps>> = ({
  publicSpec,
  answer,
  gradingFeedback,
}) => {
  // Border colors
  const GREEN = baseTheme.colors.green[300]

  const COLOR = baseTheme.colors.blue[300]
  const CHOSEN_COLOR = baseTheme.colors.blue[700]
  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <h1>Hello there</h1>
      {gradingFeedback?.factorReport.map((f) => {
        return (
          <>
            <fieldset key={f.id}>
              <p>{f.name}</p>
              <p>{f.score}</p>
            </fieldset>
          </>
        )
      })}
    </div>
  )
}

export default Submission
