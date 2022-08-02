/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"

import { ExerciseFeedback } from "../pages/api/grade"
//import { baseTheme } from "../shared-module/styles"
import { PublicSpec, SubmittedForm, SurveyType } from "../util/stateInterfaces"

import FactorialSurveySubmission from "./FactorialSurvey/OutputSubmission"

interface SubmissionProps {
  port: MessagePort
  publicSpec: PublicSpec
  answer: SubmittedForm
  gradingFeedback: ExerciseFeedback | null
}

const Submission: React.FC<React.PropsWithChildren<SubmissionProps>> = ({
  publicSpec,
  answer,
  gradingFeedback,
}) => {
  // Border colors
  /*  const GREEN = baseTheme.colors.green[300]

  const COLOR = baseTheme.colors.blue[300]
  const CHOSEN_COLOR = baseTheme.colors.blue[700] */
  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <h2>Well done</h2>
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
      {publicSpec.type === SurveyType.Factorial && (
        <FactorialSurveySubmission
          options={publicSpec.options}
          userAnswer={answer.answeredQuestions}
        />
      )}
    </div>
  )
}

export default Submission
