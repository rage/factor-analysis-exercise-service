import { useState } from "react"

import {
  CurrentStateMessage,
  UserVariablesMap,
} from "../../../shared-module/exercise-service-protocol-types"
import { PublicFactorialSurveySpec } from "../../../util/spec-types/publicSpec"
import { RatedQuestion, UserAnswer } from "../../../util/spec-types/userAnswer"
import { insertVariablesToText, validateAnsweredQuestions } from "../../../util/utils"
import { InfoSection } from "../../StyledComponents/InfoSection"

import FactorialSurveyQuestion from "./FactorialSurveyQuestion"

interface Props {
  state: PublicFactorialSurveySpec
  port: MessagePort
  userVariables?: UserVariablesMap | null
}

const FactorialSurvey: React.FC<React.PropsWithChildren<Props>> = ({
  port,
  state,
  userVariables,
}) => {
  const INITIAL_R = state.questions
    .filter((question) => question.questionLabel !== "info")
    .map((q) => {
      return {
        questionLabel: q.questionLabel,
        chosenOptionId: "",
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
    const data: UserAnswer = {
      answeredQuestions: value ? (value as RatedQuestion[]) : [],
    }
    const message: CurrentStateMessage = {
      // eslint-disable-next-line i18next/no-literal-string
      message: "current-state",
      data,
      valid: validateAnsweredQuestions(state, data),
    }
    port.postMessage(message)
    return res
  }

  const updateRate = (questionLabel: string, chosenOptionId: string) => {
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }

    const newRatedQ = ratedQuestions.map((quest) => {
      if (quest.questionLabel !== questionLabel) {
        return quest
      }
      return { ...quest, chosenOptionId: chosenOptionId }
    })
    setRatedQuestions(newRatedQ)
  }

  return (
    <>
      {state.questions.map((question) => {
        const questionText = insertVariablesToText(question.question, userVariables)
        if (question.questionLabel === "info") {
          return <InfoSection key={question.id} content={questionText} />
        } else {
          const ratedQuestion = ratedQuestions.find(
            (q) => q.questionLabel === question.questionLabel,
          )
          return (
            ratedQuestion && (
              <FactorialSurveyQuestion
                key={question.id}
                question={question}
                ratedQuestion={ratedQuestion}
                questionText={questionText}
                options={state.options}
                onClick={(questionLabel, chosenOptionId) =>
                  updateRate(questionLabel, chosenOptionId)
                }
              />
            )
          )
        }
      })}
    </>
  )
}

export default FactorialSurvey
