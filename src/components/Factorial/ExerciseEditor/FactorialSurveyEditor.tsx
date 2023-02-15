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
      <fieldset>
        <legend>{"Submission view"}</legend>
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
          label="Feedback message for the case of successfull submission"
          type="text"
          value={
            state.reportVariables?.reportSuccessMessage
              ? state.reportVariables.reportSuccessMessage
              : ""
          }
          onChange={(value) => {
            setState({
              view_type: "exercise-editor",
              private_spec: {
                ...state,
                reportVariables: { ...state.reportVariables, reportSuccessMessage: value },
              },
            })
          }}
        />
        <TextField
          label="Feedback message for the case of failure (e.g. could not calculate factor report: too many nan-valued answers)"
          type="text"
          value={
            state.reportVariables?.reportFailureMessage
              ? state.reportVariables.reportFailureMessage
              : ""
          }
          onChange={(value) => {
            setState({
              view_type: "exercise-editor",
              private_spec: {
                ...state,
                reportVariables: { ...state.reportVariables, reportFailureMessage: value },
              },
            })
          }}
        />
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
                    comparingVariable: {},
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
              id={`factor-weights-csv-file-input`}
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
              <legend>{"Define the user variable"}</legend>
              <CsvReader
                title="Upload means and SDs CSV File for answer normalization"
                parseUsingHeaders={(value) => {
                  const normalVec: NormalizationValues = {
                    means: {},
                    standardDeviations: {},
                  }
                  Object.keys(value).forEach((header) => {
                    if (header.includes("mean")) {
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
                id={`scaling-values-csv-file-input`}
              />
              <StyledInnerEditor>
                <TextField
                  label="Default label for user score icon"
                  type="text"
                  value={
                    state.reportVariables?.userVariable?.label
                      ? state.reportVariables?.userVariable?.label
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
                  label="Global variable key for user icon"
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
                  label={"Select icon for user score"}
                  chosenLogo={state.reportVariables?.userVariable?.logo}
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
              <legend>{"Define the main-mean variable"}</legend>
              <StyledInnerEditor>
                <TextField
                  label={`Label for main mean (e.g. "Dogs on average")`}
                  type="text"
                  value={
                    state.reportVariables?.zeroVariable?.label
                      ? state.reportVariables.zeroVariable?.label
                      : ""
                  }
                  onChange={(value) => {
                    setState({
                      view_type: "exercise-editor",
                      private_spec: {
                        ...state,
                        reportVariables: {
                          ...state.reportVariables,
                          zeroVariable: {
                            ...state.reportVariables?.zeroVariable,
                            label: value,
                          },
                        },
                      },
                    })
                  }}
                  className={css`
                    flex: 3;
                    padding: 0 0.5rem 0 0rem;
                  `}
                />
                <LogoSelection
                  label={"Select icon for main-mean"}
                  chosenLogo={state.reportVariables?.zeroVariable?.logo}
                  onChange={(value) => {
                    setState({
                      view_type: "exercise-editor",
                      private_spec: {
                        ...state,
                        reportVariables: {
                          ...state.reportVariables,
                          zeroVariable: {
                            ...state.reportVariables?.zeroVariable,
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
              <legend>{"Define a variable to compare to"}</legend>
              <StyledInnerEditor>
                <TextField
                  label="Global variable key"
                  type="text"
                  value={
                    state.reportVariables?.comparingVariable?.globalKey
                      ? state.reportVariables.comparingVariable?.globalKey
                      : ""
                  }
                  onChange={(value) => {
                    setState({
                      view_type: "exercise-editor",
                      private_spec: {
                        ...state,
                        reportVariables: {
                          ...state.reportVariables,
                          comparingVariable: {
                            ...state.reportVariables?.comparingVariable,
                            globalKey: value,
                          },
                        },
                      },
                    })
                  }}
                  className={css`
                    flex: 3;
                    padding: 0 0.5rem 0 0rem;
                  `}
                />
                <LogoSelection
                  label={"Select icon for variable"}
                  chosenLogo={state.reportVariables?.comparingVariable?.logo}
                  onChange={(value) => {
                    setState({
                      view_type: "exercise-editor",
                      private_spec: {
                        ...state,
                        reportVariables: {
                          ...state.reportVariables,
                          comparingVariable: {
                            ...state.reportVariables?.comparingVariable,
                            logo: value,
                          },
                        },
                      },
                    })
                  }}
                />
              </StyledInnerEditor>
              {state.reportVariables?.comparingVariable?.globalKey &&
                state.reportVariables?.comparingVariable?.globalKey?.length > 0 && (
                  <CsvReader
                    title={`Upload average values for ${state.reportVariables.comparingVariable.globalKey} csv file`}
                    parseUsingHeaders={(value) => {
                      const newFactors = state.factors
                      Object.keys(value).forEach((header) => {
                        newFactors.map((f) => {
                          if (
                            f.label === header &&
                            state.reportVariables?.comparingVariable?.globalKey
                          ) {
                            f.comparingVariable = {}
                            f.comparingVariable[state.reportVariables.comparingVariable.globalKey] =
                              { ...(value[header] as { [key: string]: number }) }
                          }
                        })
                      })
                      setState({
                        view_type: "exercise-editor",
                        private_spec: { ...state, factors: newFactors },
                      })
                    }}
                    parseNoHeaders={() => null}
                    disableHeaderOption={true}
                    applyMsg={`set average values for ${state.reportVariables.comparingVariable.globalKey}`}
                    id={`${state.reportVariables.comparingVariable.globalKey}-avgs-csv-file-input`}
                  />
                )}
            </fieldset>
            <StyledInnerEditor>
              <TextField
                label="maximum amount of questions permitted to be rated with NaN (natural number)"
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
          </fieldset>
          <OutputMatrix state={state} />
        </>
      )}
    </div>
  )
}

export default FactorialSurveyEditor
