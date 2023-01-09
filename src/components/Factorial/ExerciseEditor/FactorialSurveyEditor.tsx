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
import { LogoSelection } from "./ComponentEditors/LogoSelector"
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
                    breedAvgs: {},
                  }
                  factors.push(factor)
                })
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
            <legend>{"Other documents and report variables"}</legend>
            <fieldset>
              <CsvReader
                title="Upload means and SDs CSV File for answer normalization"
                parseUsingHeaders={(value) => {
                  const normalVec: NormalizationValues = {
                    means: {},
                    standardDeviations: {},
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
                  setState({
                    view_type: "exercise-editor",
                    private_spec: { ...state, meansAndStandardDeviations: normalVec },
                  })
                }}
                parseNoHeaders={() => null}
                disableHeaderOption={true}
                applyMsg="set normalization values"
              />
              <StyledInnerEditor>
                <TextField
                  label="Default label for user score icon"
                  type="text"
                  value={
                    state.reportVariables?.userVariable?.label
                      ? state.reportVariables.userVariable.label
                      : ""
                  }
                  onChange={(value) => {
                    setState({
                      view_type: "exercise-editor",
                      private_spec: {
                        ...state,
                        reportVariables: {
                          ...state.reportVariables,
                          userVariable: {
                            ...state.reportVariables?.userVariable,
                            label: value,
                          },
                        },
                      },
                    })
                  }}
                  className={css`
                    flex: 3;
                  `}
                />
                <TextField
                  label="Global variable key for user icon label"
                  type="text"
                  value={
                    state.reportVariables?.userVariable?.globalKey
                      ? state.reportVariables.userVariable.globalKey
                      : ""
                  }
                  onChange={(value) => {
                    setState({
                      view_type: "exercise-editor",
                      private_spec: {
                        ...state,
                        reportVariables: {
                          ...state.reportVariables,
                          userVariable: {
                            ...state.reportVariables?.userVariable,
                            globalKey: value,
                          },
                        },
                      },
                    })
                  }}
                  className={css`
                    flex: 3;
                    padding: 0 0.5rem 0 0.5rem;
                  `}
                />
                <LogoSelection
                  onChange={(value) => {
                    setState({
                      view_type: "exercise-editor",
                      private_spec: {
                        ...state,
                        reportVariables: {
                          ...state.reportVariables,
                          userVariable: {
                            ...state.reportVariables?.userVariable,
                            logo: value,
                          },
                        },
                      },
                    })
                  }}
                />
              </StyledInnerEditor>
            </fieldset>
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
            <StyledInnerEditor>
              <TextField
                label="Global variable key for breed"
                type="text"
                value={state.reportVariables ? state.reportVariables.breed : ""}
                onChange={(value) => {
                  setState({
                    view_type: "exercise-editor",
                    private_spec: {
                      ...state,
                      reportVariables: { ...state.reportVariables, breed: value },
                    },
                  })
                }}
                className={css`
                  flex: 3;
                  padding: 0 0.5rem 0 0.5rem;
                `}
              />
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
                  flex: 2;
                `}
              />
            </StyledInnerEditor>
            <TextField
              label="Title text for submission view"
              type="text"
              value={state.reportVariables?.titleText ? state.reportVariables.titleText : ""}
              onChange={(value) => {
                setState({
                  view_type: "exercise-editor",
                  private_spec: {
                    ...state,
                    reportVariables: { ...state.reportVariables, titleText: value },
                  },
                })
              }}
            />
            <TextField
              label="Message for no report (too many nan-valued answers)"
              type="text"
              value={
                state.reportVariables?.noReportMessage ? state.reportVariables.noReportMessage : ""
              }
              onChange={(value) => {
                setState({
                  view_type: "exercise-editor",
                  private_spec: {
                    ...state,
                    reportVariables: { ...state.reportVariables, noReportMessage: value },
                  },
                })
              }}
            />
          </fieldset>
          <OutputMatrix state={state} />
        </>
      )}
    </div>
  )
}

export default FactorialSurveyEditor
