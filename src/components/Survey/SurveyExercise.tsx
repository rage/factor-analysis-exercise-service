import { useState } from "react"

import { CurrentStateMessage } from "../../shared-module/exercise-service-protocol-types"
import { Answer, Survey, SurveyItem } from "../../util/stateInterfaces"
import MarkdownText from "../MarkdownText"

import SurveyExerciseQuestion from "./SurveyExerciseQuestion"

interface Props {
  state: Survey
  port: MessagePort
}

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

  const [answeredQuestions, _setAnsweredQuestions] = useState<SurveyItem[]>(INITIAL_ANSWERED)

  const setAnsweredQuestions: typeof _setAnsweredQuestions = (value) => {
    const res = _setAnsweredQuestions(value)
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }
    // eslint-disable-next-line i18next/no-literal-string
    console.info("Posting current state to parent")
    // the type should be the same one that is received as the initial selected id
    const data: SurveyItem[] = value ? (value as SurveyItem[]) : []

    const message: CurrentStateMessage = {
      // eslint-disable-next-line i18next/no-literal-string
      message: "current-state",
      data,
      valid: true,
    }
    port.postMessage(message)
    return res
  }

  const updateAnswer = (questionId: string, answer: Answer) => {
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }

    const newAnsweredQ = answeredQuestions.map((quest) => {
      if (quest.id !== questionId) {
        return quest
      }
      return { ...quest, answer: answer }
    })
    setAnsweredQuestions(newAnsweredQ)
  }

  return (
    <div>
      {answeredQuestions.map((item) => {
        if (item.conditional && item.dependsOn) {
          const chosenOptions = answeredQuestions.find(
            (surveyItem) => surveyItem.id === item.dependsOn?.id,
          )?.answer.answer as string[]
          if (chosenOptions.indexOf(item.dependsOn.triggeringOption) === -1) {
            return
          }
        }
        return (
          <>
            <fieldset key={item.id}>
              <legend>
                <MarkdownText text={item.question.question} />
              </legend>
              <SurveyExerciseQuestion question={item} updateAnswer={updateAnswer} />
            </fieldset>
          </>
        )
      })}
    </div>
  )
}

export default SurveyExercise
