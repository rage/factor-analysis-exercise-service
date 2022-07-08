import { State } from "../pages/iframe"
import TextField from "../shared-module/components/InputFields/TextField"
import { FactorialSurvey } from "../util/stateInterfaces"

import styled from "@emotion/styled"
import ButtonEditor from "./ButtonEditor"
import { v4 } from "uuid"
import QuestionEditor from "./QuestionEditor"


interface Props {
  state: FactorialSurvey
  setState: (newState: State) => void
}

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
const SurveyEditor: React.FC<Props> = ({ state, setState }) => {
  return (
    <div>
     
      {state && <div>
        <TextField
          label="Amount of Factors"
          value={state?.factorAmount?.toString() ?? "0"}
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
            onChangeOrder={(task) => {
              const newQuestions = state.questions.map((e) => {
                if (e.id !== o.id) {
                  return e
                }
                return task
              })
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
            const questionIndex = newState.questions.length + 1
            newState.questions.push({ question: "", id: v4(), questionNr: questionIndex })
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

export default SurveyEditor