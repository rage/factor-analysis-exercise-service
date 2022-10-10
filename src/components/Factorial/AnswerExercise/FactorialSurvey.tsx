import { useState } from "react"

import { CurrentStateMessage } from "../../../shared-module/exercise-service-protocol-types"
import {
  PublicFactorialSurveySpec,
  RatedQuestion,
  SubmittedForm,
} from "../../../util/stateInterfaces"
import { InfoSection } from "../../StyledComponents/InfoSection"

import FactorialSurveyQuestion from "./FactorialSurveyQuestion"

interface Props {
  state: PublicFactorialSurveySpec
  port: MessagePort
}

const FactorialSurvey: React.FC<React.PropsWithChildren<Props>> = ({ port, state }) => {
  const INITIAL_R = state.questions.map((q) => {
    return {
      questionId: q.id,
      questionLabel: q.questionLabel,
      rate: null,
      question: q.question,
      chosenOption: "",
    } as RatedQuestion
  })

  const [ratedQuestions, _setRatedQuestions] = useState<RatedQuestion[]>(INITIAL_R)

  const setRatedQuestions: typeof _setRatedQuestions = (value) => {
    const res = _setRatedQuestions(value)
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }
    // eslint-disable-next-line i18next/no-literal-string
    console.info("Posting current state to parent")
    // the type should be the same one that is received as the initial selected id
    const data: SubmittedForm = {
      answeredQuestions: value ? (value as RatedQuestion[]) : [],
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

  const updateRate = (questionId: string, rate: number | null, chosenOption: string) => {
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }

    const newRatedQ = ratedQuestions.map((quest) => {
      if (quest.questionId !== questionId) {
        return quest
      }
      return { ...quest, rate: rate, chosenOption: chosenOption }
    })
    setRatedQuestions(newRatedQ)
  }

  return (
    <>
      {ratedQuestions.map((question) => {
        if (question.questionLabel === "info") {
          return <InfoSection key={question.questionId} content={question.question} />
        } else {
          return (
            <FactorialSurveyQuestion
              key={question.questionId}
              question={question}
              options={state.options}
              onClick={(id, rate, chosenOption) => updateRate(id, rate, chosenOption)}
            />
          )
        }
      })}
    </>
  )
}

export default FactorialSurvey
