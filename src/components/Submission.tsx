/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"

import { ExerciseFeedback } from "../pages/api/grade"
import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"
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
      {gradingFeedback?.titleText && <h2>{gradingFeedback?.titleText}</h2>}
      {gradingFeedback?.factorReport &&
        gradingFeedback?.factorReport.map((f) => {
          const userName: string | null =
            userVariables &&
            gradingFeedback.userVar?.globalKey &&
            userVariables[gradingFeedback.userVar.globalKey]
              ? (userVariables[gradingFeedback.userVar.globalKey] as string)
              : null
          const userCompVar: string | null =
            userVariables &&
            gradingFeedback.comparingVar?.globalKey &&
            userVariables[gradingFeedback.comparingVar?.globalKey]
              ? (userVariables[gradingFeedback.comparingVar?.globalKey] as string)
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
              <FactorialReport
                factor={f}
                userName={userName}
                userCompVar={userCompVar}
                comparingVar={gradingFeedback.comparingVar ?? null}
                userVar={gradingFeedback.userVar ?? null}
                zeroVar={gradingFeedback.zeroVar ?? null}
              />
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
