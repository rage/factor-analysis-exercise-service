import { css } from "@emotion/css"
import React from "react"
import Select from "react-select"

import { primaryFont } from "../../../shared-module/styles"
import { Survey, SurveyItem, SurveyItemCondition } from "../../../util/spec-types/privateSpec"

interface SelectorProps {
  item: SurveyItem
  onChange: (item: SurveyItem) => void
  state: Survey
}

export const SelectCondition: React.FC<React.PropsWithChildren<SelectorProps>> = ({
  item,
  onChange,
  state,
}) => {
  const possibleItems: SurveyItemCondition[] = []
  state.content.map((sItem) => {
    if (
      sItem.id === item.id ||
      sItem.question.questionLabel === "info-header" ||
      sItem.question.questionLabel === "info"
    ) {
      return
    }
    sItem.answer.options.map((option) => {
      const condition: SurveyItemCondition = {
        questionLabel: sItem.question.questionLabel,
        triggeringOption: option,
      }
      possibleItems.push(condition)
    })
    sItem.answer.factorialOptions?.map((option) => {
      const condition: SurveyItemCondition = {
        questionLabel: sItem.question.questionLabel,
        triggeringOption: option.name,
      }
      possibleItems.push(condition)
    })
  })

  const conditions = possibleItems.map((i) => {
    const condition = {
      value: i.questionLabel + "; " + i.triggeringOption,
      label: i.questionLabel + "; " + i.triggeringOption,
      condition: i,
    }
    return condition
  })
  return (
    <div
      className={css`
        margin-bottom: 1.1rem;
      `}
    >
      {"This question will be shown if choosing either of the answers: "}
      {item.dependsOn && (
        <ul>
          {[item.dependsOn].flat().map((con, idx) => {
            return <li key={idx}>{con.questionLabel + ": " + con.triggeringOption}</li>
          })}
        </ul>
      )}
      <label
        htmlFor={`condition-selector-for-${item.question.questionLabel}`}
        className={css`
          color: #333;
          font-family: ${primaryFont};
          font-weight: 500;
          display: block;
          margin-bottom: 2px;
        `}
      >
        {"Select condition"}
        <Select
          id={`condition-selector-for-${item.question.questionLabel}`}
          aria-label="triggering-option-selector"
          isMulti
          options={conditions}
          closeMenuOnSelect={false}
          onChange={(e) => {
            const conditions = e.map((con) => {
              return con.condition
            })
            onChange({ ...item, dependsOn: conditions })
          }}
          formatOptionLabel={(logo) => {
            return <>{logo.label}</>
          }}
        />
      </label>
    </div>
  )
}
