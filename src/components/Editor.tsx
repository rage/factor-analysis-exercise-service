import { css } from "@emotion/css"
import { useEffect, useState } from "react"

import { State } from "../pages/iframe"
import { CurrentStateMessage } from "../shared-module/iframe-protocol-types"
import { FactorialSurvey, Survey } from "../util/stateInterfaces"

import FactorialSurveyEditor from "./FactorialSurvey/FactorialSurveyEditor"
import SurveyItemEditor from "./Survey/SurveyItemEditor"

const CURRENT_STATE = "current-state"
interface Props {
  state: FactorialSurvey | Survey
  setState: (newState: State) => void
  port: MessagePort
}

const Editor: React.FC<Props> = ({ state, setState, port }) => {

  const types = ["initial", "factorial", "non-factorial"]
  const [surveyType, setSurveyType] = useState(types[0])

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
    if (state.type) setSurveyType(state.type)
  }, [state, port])

  switch (surveyType) {
    case (types[1]): {
      const newState: FactorialSurvey = { ...(state) as FactorialSurvey, type: types[1] }
      return (
        <div>
          <FactorialSurveyEditor
            key={newState.id}
            state={newState}
            setState={setState}
          />
        </div>
      )
    }
    case (types[2]): {
      const newState: Survey = { ...(state) as Survey, type: types[2] }
      return (
        <div>
          <SurveyItemEditor
            key={newState.id}
            state={newState}
            setState={setState}
          />
        </div>
      )
    }
    default: {
      return (
        <div className={css`
          display: flex;
          flex-direction: column;
        `}>
          <label>Choose type of Survey</label>
          <select
            name="type-selection"
            id="survey-type"
            onChange={(event) => {
              setSurveyType(event.target.value)
            }}
          >
            <option value={types[0]}>--</option>
            <option value={types[1]}>
              {types[1]}
            </option>
            <option value={types[2]}>
              {types[2]}
            </option>
          </select>
        </div>
      )
    }
  }
}

export default Editor
