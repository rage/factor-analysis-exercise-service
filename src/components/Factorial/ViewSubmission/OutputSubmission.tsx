import React from "react"

import Accordion from "../../../shared-module/components/Accordion"
import { UserVariablesMap } from "../../../shared-module/exercise-service-protocol-types"
import { FactorialOption, Question, RatedQuestion } from "../../../util/stateInterfaces"
import { insertVariablesToText } from "../../../util/utils"
import { InfoSection } from "../../StyledComponents/InfoSection"
import { Wrapper } from "../../StyledComponents/Wrappers"
import FactorialSurveyQuestion from "../AnswerExercise/FactorialSurveyQuestion"

interface Props {
  options: FactorialOption[]
  questions: Question[]
  userAnswer: RatedQuestion[]
  userVariables?: UserVariablesMap | null
}

const FactorialSurveySubmission: React.FC<React.PropsWithChildren<Props>> = ({
  options,
  questions,
  userAnswer,
  userVariables,
}) => {
  return (
    <Accordion variant="detail">
      <details>
        <summary>{"Show submission"}</summary>
        <Wrapper>
          <div>
            {questions.map((quest) => {
              const content = insertVariablesToText(quest.question, userVariables)
              if (quest.questionLabel == "info") {
                return <InfoSection key={quest.id} content={content} />
              }
              const ratedQuestion = userAnswer.find((q) => q.questionLabel === quest.questionLabel)
              return (
                ratedQuestion && (
                  <FactorialSurveyQuestion
                    key={quest.id}
                    options={options}
                    question={quest}
                    ratedQuestion={ratedQuestion}
                    questionText={content}
                    disabled={true}
                    onClick={() => undefined}
                  />
                )
              )
            })}
          </div>
        </Wrapper>
      </details>
    </Accordion>
  )
}

export default FactorialSurveySubmission
