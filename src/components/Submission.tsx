/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"

import { ExerciseFeedback } from "../pages/api/grade"
import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"
//import { baseTheme } from "../shared-module/styles"
import {
  PublicSpec,
  RatedQuestion,
  SubmittedForm,
  SurveyItem,
  SurveyType,
} from "../util/stateInterfaces"

import { FactorialReport } from "./Factorial/ViewSubmission/FactorialReport"
import FactorialSurveySubmission from "./Factorial/ViewSubmission/OutputSubmission"
import SurveySubmission from "./Survey/OutputSubmission"

interface SubmissionProps {
  port: MessagePort
  publicSpec: PublicSpec
  answer: SubmittedForm
  gradingFeedback: ExerciseFeedback | null
  userVariables?: UserVariablesMap | null
}

const Submission: React.FC<React.PropsWithChildren<SubmissionProps>> = ({
  publicSpec,
  answer,
  gradingFeedback,
  userVariables,
}) => {
  let name = "NAME NOT PROVIDED"
  let breed = "BREED NOT PROVIDED"
  if (userVariables) {
    Object.keys(userVariables).map((ob) => {
      if (ob.indexOf("name") !== -1) {
        name = userVariables[ob] as string
      }
      if (ob.indexOf("breed") !== -1) {
        breed = userVariables[ob] as string
      }
    })
  }
  return (
    <div
      className={css`
        width: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      <h2>Well done</h2>
      {gradingFeedback?.factorReport.map((f) => {
        return (
          <div
            key={f.id}
            className={css`
              width: 100%;
              display: flex;
              flex-direction: column;
              margin: 2rem auto;
            `}
          >
            <FactorialReport factor={f} name={name} breed={breed} />
          </div>
        )
      })}
      {publicSpec.type === SurveyType.Factorial && (
        <FactorialSurveySubmission
          options={publicSpec.options}
          userAnswer={answer.answeredQuestions as RatedQuestion[]}
          userVariables={userVariables}
        />
      )}
      {publicSpec.type === SurveyType.NonFactorial && (
        <SurveySubmission
          items={answer.answeredQuestions as SurveyItem[]}
          userVariables={userVariables}
        />
      )}
    </div>
  )
}

export default Submission
