import React from "react"
import useCollapse from "react-collapsed"

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
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse()
  return (
    <Wrapper className="collapsible">
      <button className="header" {...getToggleProps()}>
        {isExpanded ? "Hide" : "Show Submission"}
      </button>
      <div {...getCollapseProps()}>
        <div className="content">
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
      </div>
    </Wrapper>
  )
}

export default FactorialSurveySubmission
