/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"

import { ExerciseFeedback } from "../pages/api/grade"
import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"
import { SurveyType } from "../util/spec-types/privateSpec"
import { PublicSpec } from "../util/spec-types/publicSpec"
import { AnsweredSurveyItem, RatedQuestion, UserAnswer } from "../util/spec-types/userAnswer"
import { calculateSumFactorScore } from "../util/utils"

import { FactorialReport } from "./Factorial/ViewSubmission/FactorialReport"
import FactorialSurveySubmission from "./Factorial/ViewSubmission/OutputSubmission"
import SurveySubmission from "./Survey/ViewSubmission/OutputSubmission"
import { SumFactorReport } from "./Survey/ViewSubmission/SumFactorReport"

interface SubmissionProps {
  port: MessagePort
  publicSpec: PublicSpec
  answer: UserAnswer
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
      id="sum-factor-editor"
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
                margin: 2rem auto;
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
          questions={publicSpec.questions}
          userAnswer={answer.answeredQuestions as RatedQuestion[]}
          userVariables={userVariables}
        />
      )}
      {publicSpec.type === SurveyType.NonFactorial && (
        <>
          {publicSpec.sumFactor &&
            calculateSumFactorScore(
              publicSpec.content,
              answer.answeredQuestions as AnsweredSurveyItem[],
            ) !== null && (
              <SumFactorReport
                factor={publicSpec.sumFactor}
                userName={
                  (userVariables != null && publicSpec.sumFactor.userVariable?.globalKey) ??
                  userVariables
                    ? (userVariables[publicSpec.sumFactor?.userVariable?.globalKey ?? ""] as string)
                    : null
                }
                userScore={
                  calculateSumFactorScore(
                    publicSpec.content,
                    answer.answeredQuestions as AnsweredSurveyItem[],
                  ) ?? 0
                }
                userVar={publicSpec.sumFactor.userVariable ?? null}
                parentWidthPx={document.getElementById("sum-factor-editor")?.clientWidth ?? 0}
              />
            )}
          <SurveySubmission
            items={publicSpec.content}
            answers={answer.answeredQuestions as AnsweredSurveyItem[]}
            userVariables={userVariables}
          />
        </>
      )}
    </div>
  )
}

export default Submission
