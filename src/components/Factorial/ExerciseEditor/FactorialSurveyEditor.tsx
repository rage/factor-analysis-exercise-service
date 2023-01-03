import { css } from "@emotion/css"
import { v4 } from "uuid"

import { State } from "../../../pages/iframe"
import TextField from "../../../shared-module/components/InputFields/TextField"
import {
  Factor,
  FactorialSurvey,
  NormalizationValues,
  Question,
} from "../../../util/stateInterfaces"
import CsvReader from "../../SharedMisc/CsvReader"
import ListInputEditor from "../../SharedMisc/ListInputEditor"
import { ButtonWrapper, NewButton, StyledInnerEditor } from "../../StyledComponents/Wrappers"

import FactorEditor from "./ComponentEditors/FactorEditor"
import OptionEditor from "./ComponentEditors/OptionEditor"
import QuestionEditor from "./ComponentEditors/QuestionEditor"
import OutputMatrix from "./OutputMatrix"

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
        <legend>{"Options"}</legend>
        <ol>
          {state?.options?.map((o, idx) => (
            <li key={o.id}>
              <OptionEditor
                idx={idx + 1}
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
          {"Add Option"}
        </NewButton>
      </fieldset>

      <fieldset>
        <legend>{"Questions"}</legend>
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
        {"Input questions as a list"}
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
        <label htmlFor="calculate-feedback-checkbox">{"Provide factor report to student"}</label>
        <input
          type="checkbox"
          id="calculate-feedback-checkbox"
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
            <legend>{"Factors"}</legend>
            <CsvReader
              title="Upload Factor weights CSV File"
              parseUsingHeaders={(value) => {
                const factors: Factor[] = []
                Object.keys(value).forEach((header) => {
                  const factor: Factor = {
                    id: v4(),
                    label: header,
                    name: "",
                    weights: { ...(value[header] as { [key: string]: number }) },
                    score: 0,
                    breedAvgs: { "": 0 },
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
          <fieldset>
            <legend>{"Other documents"}</legend>
            <fieldset>
              <CsvReader
                title="Upload breeds average scores CSV File"
                parseUsingHeaders={(value) => {
                  const newFactors = state.factors
                  Object.keys(value).forEach((header) => {
                    const factor = newFactors.find((f) => f.label === header)
                    if (factor) {
                      factor.breedAvgs = { ...(value[header] as { [key: string]: number }) }
                      newFactors.map((f) => {
                        if (f.label === header) {
                          f.breedAvgs = { ...(value[header] as { [key: string]: number }) }
                        }
                      })
                    }
                  })
                  console.log(newFactors)
                  setState({
                    view_type: "exercise-editor",
                    private_spec: { ...state, factors: newFactors },
                  })
                }}
                parseNoHeaders={() => null}
                disableHeaderOption={true}
                applyMsg="set breed average values"
              />
            </fieldset>
            <fieldset>
              <CsvReader
                title="Upload means and SDs CSV File for answer normalization"
                parseUsingHeaders={(value) => {
                  const normalVec: NormalizationValues = {
                    means: { "": 0 },
                    standardDeviations: { "": 0 },
                  }
                  Object.keys(value).forEach((header) => {
                    if (header === "means") {
                      const means = { ...(value[header] as { [key: string]: number }) }
                      normalVec.means = means
                    } else {
                      const standardDeviations = { ...(value[header] as { [key: string]: number }) }
                      normalVec.standardDeviations = standardDeviations
                    }
                  })
                  console.log(normalVec)
                  setState({
                    view_type: "exercise-editor",
                    private_spec: { ...state, meansAndStandardDeviations: normalVec },
                  })
                }}
                parseNoHeaders={() => null}
                disableHeaderOption={true}
                applyMsg="set normalization values"
              />
            </fieldset>
            <TextField
              label="max nan-answers allowed"
              type="number"
              value={state.allowedNans ? (state.allowedNans as unknown as string) : "0"}
              onChange={(value) => {
                setState({
                  view_type: "exercise-editor",
                  private_spec: { ...state, allowedNans: parseInt(value) },
                })
              }}
              className={css`
                flex: 1;
                padding: 0 0.2rem 0 1rem;
              `}
            />
          </fieldset>
          <OutputMatrix state={state} />
        </>
      )}
    </div>
  )
}

export default FactorialSurveyEditor
