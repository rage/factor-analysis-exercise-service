import { css } from "@emotion/css"
import { useRouter } from "next/router"
import React, { useCallback, useState } from "react"
import ReactDOM from "react-dom"

import customViewState from "../../tests/test-data/custom-view-spec.json"
import Renderer from "../components/Renderer"
import { ExerciseTaskGradingResult } from "../shared-module/bindings"
import HeightTrackingContainer from "../shared-module/components/HeightTrackingContainer"
import {
  CurrentStateMessage,
  CustomViewIframeState,
  UserVariablesMap,
} from "../shared-module/exercise-service-protocol-types"
import { isSetStateMessage } from "../shared-module/exercise-service-protocol-types.guard"
import useExerciseServiceParentConnection from "../shared-module/hooks/useExerciseServiceParentConnection"
import { PrivateSpec } from "../util/spec-types/privateSpec"
import { PublicSpec } from "../util/spec-types/publicSpec"
import { RatedQuestion, UserAnswer } from "../util/spec-types/userAnswer"
import { validateAnsweredQuestions } from "../util/utils"

import { ExerciseFeedback } from "./api/grade"

export interface SubmissionData {
  grading: ExerciseTaskGradingResult
  user_answer: RatedQuestion[]
  public_spec: PublicSpec
}

export type State =
  | {
      view_type: "answer-exercise"
      public_spec: PublicSpec
      user_variables?: UserVariablesMap | null
    }
  | {
      view_type: "view-submission"
      public_spec: PublicSpec
      answer: UserAnswer
      feedback_json: ExerciseFeedback | null
      grading: ExerciseTaskGradingResult | null
      user_variables?: UserVariablesMap | null
    }
  | {
      view_type: "exercise-editor"
      private_spec: PrivateSpec
    }
  | CustomViewIframeState

export type Url = {
  url: string
}

const Iframe: React.FC<React.PropsWithChildren<unknown>> = () => {
  const [state, setState] = useState<State | null>(null)

  const router = useRouter()
  const rawMaxWidth = router?.query?.width
  let maxWidth: number | null = 500
  if (rawMaxWidth) {
    maxWidth = Number(rawMaxWidth)
  }

  const callback = useCallback((messageData: unknown, port: MessagePort) => {
    //const messageData = customViewState as SetStateMessage
    if (isSetStateMessage(messageData)) {
      console.log("Messagedata:", messageData)
      ReactDOM.flushSync(() => {
        if (messageData.view_type === "answer-exercise") {
          setState({
            view_type: messageData.view_type,
            public_spec: messageData.data.public_spec as PublicSpec,
            user_variables: messageData.user_variables,
          })
          const valid = validateAnsweredQuestions(messageData.data.public_spec as PublicSpec, {
            answeredQuestions: [],
          })
          port.postMessage({
            message: "current-state",
            data: {
              answeredQuestions: [],
            },
            valid: valid,
          } satisfies CurrentStateMessage)
        } else if (messageData.view_type === "exercise-editor") {
          setState({
            view_type: messageData.view_type,
            private_spec: messageData.data.private_spec as PrivateSpec,
          })
        } else if (messageData.view_type === "view-submission") {
          const userAnswer = messageData.data.user_answer as UserAnswer
          setState({
            view_type: messageData.view_type,
            public_spec: messageData.data.public_spec as PublicSpec,
            answer: userAnswer,
            feedback_json: messageData.data.grading?.feedback_json as ExerciseFeedback | null,
            grading: messageData.data.grading,
            user_variables: messageData.user_variables,
          })
        } else if (messageData.view_type === "custom-view") {
          const customView = customViewState as unknown as CustomViewIframeState
          console.log("view_type is custom-view", customView)
          setState({
            view_type: customView.view_type,
            user_information: customView.user_information,
            course_name: customView.course_name,
            user_variables: customView.user_variables,
            data: customView.data,
            module_completion_date: customView.module_completion_date ?? null,
          })
        } else {
          // eslint-disable-next-line i18next/no-literal-string
          console.error("Unknown view type received from parent")
        }
      })
    } else {
      // eslint-disable-next-line i18next/no-literal-string
      console.error("Frame received an unknown message from message port")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const port = useExerciseServiceParentConnection(callback)

  return (
    <HeightTrackingContainer port={port}>
      <div
        className={css`
          width: 100%;
          ${maxWidth && `max-width: ${maxWidth}px;`}
          margin: 0 auto;
        `}
      >
        <Renderer port={port} setState={setState} state={state} />
      </div>
    </HeightTrackingContainer>
  )
}

export default Iframe
