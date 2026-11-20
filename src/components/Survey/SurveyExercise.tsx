import { css } from "@emotion/css"
import { useCallback, useState } from "react"

import useAnswerReporting from "../../hooks/useAnswerReporting"
import { UserVariablesMap } from "../../shared-module/exercise-service-protocol-types"
import { baseTheme } from "../../shared-module/styles"
import { pickAnswerDraft } from "../../util/answerDraft"
import { Survey } from "../../util/spec-types/privateSpec"
import { AnsweredSurveyItem } from "../../util/spec-types/userAnswer"
import { applySurveyAnswer, restoreSurveyAnswers } from "../../util/surveyAnswers"
import { insertVariablesToText, isSurveyItemShown } from "../../util/utils"
import MarkdownText from "../MarkdownText"
import RequiredItemWrapper from "../SharedMisc/RequiredItemWrapper"
import { ExerciseItemHeader } from "../StyledComponents/ExerciseItemHeader"
import { InfoSection } from "../StyledComponents/InfoSection"
import { InfoHeaderWrapper, ItemWrapper } from "../StyledComponents/Wrappers"

import SurveyExerciseItem from "./SurveyExerciseItem"

interface Props {
  state: Survey
  port: MessagePort
  userVariables?: UserVariablesMap | null
  /** `answer_draft` from the host's set-state, preferred over the sessionStorage draft. */
  answerDraft?: unknown
}

const SurveyExercise: React.FC<React.PropsWithChildren<Props>> = ({
  port,
  state,
  userVariables,
  answerDraft,
}) => {
  const [answeredItems, setAnsweredItems] = useState<AnsweredSurveyItem[]>(() =>
    restoreSurveyAnswers(state, pickAnswerDraft(state.id, answerDraft)),
  )
  const { unansweredIds, shouldHighlightUnanswered } = useAnswerReporting(
    port,
    state,
    answeredItems,
    userVariables,
  )

  const updateAnswer = useCallback(
    (itemId: string, answer: AnsweredSurveyItem["answer"]) => {
      setAnsweredItems((previous) => applySurveyAnswer(state, previous, itemId, answer))
    },
    [state],
  )

  return (
    <>
      {state.content.map((item) => {
        if (!isSurveyItemShown(item, answeredItems)) {
          return null
        }
        const content: string = insertVariablesToText(item.question.question, userVariables)
        if (item.question.questionLabel === "info") {
          return <InfoSection key={item.id} content={content} />
        }
        const itemInput = (
          <SurveyExerciseItem
            item={item}
            answer={answeredItems.find((i) => i.surveyItemId === item.id)?.answer ?? null}
            updateAnswer={updateAnswer}
          />
        )
        const itemContent =
          item.question.questionLabel === "info-header" ? (
            <InfoHeaderWrapper>
              <div
                className={css`
                  color: ${baseTheme.colors.crimson[700]};
                `}
              >
                <MarkdownText text={content} />
              </div>
              {itemInput}
            </InfoHeaderWrapper>
          ) : (
            <ItemWrapper>
              <ExerciseItemHeader titleText={content} />
              {itemInput}
            </ItemWrapper>
          )
        return (
          <RequiredItemWrapper
            key={item.id}
            isUnanswered={unansweredIds.has(item.id)}
            shouldHighlight={shouldHighlightUnanswered}
          >
            {itemContent}
          </RequiredItemWrapper>
        )
      })}
    </>
  )
}

export default SurveyExercise
