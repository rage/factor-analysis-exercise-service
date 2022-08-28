/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import { v4 } from "uuid"

import { State } from "../../../pages/iframe"
import { Factor, FactorialSurvey, Question } from "../../../util/stateInterfaces"
import CsvReader from "../../SharedMisc/CsvReader"
import ListInputEditor from "../../SharedMisc/ListInputEditor"
import { ButtonWrapper, NewButton, StyledInnerEditor } from "../../StyledComponents/Wrappers"
import OutputMatrix from "../OutputMatrix"

import FactorEditor from "./FactorEditor"
import LabelEditor from "./LabelEditor"
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
      <fieldset>
        <legend>Options</legend>
        <ol>
          {state?.options?.map((o) => (
            <li key={o.id}>
              <LabelEditor
                key={o.id}
                item={o}
                onDelete={() => {
                  const newLabels = (state as FactorialSurvey).options.filter((e) => e.id !== o.id)
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
      </fieldset>

      <fieldset>
        <legend>Questions</legend>
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
            <CsvReader
              title="Enter Factor weights CSV File"
              parseUsingHeaders={(value) => {
                const factors: Factor[] = []
                Object.keys(value).forEach((header) => {
                  const factor: Factor = {
                    id: v4(),
                    label: header,
                    name: "",
                    weights: { ...(value[header] as { [key: string]: number }) },
                    score: 0,
                  }
                  factors.push(factor)
                })
                console.log(factors)
                setState({
                  view_type: "exercise-editor",
                  private_spec: { ...state, factors: factors },
                })
              }}
              parseNoHeaders={() => null}
              disableHeaderOption={true}
              applyMsg="set factors"
            />
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
    </div>
  )
}

export default FactorialSurveyEditor
