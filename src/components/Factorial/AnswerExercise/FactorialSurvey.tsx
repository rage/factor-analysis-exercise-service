import { useCallback, useState } from "react"

import useAnswerReporting from "../../../hooks/useAnswerReporting"
import { UserVariablesMap } from "../../../shared-module/exercise-service-protocol-types"
import { pickAnswerDraft } from "../../../util/answerDraft"
import { PublicFactorialSurveySpec } from "../../../util/spec-types/publicSpec"
import { RatedQuestion } from "../../../util/spec-types/userAnswer"
import { applyRating, restoreRatings } from "../../../util/surveyAnswers"
import { insertVariablesToText } from "../../../util/utils"
import RequiredItemWrapper from "../../SharedMisc/RequiredItemWrapper"
import { InfoSection } from "../../StyledComponents/InfoSection"

import FactorialSurveyQuestion from "./FactorialSurveyQuestion"

interface Props {
  state: PublicFactorialSurveySpec
  port: MessagePort
  userVariables?: UserVariablesMap | null
  /** `answer_draft` from the host's set-state, preferred over the sessionStorage draft. */
  answerDraft?: unknown
}

const FactorialSurvey: React.FC<React.PropsWithChildren<Props>> = ({
  port,
  state,
  userVariables,
  answerDraft,
}) => {
  const [ratedQuestions, setRatedQuestions] = useState<RatedQuestion[]>(() =>
    restoreRatings(state, pickAnswerDraft(state.id, answerDraft)),
  )
  const { unansweredIds, shouldHighlightUnanswered } = useAnswerReporting(
    port,
    state,
    ratedQuestions,
    userVariables,
  )

  const updateRate = useCallback((questionLabel: string, chosenOptionId: string) => {
    setRatedQuestions((previous) => applyRating(previous, questionLabel, chosenOptionId))
  }, [])

  return (
    <>
      {state.questions.map((question) => {
        const questionText = insertVariablesToText(question.question, userVariables)
        if (question.questionLabel === "info") {
          return <InfoSection key={question.id} content={questionText} />
        }
        const ratedQuestion = ratedQuestions.find((q) => q.questionLabel === question.questionLabel)
        return (
          ratedQuestion && (
            <RequiredItemWrapper
              key={question.id}
              isUnanswered={unansweredIds.has(question.id)}
              shouldHighlight={shouldHighlightUnanswered}
            >
              <FactorialSurveyQuestion
                question={question}
                ratedQuestion={ratedQuestion}
                questionText={questionText}
                options={state.options}
                onClick={updateRate}
              />
            </RequiredItemWrapper>
          )
        )
      })}
    </>
  )
}

export default FactorialSurvey
