import React from "react"
import useCollapse from "react-collapsed"

import { SurveyItem } from "../../util/stateInterfaces"
import MarkdownText from "../MarkdownText"

import SurveyExerciseItem from "./SurveyExerciseItem"

interface Props {
  items: SurveyItem[]
}

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
              <fieldset key={item.id}>
                <legend>
                  <MarkdownText text={item.question.question} />
                </legend>
                <SurveyExerciseItem
                  key={item.id}
                  item={item}
                  updateAnswer={() => null}
                  disabled={true}
                />
              </fieldset>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SurveySubmission
