import { useState } from "react"
import { CurrentStateMessage } from "../../shared-module/iframe-protocol-types"
import { PublicFactorialSurveySpec, RatedQuestion, SubmittedForm } from "../../util/stateInterfaces"
import SurveyQuestion from "./SurveyQuestion"

interface Props {
  state: PublicFactorialSurveySpec
  port: MessagePort
}



const Survey: React.FC<Props> = ({ port, state }) => {
  const INITIAL_R = state.questions.map((q) => {
    return {questionId: q.id, questionNr: q.questionNr, rate: null, question: q.question}
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
      answeredQuestions: value ? value as RatedQuestion[] : []
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

  
  const updateRate = (questionId: string, rate: number | null) => {
    if (!port) {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Cannot send current state to parent because I don't have a port")
      return
    }

    const newRatedQ = ratedQuestions.map((quest) => {
      if (quest.questionId !== questionId) {
        return quest
      }
      return {...quest, rate: rate}
    })
    setRatedQuestions(newRatedQ)
  }

  return (
    <div>
      {ratedQuestions.map((question) => {
        return (
          <SurveyQuestion
            question={question}
            options={state.optionLabels}
            onClick={(id ,rate) => updateRate(id, rate)}
          />
        )
      })}
    </div>
  )
}

export default Survey