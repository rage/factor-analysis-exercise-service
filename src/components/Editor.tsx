import styled from "@emotion/styled"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { v4 } from "uuid"
import CheckBox from "../shared-module/components/InputFields/CheckBox"

import { State } from "../pages/iframe"
import { CurrentStateMessage } from "../shared-module/iframe-protocol-types"
import { FactorialSurvey } from "../util/stateInterfaces"

import ButtonEditor from "./ButtonEditor"
import TextField from "../shared-module/components/InputFields/TextField"
import { css } from "@emotion/css"
import { respondToOrLarger } from "../shared-module/styles/respond"
import QuestionEditor from "./QuestionEditor"

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
  const { t } = useTranslation()

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

    console.log(state)
  return (

    
    <div>
      {state && <div
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
          checked={(state?.isFactorial) ?? false }
          onChange={function (checked: boolean): void {
            const newState: FactorialSurvey = { ...(state as FactorialSurvey) }
            newState.isFactorial = checked
            newState.factorAmount = checked ? newState.factorAmount : 0
            setState({ view_type: "exercise-editor", private_spec: newState })
          }}
          className={css`
            flex: 1;
            padding-top: 1.3rem;
          `}
        />

        <TextField
          label="Amount of Factors"
          value={state?.factorAmount?.toString() ?? "0"}
          disabled={!(state?.isFactorial) ?? true}
          type="number"
          onChange={(value) => {
            const parsed = parseInt(value)
            if (isNaN(parsed)) {
              return
            }
            const newState: FactorialSurvey = { ...(state as FactorialSurvey) }
            newState.factorAmount = parsed
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
          className={css`
            flex: 1;
            padding-right: 1;
          `}
        />
      </div>}
      <ButtonWrapper>
        Options
        {(typeof state?.optionLabels !== 'undefined') && state.optionLabels.map((o) => (
          <ButtonEditor
            key={o.id}
            item={o}
            onDelete={() => {
              const newState: FactorialSurvey = { ...(state as FactorialSurvey) }

              const newLabels = newState.optionLabels.filter((e) => e.id !== o.id)
              // eslint-disable-next-line i18next/no-literal-string
              setState({
                view_type: "exercise-editor",
                private_spec: { ...state, optionLabels: newLabels }
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
            const newState: FactorialSurvey = { ...(state as FactorialSurvey) }
            if (typeof newState.optionLabels === 'undefined') {
              newState.optionLabels = []
            }
            newState.optionLabels.push({ label: "", value: 1, id: v4() })
            // eslint-disable-next-line i18next/no-literal-string
            setState({ view_type: "exercise-editor", private_spec: newState })
          }}
        >
          Add Option
        </NewButton>
      </ButtonWrapper>
      <ButtonWrapper>
        Questions
        {(typeof state?.questions !== 'undefined') && state.questions.map((o) => (
          <QuestionEditor
            key={o.id}
            item={o}
            factorAmount={state.factorAmount}
            onDelete={() => {
              const newState: FactorialSurvey = { ...(state as FactorialSurvey) }

              const newQuestions = newState.questions.filter((e) => e.id !== o.id)
              // eslint-disable-next-line i18next/no-literal-string
              setState({
                view_type: "exercise-editor",
                private_spec: { ...state, questions: newQuestions }
              })
            }}
            onChangeQuestion={(task) => {
              const newQuestions = state.questions.map((e) => {
                if (e.id !== o.id) {
                  return e
                }
                return task
              })
              // eslint-disable-next-line i18next/no-literal-string
              setState({
                view_type: "exercise-editor",
                private_spec: { ...state, questions: newQuestions }
              })
            }}
          />
        ))}

        <NewButton
          onClick={() => {
            const newState: FactorialSurvey = { ...(state as FactorialSurvey) }
            if (typeof newState.questions === 'undefined') {
              newState.questions = []
            }
            newState.questions.push({ question: "", id: v4() })
            // eslint-disable-next-line i18next/no-literal-string
            setState({ view_type: "exercise-editor", private_spec: newState })
          }}
        >
          Add Question
        </NewButton>
      </ButtonWrapper>
    </div>
  )
}

export default Editor
