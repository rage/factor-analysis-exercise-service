import { css } from "@emotion/css"
import React from "react"

import { ExerciseFeedback } from "../pages/api/grade"
import { baseTheme } from "../shared-module/styles"
import { ModelSolutionApi, PublicSpec, SubmittedForm } from "../util/stateInterfaces"
import MarkdownText from "./MarkdownText"

interface SubmissionProps {
  port: MessagePort
  publicSpec: PublicSpec
  answer: SubmittedForm
  gradingFeedback: ExerciseFeedback | null
  modelSolutionSpec: ModelSolutionApi | null
}

const Submission: React.FC<SubmissionProps> = ({ publicSpec, answer }) => {
  // Border colors
   const GREEN = baseTheme.colors.green[300]

  const COLOR = baseTheme.colors.blue[300]
  const CHOSEN_COLOR = baseTheme.colors.blue[700]
  console.log("In the submission now")
  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <h1>Hello there</h1>
      {answer.answeredQuestions.map((question) => {

        return (
          <fieldset key={question.questionId}>
            <MarkdownText text={question.question} />
            
          </fieldset>
        )
      })}
    </div>
  )
}

export default Submission
