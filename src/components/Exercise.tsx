import { PublicSpec, SurveyType } from "../util/stateInterfaces"
import FactorialSurvey from "./FactorialSurvey/FactorialSurvey"
import SurveyExercise from "./Survey/SurveyExercise"

interface Props {
  state: PublicSpec
  port: MessagePort
}

const Exercise: React.FC<Props> = ({ state, port }) => {
  switch (state.type) {
    case SurveyType.Factorial: {
      return (
        <div>
          <FactorialSurvey state={state} port={port}/>
        </div>
      )
    }
    case SurveyType.NonFactorial: {
      return (
        <div>
          <SurveyExercise state={state} port={port}/>
        </div>
      )
    }
  }
}

export default Exercise