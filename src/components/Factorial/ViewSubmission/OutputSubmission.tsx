import React from "react"

import Accordion from "../../../shared-module/components/Accordion"
import { UserVariablesMap } from "../../../shared-module/exercise-service-protocol-types"
import { FactorialOption, RatedQuestion } from "../../../util/stateInterfaces"
import { insertVariablesToText } from "../../../util/utils"
import { InfoSection } from "../../StyledComponents/InfoSection"
import { Wrapper } from "../../StyledComponents/Wrappers"
import FactorialSurveyQuestion from "../AnswerExercise/FactorialSurveyQuestion"

interface Props {
  options: FactorialOption[]
  userAnswer: RatedQuestion[]
  userVariables?: UserVariablesMap | null
}

const FactorialSurveySubmission: React.FC<React.PropsWithChildren<Props>> = ({
  options,
  userAnswer,
  userVariables,
}) => {
  return (
    <Accordion variant="detail">
      <details>
        <summary>{"Show submission"}</summary>
        <Wrapper>
          <div>
            {userAnswer.map((quest) => {
              const content = insertVariablesToText(quest.question, userVariables)
              if (quest.questionLabel == "info") {
                return <InfoSection key={quest.questionId} content={content} />
              }
              return (
                <FactorialSurveyQuestion
                  key={quest.questionId}
                  options={options}
                  question={quest}
                  questionText={content}
                  disabled={true}
                  onClick={() => undefined}
                />
              )
            })}
          </div>
        </Wrapper>
      </details>
    </Accordion>
  )
}

export default FactorialSurveySubmission
