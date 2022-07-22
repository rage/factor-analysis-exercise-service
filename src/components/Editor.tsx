import { css } from "@emotion/css"
import { useEffect, useState } from "react"

import { State } from "../pages/iframe"
import { CurrentStateMessage } from "../shared-module/iframe-protocol-types"
import { FactorialSurvey, Survey, SurveyType } from "../util/stateInterfaces"

import FactorialSurveyEditor from "./FactorialSurvey/FactorialSurveyEditor"
import SurveyItemEditor from "./Survey/SurveyItemEditor"

const CURRENT_STATE = "current-state"
interface Props {
  state: FactorialSurvey | Survey
  setState: (newState: State) => void
  port: MessagePort
}

const Editor: React.FC<Props> = ({ state, setState, port }) => {

  const [surveyType, setSurveyType] = useState<SurveyType>()

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
    case (SurveyType.Factorial): {
      const newState: FactorialSurvey = { ...(state) as FactorialSurvey, type: surveyType }
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
    case (SurveyType.NonFactorial): {
      const newState: Survey = { ...(state) as Survey, type: surveyType }
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
              const surveyType: SurveyType = event.target.value as unknown as SurveyType
              setSurveyType(surveyType)
            }}
          >
            <option value={""}>--</option>
            <option value={SurveyType.Factorial}>
              {SurveyType.Factorial}
            </option>
            <option value={SurveyType.NonFactorial}>
              {SurveyType.NonFactorial}
            </option>
          </select>
        </div>
      )
    }
  }
}

export default Editor
