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

const ViewRenderer: React.FC<React.PropsWithChildren<RendererProps>> = ({
  state,
  setState,
  port,
}) => {
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

const CrashMessage: React.FC = () => {
  const { t } = useTranslation()
  return <div role="alert">{t("error-exercise-crashed")}</div>
}

interface RendererErrorBoundaryProps {
  port: MessagePort | null
  children: React.ReactNode
}

class RendererErrorBoundary extends React.Component<
  RendererErrorBoundaryProps,
  { hasCrashed: boolean }
> {
  state = { hasCrashed: false }
  private hasRequestedReload = false

  static getDerivedStateFromError() {
    return { hasCrashed: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line i18next/no-literal-string
    console.error("Exercise renderer crashed", error, errorInfo.componentStack)
    const { port } = this.props
    if (port && !this.hasRequestedReload) {
      this.hasRequestedReload = true
      // The host bounds how many times it reloads the iframe.
      // eslint-disable-next-line i18next/no-literal-string
      port.postMessage({ message: "request-iframe-reload" })
    }
  }

  render() {
    return this.state.hasCrashed ? <CrashMessage /> : this.props.children
  }
}

const Renderer: React.FC<React.PropsWithChildren<RendererProps>> = (props) => (
  <RendererErrorBoundary port={props.port}>
    <ViewRenderer {...props} />
  </RendererErrorBoundary>
)

export default withNoSsr(Renderer)
