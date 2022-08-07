import styled from "@emotion/styled"
import React from "react"
import useCollapse from "react-collapsed"

import { SurveyItem } from "../../util/stateInterfaces"
import { ExerciseItemHeader } from "../ExerciseItemHeader"

import SurveyExerciseItem from "./SurveyExerciseItem"

interface Props {
  items: SurveyItem[]
}

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: 1rem;
`

const SurveySubmission: React.FC<React.PropsWithChildren<Props>> = ({ items }) => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse()

  return (
    <div className="collapsible">
      <button className="header" {...getToggleProps()}>
        {isExpanded ? "Hide" : "Show Submission"}
      </button>
      <div {...getCollapseProps()}>
        <div className="content">
          {items.map((item) => {
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
    </div>
  )
}

export default SurveySubmission
