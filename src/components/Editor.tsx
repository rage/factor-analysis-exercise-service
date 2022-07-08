import styled from "@emotion/styled"
import { useEffect } from "react"

import { State } from "../pages/iframe"
import { CurrentStateMessage } from "../shared-module/iframe-protocol-types"
import { FactorialSurvey } from "../util/stateInterfaces"

import SurveyEditor from "./SurveyEditor"

const CURRENT_STATE = "current-state"
interface Props {
  state: FactorialSurvey
  setState: (newState: State) => void
  port: MessagePort
}

// eslint-disable-next-line i18next/no-literal-string
const ButtonWrapper = styled.div`
  padding: 1rem 0;
`

const NewButton = styled.button`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  display: block;
  padding: 0.5rem;
  background-color: white;
  border: 1px solid black;
  transition: all 0.3s;

  &:hover {
    background-color: #f1f1f1;
  }
`

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
      <SurveyEditor
        key={state.id}
        state={state}
        setState={setState}
      />
    </div>
  )
}

export default Editor
