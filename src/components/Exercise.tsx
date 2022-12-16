import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"
import { PublicSpec, SurveyType } from "../util/stateInterfaces"

import FactorialSurvey from "./Factorial/AnswerExercise/FactorialSurvey"
import SurveyExercise from "./Survey/SurveyExercise"

interface Props {
  state: PublicSpec
  port: MessagePort
  userVariables?: UserVariablesMap | null
}

const Exercise: React.FC<React.PropsWithChildren<Props>> = ({ state, port, userVariables }) => {
  switch (state.type) {
    case SurveyType.Factorial: {
      return (
        <>
          <FactorialSurvey state={state} port={port} />
        </>
      )
    }
    case SurveyType.NonFactorial: {
      return (
        <>
          <SurveyExercise state={state} port={port} userVariables={userVariables} />
        </>
      )
    }
  }
}

export default Exercise
