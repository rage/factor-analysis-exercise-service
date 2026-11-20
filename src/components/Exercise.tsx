import { useContext } from "react"

import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"
import { AnswerDraftContext } from "../util/answerDraft"
import { SurveyType } from "../util/spec-types/privateSpec"
import { PublicSpec } from "../util/spec-types/publicSpec"

import FactorialSurvey from "./Factorial/AnswerExercise/FactorialSurvey"
import SurveyExercise from "./Survey/SurveyExercise"

interface Props {
  state: PublicSpec
  port: MessagePort
  userVariables?: UserVariablesMap | null
}

// Keyed by spec id: a repeated set-state keeps the form, a different spec starts a new one.
const Exercise: React.FC<React.PropsWithChildren<Props>> = ({ state, port, userVariables }) => {
  const answerDraft = useContext(AnswerDraftContext)
  switch (state.type) {
    case SurveyType.Factorial: {
      return (
        <FactorialSurvey
          key={state.id}
          state={state}
          port={port}
          userVariables={userVariables}
          answerDraft={answerDraft}
        />
      )
    }
    case SurveyType.NonFactorial: {
      return (
        <SurveyExercise
          key={state.id}
          state={state}
          port={port}
          userVariables={userVariables}
          answerDraft={answerDraft}
        />
      )
    }
  }
}

export default Exercise
