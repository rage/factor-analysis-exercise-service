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
        const name: string | null =
          userVariables && gradingFeedback.nameKey && userVariables[gradingFeedback.nameKey]
            ? (userVariables[gradingFeedback.nameKey] as string)
            : null
        const breed: string | null =
          userVariables && gradingFeedback.breedKey && userVariables[gradingFeedback.breedKey]
            ? (userVariables[gradingFeedback.breedKey] as string)
            : null
        return (
          <div
            key={f.id}
            className={css`
              width: 100%;
              display: flex;
              flex-direction: column;
              margin: 4rem auto;
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
