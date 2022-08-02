import React from "react"
import useCollapse from "react-collapsed"

import { FactorialOption, RatedQuestion } from "../../util/stateInterfaces"

import SurveyQuestion from "./FactorialSurveyQuestion"

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
    <div className="collapsible">
      <button className="header" {...getToggleProps()}>
        {isExpanded ? "Hide" : "Show Submission"}
      </button>
      <div {...getCollapseProps()}>
        <div className="content">
          {userAnswer.map((quest) => {
            return (
              <SurveyQuestion
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
    </div>
  )
}

export default FactorialSurveySubmission
