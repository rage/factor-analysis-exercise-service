/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"

import { Survey, SurveyItem, SurveyItemCondition } from "../../../util/stateInterfaces"

interface Props {
  item: SurveyItem
  onChangeSurveyItem: (item: SurveyItem) => void
  state: Survey
}

const SelectConditionForItem: React.FC<React.PropsWithChildren<Props>> = ({
  item,
  onChangeSurveyItem,
  state,
}) => {
  return (
    <>
      <legend>
        This question will be shown based on chosen answer:{" "}
        <p
          className={css`
            width: 45vw;
            text-overflow: ellipsis;
            overflow: hidden;
          `}
        >
          Question: {item.dependsOn?.questionLabel} <br />
          chosen option: {item.dependsOn?.triggeringOption}
        </p>
      </legend>
      <select
        aria-label="triggering-option-selector"
        onChange={(e) => {
          const triggeringItemArray: string[] = e.target.value.split(",")
          const triggeringItem: SurveyItemCondition = {
            questionLabel: triggeringItemArray[0],
            triggeringOption: triggeringItemArray[1],
          }
          onChangeSurveyItem({ ...item, dependsOn: triggeringItem })
        }}
        defaultValue={
          item.dependsOn?.questionLabel
            ? item.dependsOn?.questionLabel + "," + item.dependsOn?.triggeringOption
            : "default"
        }
        className={css`
          width: 50vw;
          text-overflow: ellipsis;
          overflow: hidden;
        `}
      >
        <option value="default" aria-label="Set condition" disabled selected>
          Set condition
        </option>
        {state.content.map((sItem) => {
          if (
            sItem.id === item.id ||
            sItem.question.questionLabel === "info-header" ||
            sItem.question.questionLabel === "info"
          ) {
            return
          }
          return (
            <optgroup
              key={sItem.id}
              label={"question_label: " + sItem.question.questionLabel}
              disabled={sItem.answer.options.length === 0}
            >
              {sItem.answer.options.map((option) => {
                const triggeringItem: string[] = [sItem.question.questionLabel, option]
                return (
                  <option
                    key={option}
                    value={triggeringItem as string[]}
                    label={option.length > 80 ? option.slice(0, 80) + "..." : option}
                  />
                )
              })}
            </optgroup>
          )
        })}
      </select>
    </>
  )
}

export default SelectConditionForItem
