import { css } from "@emotion/css";
import styled from "@emotion/styled";
import { v4 } from "uuid";
import { State } from "../../pages/iframe";
import { Answer, AnswerType, Survey, SurveyItem } from "../../util/stateInterfaces";
import QuestionEditor from "./QuestionEditor";

interface Props {
  state: Survey
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

const SurveyItemEditor: React.FC<Props> = ({ state, setState }) => {
  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}>
      <ol>

        {state?.content?.map((item) => {
          return (
            <li key={item.id}>
              <QuestionEditor
                item={item}
                onDelete={() => {
                  const newContent: SurveyItem[] = state.content.filter((e) => e.id !== item.id)
                  // eslint-disable-next-line i18next/no-literal-string
                  setState({
                    view_type: "exercise-editor",
                    private_spec: { ...state, content: newContent }
                  })
                }}
                onChangeQuestion={(quest) => {
                  const newContent = state.content.map((e) => {
                    if (e.id !== quest.id) {
                      return e
                    }
                    return quest
                  })
                  setState({
                    view_type: "exercise-editor",
                    private_spec: { ...state, content: newContent }
                  })
                }}
              />
            </li>
          )

        })}
      </ol>
      <ButtonWrapper>
        <NewButton
          onClick={() => {
            const newState: Survey = { ...(state as Survey) }
            if (typeof newState.content === 'undefined') {
              newState.content = []
            }
            const answerObject: Answer = { id: v4(), type: AnswerType.None, options: [], answer: "" }
            newState.content.push({ id: v4(), question: "", answer: answerObject })
            setState({ view_type: "exercise-editor", private_spec: newState })
          }}
        >
          Add Survey Question
        </NewButton>
      </ButtonWrapper>
    </div>
  )
}

export default SurveyItemEditor