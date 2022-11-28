import { Url } from "../pages/iframe"
import { UserVariablesMap } from "../shared-module/exercise-service-protocol-types"
import { PublicSpec, SurveyType } from "../util/stateInterfaces"

import FactorialSurvey from "./Factorial/AnswerExercise/FactorialSurvey"
import SurveyExercise from "./Survey/SurveyExercise"

interface Props {
  state: PublicSpec
  port: MessagePort
  userVariables?: UserVariablesMap | null
  url: Url | null
}

const Exercise: React.FC<React.PropsWithChildren<Props>> = ({
  state,
  port,
  userVariables,
  url,
}) => {
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
          <SurveyExercise state={state} port={port} userVariables={userVariables} url={url} />
        </>
      )
    }
  }
}

export default Exercise
