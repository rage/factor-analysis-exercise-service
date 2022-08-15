import styled from "@emotion/styled"
import React from "react"
import useCollapse from "react-collapsed"

import { SurveyItem } from "../../util/stateInterfaces"
import { ExerciseItemHeader } from "../StyledComponents/ExerciseItemHeader"
import { InfoSection } from "../StyledComponents/InfoSection"

import SurveyExerciseItem from "./SurveyExerciseItem"

interface Props {
  items: SurveyItem[]
}

const Wrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: 0.5rem;
  margin-right: 0.5;
`

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: 0.5rem;
  margin-right: 0.5;
`

const SurveySubmission: React.FC<React.PropsWithChildren<Props>> = ({ items }) => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse()

  return (
    <Wrapper className="collapsible">
      <button className="header" {...getToggleProps()}>
        {isExpanded ? "Hide" : "Show Submission"}
      </button>
      <div {...getCollapseProps()}>
        <div className="content">
          {items.map((item) => {
            if (item.conditional && item.dependsOn) {
              const chosenOptions = items.find(
                (surveyItem) => surveyItem.question.questionLabel === item.dependsOn?.questionLabel,
              )?.answer.answer as string[]
              if (chosenOptions?.indexOf(item.dependsOn.triggeringOption) === -1) {
                return
              }
            }
            if (item.question.questionLabel === "info") {
              return <InfoSection content={item.question.question} />
            }
            return (
              <ItemWrapper key={item.id}>
                <ExerciseItemHeader questionText={item.question.question} />
                <SurveyExerciseItem
                  key={item.id}
                  item={item}
                  updateAnswer={() => null}
                  disabled={true}
                />
              </ItemWrapper>
            )
          })}
        </div>
      </div>
    </Wrapper>
  )
}

export default SurveySubmission
