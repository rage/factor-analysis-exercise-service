/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import { useEffect } from "react"
import { v4 } from "uuid"

import { State } from "../pages/iframe"
import { CurrentStateMessage } from "../shared-module/exercise-service-protocol-types"
import { PrivateSpec, SurveyType } from "../util/stateInterfaces"

import FactorialSurveyEditor from "./FactorialSurvey/Editors/FactorialSurveyEditor"
import SurveyItemEditor from "./Survey/Editors/SurveyEditor"

const CURRENT_STATE = "current-state"
interface Props {
  state: PrivateSpec
  setState: (newState: State) => void
  port: MessagePort
}

const Editor: React.FC<React.PropsWithChildren<Props>> = ({ state, setState, port }) => {
  useEffect(() => {
    if (!port) {
      return
    }
    const message: CurrentStateMessage = {
      data: { private_spec: state },
      message: CURRENT_STATE,
      valid: true,
    }
    port.postMessage(message)
  }, [state, port])

  if (!state) {
    return (
      <div
        className={css`
          display: flex;
          flex-direction: column;
        `}
      >
        <legend>Choose type of Survey</legend>
        <select
          aria-label="select-survey-type"
          name="type-selection"
          id="survey-type"
          value={undefined}
          onChange={(event) => {
            const surveyType = event.target.value
            switch (surveyType) {
              case SurveyType.Factorial: {
                setState({
                  view_type: "exercise-editor",
                  private_spec: {
                    type: SurveyType.Factorial,
                    id: v4(),
                    factors: [],
                    options: [],
                    questions: [],
                    calculateFeedback: false,
                  },
                })
                break
              }
              case SurveyType.NonFactorial: {
                setState({
                  view_type: "exercise-editor",
                  private_spec: { type: SurveyType.NonFactorial, id: v4(), content: [] },
                })
                break
              }
              default: {
                setState({
                  view_type: "exercise-editor",
                  private_spec: null,
                })
              }
            }
          }}
        >
          <option value={undefined} disabled selected>
            --
          </option>
          <option value={SurveyType.Factorial}>{SurveyType.Factorial}</option>
          <option value={SurveyType.NonFactorial}>{SurveyType.NonFactorial}</option>
        </select>
      </div>
    )
  }

  switch (state.type) {
    case SurveyType.Factorial: {
      return (
        <div>
          <FactorialSurveyEditor key={state.id} state={state} setState={setState} />
        </div>
      )
    }
    case SurveyType.NonFactorial: {
      return (
        <div>
          <SurveyItemEditor key={state.id} state={state} setState={setState} />
        </div>
      )
    }
  }
}

export default Editor
