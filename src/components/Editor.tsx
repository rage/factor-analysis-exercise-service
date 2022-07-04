import styled from "@emotion/styled"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { v4 } from "uuid"
import CheckBox from "../shared-module/components/InputFields/CheckBox"

import { State } from "../pages/iframe"
import { CurrentStateMessage } from "../shared-module/iframe-protocol-types"
import { FactorQuery } from "../util/stateInterfaces"

import ButtonEditor from "./ButtonEditor"
import TextField from "../shared-module/components/InputFields/TextField"
import { css } from "@emotion/css"
import { respondToOrLarger } from "../shared-module/styles/respond"

const CURRENT_STATE = "current-state"
interface Props {
  state: FactorQuery
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
  const { t } = useTranslation()

  const [factorial, setFactorial] = useState(false)
  const [factorsN, setFactorsN] = useState<number>(0)
  const [optionsN, setOptionsN] = useState<number>(0)

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

      <div
        className={css`
        display: flex;
        flex-direction: column;
        margin-bottom: 1rem;
        ${respondToOrLarger.md} {
        align-items: center;
        flex-direction: row;
        }
      `}
      >
        <CheckBox
          label="Factorial"
          checked={factorial}
          onChange={function (checked: boolean): void {
            setFactorial(checked)
            const newState: FactorQuery = { ...(state as FactorQuery) }
            newState.isFactorial = checked
            setState({ view_type: "exercise-editor", private_spec: newState })
          }}
          className={css`
          flex: 1;
          padding-top: 1.3rem;
        `}
        />

        <TextField
          label="Amount of Factors"
          value={factorsN.toString() ?? "0"}
          disabled={!factorial}
          type="number"
          onChange={(value) => {
            const parsed = parseInt(value)
            if (isNaN(parsed)) {
              return
            }
            setFactorsN(parsed)
            const newState: FactorQuery = { ...(state as FactorQuery) }
            newState.factorAmount = parsed
            console.log("newState: ", newState)
            setState({ view_type: "exercise-editor", private_spec: newState })
          }}
          className={css`
            flex: 1;
            padding-right: 1;
          `}
        />

        <TextField
          label="Amount of Options"
          value={optionsN.toString() ?? "0"}
          type="number"
          onChange={(value) => {
            const parsed = parseInt(value)
            if (isNaN(parsed)) {
              return
            }
            setOptionsN(parsed)
          }}
        />
      </div>
      <ButtonWrapper>
        {state.optionLabels.map((o) => (
          <ButtonEditor
            key={o.id}
            item={o}
            onDelete={() => {
              const newState: FactorQuery = { ...(state as FactorQuery) }

              const newLabels = newState.optionLabels.filter((e) => e.id !== o.id)
              // eslint-disable-next-line i18next/no-literal-string
              setState({
                view_type: "exercise-editor",
                private_spec: { ...state, optionLabels: newLabels}
              })
            }}
            onChange={(task) => {
              const newLabels = state.optionLabels.map((e) => {
                if (e.id !== o.id) {
                  return e
                }
                return task
              })
              // eslint-disable-next-line i18next/no-literal-string
              setState({
                view_type: "exercise-editor",
                private_spec: { ...state, optionLabels: newLabels }
              })
            }}
          />
        ))}
        <NewButton
          onClick={() => {
            const newState: FactorQuery = { ...(state as FactorQuery) }
            if (typeof newState.optionLabels === 'undefined') {
              newState.optionLabels = []
            }
            console.log(newState.optionLabels === null)
            newState.optionLabels.push({ label: "", value: 1, id: v4() })
            // eslint-disable-next-line i18next/no-literal-string
            setState({ view_type: "exercise-editor", private_spec: newState })
          }}
        >
          Add Option
        </NewButton>
      </ButtonWrapper>
    </div>
  )
}

export default Editor
