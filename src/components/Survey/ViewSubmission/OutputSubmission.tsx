import React from "react"

import Accordion from "../../../shared-module/components/Accordion"
import { UserVariablesMap } from "../../../shared-module/exercise-service-protocol-types"
import { SurveyItem } from "../../../util/spec-types/privateSpec"
import { AnsweredSurveyItem } from "../../../util/spec-types/userAnswer"
import { checkCondition, insertVariablesToText } from "../../../util/utils"
import MarkdownText from "../../MarkdownText"
import { ExerciseItemHeader } from "../../StyledComponents/ExerciseItemHeader"
import { InfoSection } from "../../StyledComponents/InfoSection"
import { InfoHeaderWrapper, ItemWrapper, Wrapper } from "../../StyledComponents/Wrappers"
import SurveyExerciseItem from "../SurveyExerciseItem"

interface Props {
  items: SurveyItem[]
  answers: AnsweredSurveyItem[]
  userVariables?: UserVariablesMap | null
}

const SurveySubmission: React.FC<React.PropsWithChildren<Props>> = ({
  items,
  answers,
  userVariables,
}) => {
  return (
    <Accordion variant="detail">
      <details>
        <summary>{"Show submission"}</summary>
        <Wrapper>
          <div>
            {items.map((item) => {
              if (item.conditional && item.dependsOn) {
                if (!checkCondition(answers, item.dependsOn)) {
                  return
                }
              }
              const content = insertVariablesToText(item.question.question, userVariables)
              if (item.question.questionLabel === "info") {
                return <InfoSection key={item.id} content={content} />
              }
              if (item.question.questionLabel === "info-header") {
                return (
                  <InfoHeaderWrapper key={item.id}>
                    <MarkdownText text={content} />
                    <SurveyExerciseItem
                      item={item}
                      answer={answers.find((i) => i.surveyItemId === item.id)?.answer ?? null}
                      updateAnswer={() => null}
                      disabled
                    />
                  </InfoHeaderWrapper>
                )
              }
              return (
                <ItemWrapper key={item.id}>
                  <ExerciseItemHeader titleText={content} />
                  <SurveyExerciseItem
                    key={item.id}
                    item={item}
                    answer={answers.find((i) => i.surveyItemId === item.id)?.answer ?? null}
                    updateAnswer={() => null}
                    disabled={true}
                  />
                </ItemWrapper>
              )
            })}
          </div>
        </Wrapper>
      </details>
    </Accordion>
  )
}

export default SurveySubmission
