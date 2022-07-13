import { useEffect } from "react"

import { State } from "../pages/iframe"
import { CurrentStateMessage } from "../shared-module/iframe-protocol-types"
import { FactorialSurvey } from "../util/stateInterfaces"

import FactorialSurveyEditor from "./FactorialSurveyEditor"

const CURRENT_STATE = "current-state"
interface Props {
  state: FactorialSurvey
  setState: (newState: State) => void
  port: MessagePort
}

const Editor: React.FC<Props> = ({ state, setState, port }) => {

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

  return (
    <div>
      <FactorialSurveyEditor
        key={state.id}
        state={state}
        setState={setState}
      />
    </div>
  )
}

export default Editor
