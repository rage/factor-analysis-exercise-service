import React from "react"

import { FactorialOption, RatedQuestion } from "../../../util/stateInterfaces"
import { InfoSection } from "../../StyledComponents/InfoSection"
import { Wrapper } from "../../StyledComponents/Wrappers"
import FactorialSurveyQuestion from "../AnswerExercise/FactorialSurveyQuestion"

interface Props {
  options: FactorialOption[]
  userAnswer: RatedQuestion[]
}

const FactorialSurveySubmission: React.FC<React.PropsWithChildren<Props>> = ({
  options,
  userAnswer,
}) => {
  return (
    <Wrapper>
      <div>
        {userAnswer.map((quest) => {
          if (quest.questionLabel == "info") {
            return <InfoSection key={quest.questionId} content={quest.question} />
          }
          return (
            <FactorialSurveyQuestion
              key={quest.questionId}
              options={options}
              question={quest}
              disabled={true}
              onClick={() => undefined}
            />
          )
        })}
      </div>
    </Wrapper>
  )
}

export default FactorialSurveySubmission
