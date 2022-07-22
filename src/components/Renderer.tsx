import React, { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"

import { ExerciseFeedback } from "../pages/api/grade"
import { State } from "../pages/iframe"

import Editor from "./Editor"
import Submission from "./Submission"
import FactorialSurvey from "./FactorialSurvey/FactorialSurvey"
import { PublicFactorialSurveySpec, Survey, SurveyType } from "../util/stateInterfaces"
import SurveyExercise from "./Survey/SurveyExercise"

interface RendererProps {
  state: State | null
  setState: Dispatch<SetStateAction<State | null>>
  port: MessagePort | null
}

export const Renderer: React.FC<RendererProps> = ({ state, setState, port }) => {
  const { t } = useTranslation()

  if (!port) {
    return <>{t("waiting-for-port")}</>
  }

  if (!state) {
    return <>{t("waiting-for-content")}</>
  }
  
  if (state.view_type === "exercise" && state.public_spec.type === SurveyType.Factorial) {
    return <FactorialSurvey port={port} state={(state.public_spec as PublicFactorialSurveySpec)} />
  } else if (state.view_type === "exercise" && state.public_spec.type === SurveyType.NonFactorial) {
    return <SurveyExercise port={port} state={state.public_spec as Survey} />
  }  else if (state.view_type === "view-submission") {
    const feedbackJson: unknown | null = state.grading?.feedback_json
    const exerciseFeedback = feedbackJson ? (feedbackJson as ExerciseFeedback) : null
    return (
      <Submission
        port={port}
        publicSpec={state.public_spec}
        answer={state.answer}
        gradingFeedback={exerciseFeedback}
        modelSolutionSpec={state.model_solution_spec ? state.model_solution_spec : null}
      />
    )
  } else if (state.view_type === "exercise-editor") {
    return <Editor state={state.private_spec} port={port} setState={setState} />
  } else {
    return <>{t("waiting-for-content")}</>
  }
}
