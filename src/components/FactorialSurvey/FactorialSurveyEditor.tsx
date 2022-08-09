/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import styled from "@emotion/styled"
import { v4 } from "uuid"

import { State } from "../../pages/iframe"
import { Factor, FactorialSurvey, Question } from "../../util/stateInterfaces"
import ListInputEditor from "../ListInputEditor"

import LabelEditor from "./LabelEditor"
import MatrixEditor from "./MatrixEditor"
import OutputMatrix from "./OutputMatrix"
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

const Input = styled.input`
  padding: 0.5rem;
  width: 100%;
  margin: 0 auto;
  margin-right: 0.5rem;
`

const StyledInnerEditor = styled.div`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-apart;
`

const FactorialSurveyEditor: React.FC<React.PropsWithChildren<Props>> = ({ state, setState }) => {
  let questionIndex = 0

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <>
        <fieldset>
          <legend>Options</legend>
          <ButtonWrapper>
            <ol>
              {state?.options?.map((o) => (
                <li key={o.id}>
                  <LabelEditor
                    key={o.id}
                    item={o}
                    onDelete={() => {
                      const newState: FactorialSurvey = { ...(state as FactorialSurvey) }

                      const newLabels = newState.options.filter((e) => e.id !== o.id)
                      // eslint-disable-next-line i18next/no-literal-string
                      setState({
                        view_type: "exercise-editor",
                        private_spec: { ...state, options: newLabels },
                      })
                    }}
                    onChange={(task) => {
                      const newLabels = state.options.map((e) => {
                        if (e.id !== o.id) {
                          return e
                        }
                        return task
                      })
                      // eslint-disable-next-line i18next/no-literal-string
                      setState({
                        view_type: "exercise-editor",
                        private_spec: { ...state, options: newLabels },
                      })
                    }}
                  />
                </li>
              ))}
            </ol>

            <NewButton
              onClick={() => {
                const newState: FactorialSurvey = { ...(state as FactorialSurvey) }
                if (typeof newState.options === "undefined") {
                  newState.options = []
                }
                newState.options.push({ name: "", value: 0, id: v4() })
                // eslint-disable-next-line i18next/no-literal-string
                setState({ view_type: "exercise-editor", private_spec: newState })
              }}
            >
              Add Option
            </NewButton>
          </ButtonWrapper>
        </fieldset>

        <fieldset>
          <legend>Questions</legend>
          <ButtonWrapper>
            <ol>
              {state?.questions?.map((q) => {
                if (q.questionLabel !== "info") {
                  questionIndex = questionIndex + 1
                  console.log(questionIndex)
                }
                return (
                  <li
                    key={q.id}
                    value={q.questionLabel === "info" ? 9 : questionIndex}
                    className={css`
                      list-style-type: ${q.questionLabel === "info" ? "lower-latin" : ""};
                    `}
                  >
                    <QuestionEditor
                      key={q.id}
                      item={q}
                      onChangeQuestion={(task) => {
                        const newQuestions = state.questions.map((e) => {
                          if (e.id !== q.id) {
                            return e
                          }
                          return task
                        })
                        // eslint-disable-next-line i18next/no-literal-string
                        setState({
                          view_type: "exercise-editor",
                          private_spec: { ...state, questions: newQuestions },
                        })
                      }}
                    />
                  </li>
                )
              })}
            </ol>
          </ButtonWrapper>
          Input questions as a list
          <ButtonWrapper>
            <ListInputEditor
              topic="question"
              questions={state.questions}
              onChange={(value) => {
                const newQuestions: Question[] = []
                value.map((e) => {
                  if (!e) {
                    return
                  }
                  newQuestions.push({ id: v4(), questionLabel: e[0], question: e[1] })
                })
                const newState: FactorialSurvey = {
                  ...(state as FactorialSurvey),
                  questions: newQuestions,
                }
                setState({ view_type: "exercise-editor", private_spec: newState })
              }}
            />
          </ButtonWrapper>
        </fieldset>
        <StyledInnerEditor>
          <legend>Provide factor report to student</legend>
          <input
            type="checkbox"
            checked={state.calculateFeedback}
            onChange={(e) => {
              const newState: FactorialSurvey = {
                ...(state as FactorialSurvey),
                calculateFeedback: e.target.checked,
              }
              setState({ view_type: "exercise-editor", private_spec: newState })
            }}
          />
        </StyledInnerEditor>

        {state && state.calculateFeedback && (
          <>
            <fieldset>
              <legend>Factors</legend>
              <div>
                <input
                  value={state?.factorAmount?.toString() ?? 0}
                  type="number"
                  onChange={(e) => {
                    const parsedNumber = parseInt(e.target.value)
                    if (isNaN(parsedNumber)) {
                      return
                    }
                    const newState: FactorialSurvey = {
                      ...(state as FactorialSurvey),
                      factors: [],
                      factorAmount: parsedNumber,
                    }
                    for (let i = 0; i < parsedNumber; i++) {
                      newState.factors.push({ id: v4(), name: "", score: 99999 })
                    }
                    setState({ view_type: "exercise-editor", private_spec: newState })
                  }}
                />
                <ol>
                  {state?.factors?.map((e) => {
                    return (
                      <li key={e.id}>
                        <Input
                          value={e.name}
                          type="text"
                          onChange={(event) => {
                            const factor: Factor = { ...e, name: event.target.value }
                            const newFactors = state.factors.map((f) => {
                              if (f.id !== e.id) {
                                return f
                              }
                              return factor
                            })
                            // eslint-disable-next-line i18next/no-literal-string
                            setState({
                              view_type: "exercise-editor",
                              private_spec: { ...state, factors: newFactors },
                            })
                          }}
                        />
                      </li>
                    )
                  })}
                </ol>
              </div>
            </fieldset>
            <ButtonWrapper>
              <MatrixEditor
                item={state}
                onChange={(value: number[][]) => {
                  setState({
                    view_type: "exercise-editor",
                    private_spec: { ...state, matrix: value },
                  })
                }}
              />
            </ButtonWrapper>
            <OutputMatrix state={state} />
          </>
        )}
      </>
    </div>
  )
}

export default FactorialSurveyEditor
