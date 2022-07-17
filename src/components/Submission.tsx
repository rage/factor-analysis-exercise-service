import { css } from "@emotion/css"
import React from "react"

import { ExerciseFeedback } from "../pages/api/grade"
import { baseTheme } from "../shared-module/styles"
import { ModelSolutionApi, PublicFactorialSurveySpec, RatedQuestion } from "../util/stateInterfaces"
import MarkdownText from "./MarkdownText"

interface SubmissionProps {
  port: MessagePort
  publicSpec: PublicFactorialSurveySpec
  answer: RatedQuestion[]
  gradingFeedback: ExerciseFeedback | null
  modelSolutionSpec: ModelSolutionApi | null
}

const Submission: React.FC<SubmissionProps> = ({ publicSpec, answer }) => {
  // Border colors
   const GREEN = baseTheme.colors.green[300]

  const COLOR = baseTheme.colors.blue[300]
  const CHOSEN_COLOR = baseTheme.colors.blue[700]

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
      {answer.map((question) => {

        return (
          <fieldset>
            <MarkdownText text={question.question} />
            {publicSpec.optionLabels.map((option) => {
              const selected = question.rate === option.value
              const border = `4px solid ${GREEN}`
              return (
                <button
                  role="radio"
                  className={css`
                    padding: 1rem 2rem;
                    background-color: ${selected ? CHOSEN_COLOR : COLOR};
                    border-radius: 1rem;
                    border: ${border};
                    color: ${selected ? baseTheme.colors.primary[100] : baseTheme.colors.primary[200]};
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                  `}
                  aria-checked={selected}
                  key={option.id}
                >
                  {option}
                </button>
              )
            })}
          </fieldset>
        )
      })}
    </div>
  )
}

export default Submission
