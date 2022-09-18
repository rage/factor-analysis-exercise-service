/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import { useEffect, useState } from "react"
import { v4 } from "uuid"

import { State } from "../../../pages/iframe"
import { Answer, AnswerType, Survey, SurveyItem } from "../../../util/stateInterfaces"
import ListInputEditor from "../../SharedMisc/ListInputEditor"
import { ButtonWrapper, NewButton } from "../../StyledComponents/Wrappers"

import SurveyItemEditor from "./SurveyItemEditor"

interface Props {
  state: Survey
  setState: (newState: State) => void
}

const SurveyEditor: React.FC<React.PropsWithChildren<Props>> = ({ state, setState }) => {
  const [error, setError] = useState<string[]>([])
  useEffect(() => {
    const labels = state.content.map((item) => item.question.questionLabel)
    const count = labels.reduce(
      (result, value) => ({ ...result, [value]: (result[value as keyof typeof result] || 0) + 1 }),
      {},
    )
    const duplicates = Object.keys(count).filter((value) => count[value as keyof typeof count] > 1)
    const newError: string[] = [...duplicates]
    setError(newError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <ol>
        {state?.content?.map((item) => {
          return (
            <li key={item.id}>
              <SurveyItemEditor
                item={item}
                onDelete={() => {
                  const newContent: SurveyItem[] = state.content.filter((e) => e.id !== item.id)
                  // eslint-disable-next-line i18next/no-literal-string
                  setState({
                    view_type: "exercise-editor",
                    private_spec: { ...state, content: newContent },
                  })
                }}
                onChangeSurveyItem={(quest) => {
                  const newContent = state.content.map((e) => {
                    if (e.id !== quest.id) {
                      return e
                    }
                    return quest
                  })
                  setState({
                    view_type: "exercise-editor",
                    private_spec: { ...state, content: newContent },
                  })
                }}
                onDuplicate={(quest: SurveyItem) => {
                  const additionalItem = {
                    ...quest,
                    id: v4(),
                    question: { question: "", questionLabel: "", id: v4() },
                    answer: { ...quest.answer, id: v4() },
                  }
                  const currentIndex = state.content.indexOf(quest)
                  console.log(currentIndex)
                  const newContent = state.content
                  newContent.splice(currentIndex + 1, 0, additionalItem)
                  console.log(newContent)

                  setState({
                    view_type: "exercise-editor",
                    private_spec: { ...state, content: newContent },
                  })
                }}
                state={state}
              />
            </li>
          )
        })}
      </ol>
      <div
        className={css`
          margin-top: 1rem;
          margin-bottom: 1rem;
          ${error && `color: red;`}
        `}
      >
        {error.length > 0 && <p>{"Found duplicate question labels:"}</p>}
        {error.map((label, idx) => {
          return <p key={idx}>{label}</p>
        })}
      </div>

      <ButtonWrapper>
        <NewButton
          onClick={() => {
            const newState: Survey = { ...(state as Survey) }
            if (typeof newState.content === "undefined") {
              newState.content = []
            }
            const answerObject: Answer = {
              id: v4(),
              type: AnswerType.None,
              options: [],
              answer: "",
            }
            newState.content.push({
              id: v4(),
              question: { id: v4(), question: "", questionLabel: "" },
              answer: answerObject,
              conditional: false,
            })
            setState({ view_type: "exercise-editor", private_spec: newState })
          }}
        >
          Add Survey Item
        </NewButton>
      </ButtonWrapper>
      {state.content.length === 0 && (
        <ButtonWrapper>
          Paste list of questions (one time only)
          <ListInputEditor
            topic="question"
            questions={state.content.map((item) => item.question)}
            onChange={(value) => {
              const newContent: SurveyItem[] = []
              value.map((e) => {
                if (!e) {
                  return
                }
                const answerObject: Answer = {
                  id: v4(),
                  type: AnswerType.None,
                  options: [],
                  answer: "",
                }
                newContent.push({
                  id: v4(),
                  question: { id: v4(), questionLabel: e[0], question: e[1] },
                  answer: answerObject,
                  conditional: false,
                })
              })
              setState({
                view_type: "exercise-editor",
                private_spec: { ...state, content: newContent },
              })
            }}
            disabled={state.content.length > 0}
          />
        </ButtonWrapper>
      )}
    </div>
  )
}

export default SurveyEditor
