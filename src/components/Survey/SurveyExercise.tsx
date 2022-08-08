import styled from "@emotion/styled"
import { useState } from "react"

import { CurrentStateMessage } from "../../shared-module/exercise-service-protocol-types"
import { Answer, SubmittedForm, Survey, SurveyItem } from "../../util/stateInterfaces"
import { ExerciseItemHeader } from "../ExerciseItemHeader"

import SurveyExerciseItem from "./SurveyExerciseItem"

interface Props {
  state: Survey
  port: MessagePort
}

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: 0.5rem;
  margin-right: 0.5;
`

const SurveyExercise: React.FC<React.PropsWithChildren<Props>> = ({ port, state }) => {
  const INITIAL_ANSWERED = state.content.map((q) => {
    return {
      id: q.id,
      question: q.question,
      answer: q.answer,
      conditional: q.conditional,
      dependsOn: q.dependsOn,
    } as SurveyItem
  })

  const [answeredItems, _setAnsweredItems] = useState<SurveyItem[]>(INITIAL_ANSWERED)

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
    const data: SubmittedForm = {
      answeredQuestions: value ? (value as SurveyItem[]) : [],
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

  const updateAnswer = (itemId: string, answer: Answer) => {
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }

    const newAnsweredQ = answeredItems.map((quest) => {
      if (quest.id !== itemId) {
        return quest
      }
      return { ...quest, answer: answer }
    })
    setAnsweredItems(newAnsweredQ)
  }

  return (
    <>
      {answeredItems.map((item) => {
        if (item.conditional && item.dependsOn) {
          const chosenOptions = answeredItems.find(
            (surveyItem) => surveyItem.question.questionLabel === item.dependsOn?.questionLabel,
          )?.answer.answer as string[]
          if (chosenOptions?.indexOf(item.dependsOn.triggeringOption) === -1) {
            return
          }
        }
        return (
          <ItemWrapper key={item.id}>
            <ExerciseItemHeader questionText={item.question.question} />
            <SurveyExerciseItem item={item} updateAnswer={updateAnswer} />
          </ItemWrapper>
        )
      })}
    </>
  )
}

export default SurveyExercise
