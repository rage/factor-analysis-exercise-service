/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import { v4 } from "uuid"

import { State } from "../../pages/iframe"
import { Factor, FactorialSurvey, Question } from "../../util/stateInterfaces"
import CsvReader from "../CsvReader"
import ListInputEditor from "../ListInputEditor"
import { ButtonWrapper, NewButton, StyledInnerEditor } from "../StyledComponents/Wrappers"

import FactorEditor from "./FactorEditor"
import LabelEditor from "./LabelEditor"
import OutputMatrix from "./OutputMatrix"
import QuestionEditor from "./QuestionEditor"

interface Props {
  state: FactorialSurvey
  setState: (newState: State) => void
}

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
            <CsvReader
              id={state.id}
              setFactors={(value) => {
                const newFactors: Factor[] = [...value].map(([_label, factor]) => {
                  return factor
                })
                setState({
                  view_type: "exercise-editor",
                  private_spec: { ...state, factors: newFactors },
                })
              }}
            />
            <fieldset>
              <legend>Factors</legend>
              <div>
                {state?.factors?.map((factor) => {
                  return (
                    <FactorEditor
                      key={factor.id}
                      factor={factor}
                      onChangeFactor={(changedFactor) => {
                        const newFactors = state.factors.map((f) => {
                          if (f.id !== changedFactor.id) {
                            return f
                          }
                          return changedFactor
                        })
                        setState({
                          view_type: "exercise-editor",
                          private_spec: { ...state, factors: newFactors },
                        })
                      }}
                    />
                  )
                })}
              </div>
            </fieldset>
            <OutputMatrix state={state} />
          </>
        )}
      </>
    </div>
  )
}

export default FactorialSurveyEditor
