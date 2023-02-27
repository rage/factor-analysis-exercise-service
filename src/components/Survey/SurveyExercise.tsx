import { css } from "@emotion/css"
import { useState } from "react"

import {
  CurrentStateMessage,
  UserVariablesMap,
} from "../../shared-module/exercise-service-protocol-types"
import { baseTheme } from "../../shared-module/styles"
import { Survey } from "../../util/spec-types/privateSpec"
import { AnsweredSurveyItem, UserAnswer } from "../../util/spec-types/userAnswer"
import { checkCondition, insertVariablesToText } from "../../util/utils"
import MarkdownText from "../MarkdownText"
import { ExerciseItemHeader } from "../StyledComponents/ExerciseItemHeader"
import { InfoSection } from "../StyledComponents/InfoSection"
import { InfoHeaderWrapper, ItemWrapper } from "../StyledComponents/Wrappers"

import SurveyExerciseItem from "./SurveyExerciseItem"

interface Props {
  state: Survey
  port: MessagePort
  userVariables?: UserVariablesMap | null
}

const SurveyExercise: React.FC<React.PropsWithChildren<Props>> = ({
  port,
  state,
  userVariables,
}) => {
  const INITIAL_ANSWERED = state.content
    .filter((item) => item.question.questionLabel !== "info")
    .map((item) => {
      return {
        surveyItemId: item.id,
        questionLabel: item.question.questionLabel,
        answer: null,
      } as AnsweredSurveyItem
    })

  const [answeredItems, _setAnsweredItems] = useState<AnsweredSurveyItem[]>(INITIAL_ANSWERED)

  const setAnsweredItems: typeof _setAnsweredItems = (value) => {
    const res = _setAnsweredItems(value)
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }
    // eslint-disable-next-line i18next/no-literal-string
    console.info("Posting current state to parent")
    // the type should be the same one that is received as the initial selected id
    const data: UserAnswer = {
      answeredQuestions: value ? (value as AnsweredSurveyItem[]) : [],
    }

    const message: CurrentStateMessage = {
      // eslint-disable-next-line i18next/no-literal-string
      message: "current-state",
      data,
      valid: true,
    }
    port.postMessage(message)
    return res
  }

  const updateAnswer = (itemId: string, answer: string[] | string | number | null) => {
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }

    const newAnsweredQ: AnsweredSurveyItem[] = answeredItems.map((item) => {
      if (item.surveyItemId !== itemId) {
        return item
      }
      return { ...item, answer: answer }
    })
    setAnsweredItems(newAnsweredQ)
  }

  return (
    <>
      {state.content.map((item) => {
        if (item.conditional && item.dependsOn) {
          if (!checkCondition(answeredItems, item.dependsOn)) {
            if (
              answeredItems.find((i) => i.surveyItemId === item.id) &&
              answeredItems.find((i) => i.surveyItemId === item.id)?.answer !== null
            ) {
              updateAnswer(item.id, null)
            }
            return
          }
        }
        const content: string = insertVariablesToText(item.question.question, userVariables)
        if (item.question.questionLabel === "info") {
          return <InfoSection key={item.id} content={content} />
        }
        if (item.question.questionLabel === "info-header") {
          return (
            <InfoHeaderWrapper key={item.id}>
              <div
                className={css`
                  color: ${baseTheme.colors.crimson[700]};
                `}
              >
                <MarkdownText text={content} />
              </div>
              <SurveyExerciseItem
                item={item}
                answer={answeredItems.find((i) => i.surveyItemId === item.id)?.answer ?? null}
                updateAnswer={updateAnswer}
              />
            </InfoHeaderWrapper>
          )
        }
        return (
          <ItemWrapper key={item.id}>
            <ExerciseItemHeader titleText={content} />
            <SurveyExerciseItem
              item={item}
              answer={answeredItems.find((i) => i.surveyItemId === item.id)?.answer ?? null}
              updateAnswer={updateAnswer}
            />
          </ItemWrapper>
        )
      })}
    </>
  )
}

export default SurveyExercise
