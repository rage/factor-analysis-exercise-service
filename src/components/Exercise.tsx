import { PublicSpec, SurveyType } from "../util/stateInterfaces"

import FactorialSurvey from "./Factorial/AnswerExercise/FactorialSurvey"
import SurveyExercise from "./Survey/SurveyExercise"

interface Props {
  state: PublicSpec
  port: MessagePort
}

const Exercise: React.FC<React.PropsWithChildren<Props>> = ({ state, port }) => {
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
          <SurveyExercise state={state} port={port} />
        </>
      )
    }
  }
}

export default Exercise
