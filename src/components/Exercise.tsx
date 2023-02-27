import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"
import { SurveyType } from "../util/spec-types/privateSpec"
import { PublicSpec } from "../util/spec-types/publicSpec"

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
          <FactorialSurvey state={state} port={port} userVariables={userVariables} />
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
