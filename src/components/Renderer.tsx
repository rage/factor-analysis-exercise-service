import React, { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"

import { ExerciseFeedback } from "../pages/api/grade"
import { State } from "../pages/iframe"
import withNoSsr from "../shared-module/utils/withNoSsr"

import Editor from "./Editor"
import Exercise from "./Exercise"
import PdfGenerator from "./PdfDownload/PdfGenerator"
import Submission from "./Submission"

interface RendererProps {
  state: State | null
  setState: Dispatch<SetStateAction<State | null>>
  port: MessagePort | null
}

const Renderer: React.FC<React.PropsWithChildren<RendererProps>> = ({ state, setState, port }) => {
  const { t } = useTranslation()

  if (!port) {
    return <>{t("waiting-for-port")}</>
  }

  if (!state) {
    return <>{t("waiting-for-content")}</>
  }

  if (state.view_type === "answer-exercise") {
    return <Exercise port={port} state={state.public_spec} userVariables={state.user_variables} />
  } else if (state.view_type === "view-submission") {
    const feedbackJson: unknown | null = state.grading?.feedback_json
    const exerciseFeedback = feedbackJson ? (feedbackJson as ExerciseFeedback) : null
    return (
      <Submission
        port={port}
        publicSpec={state.public_spec}
        answer={state.answer}
        gradingFeedback={exerciseFeedback}
        userVariables={state.user_variables}
      />
    )
  } else if (state.view_type === "exercise-editor") {
    return <Editor state={state.private_spec} port={port} setState={setState} />
  } else if (state.view_type === "custom-view") {
    return (
      <div>
        <PdfGenerator {...state} />
      </div>
    )
  } else {
    return <>{t("waiting-for-content")}</>
  }
}

export default withNoSsr(Renderer)
