import styled from "@emotion/styled";
import { v4 } from "uuid";
import { State } from "../../pages/iframe";
import { Survey } from "../../util/stateInterfaces";

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
    <ButtonWrapper>
      <NewButton
        onClick={() => {
          const newState: Survey = { ...(state as Survey) }
          if (typeof newState.content === 'undefined') {
            newState.content = []
          }
          newState.content.push({ id: v4(), question: "", answer: null })
          setState({ view_type: "exercise-editor", private_spec: newState })
        }}
      >
        Add Survey Question
      </NewButton>
    </ButtonWrapper>
  )
}

export default SurveyItemEditor