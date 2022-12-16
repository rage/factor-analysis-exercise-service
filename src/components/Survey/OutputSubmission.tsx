import React from "react"

import { SurveyItem } from "../../util/stateInterfaces"
import MarkdownText from "../MarkdownText"
import { ExerciseItemHeader } from "../StyledComponents/ExerciseItemHeader"
import { InfoSection } from "../StyledComponents/InfoSection"
import { InfoHeaderWrapper, ItemWrapper, Wrapper } from "../StyledComponents/Wrappers"

import SurveyExerciseItem from "./SurveyExerciseItem"

interface Props {
  items: SurveyItem[]
}

const SurveySubmission: React.FC<React.PropsWithChildren<Props>> = ({ items }) => {
  return (
    <Wrapper>
      <div>
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
            return <InfoSection key={item.id} content={item.question.question} />
          }
          if (item.question.questionLabel === "info-header") {
            return (
              <InfoHeaderWrapper key={item.id}>
                <MarkdownText text={item.question.question} />
                <SurveyExerciseItem item={item} updateAnswer={() => null} disabled />
              </InfoHeaderWrapper>
            )
          }
          return (
            <ItemWrapper key={item.id}>
              <ExerciseItemHeader titleText={item.question.question} />
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
    </Wrapper>
  )
}

export default SurveySubmission
