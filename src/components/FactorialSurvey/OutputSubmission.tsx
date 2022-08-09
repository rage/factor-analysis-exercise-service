import styled from "@emotion/styled"
import React from "react"
import useCollapse from "react-collapsed"

import { FactorialOption, RatedQuestion } from "../../util/stateInterfaces"
import { InfoSection } from "../StyledComponents/InfoSection"

import SurveyQuestion from "./FactorialSurveyQuestion"

interface Props {
  options: FactorialOption[]
  userAnswer: RatedQuestion[]
}

const Wrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: 0.5rem;
  margin-right: 0.5;
`

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
              return <InfoSection content={quest.question} />
            }
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
    </Wrapper>
  )
}

export default FactorialSurveySubmission
