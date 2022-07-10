import { css } from "@emotion/css"
import styled from "@emotion/styled"
import TextField from "../shared-module/components/InputFields/TextField"

import { Question } from "../util/stateInterfaces"
interface Props {
  item: Question
  onDelete: () => void
  onChangeQuestion: (item: Question) => void
  onChangeOrder: (item: Question) => void
}

const InputNumberbox = styled.input`
  margin: 0 auto;
  margin-right: 0.5rem;
  width: 2.5rem;
  height: 2rem;
`

const StyledButtonEditor = styled.div`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  border: 1px solid black;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-apart;
`

const DeleteButton = styled.button`
  width: 2rem;
  height: 2rem;
`

const ButtonEditor: React.FC<Props> = ({ item, onDelete, onChangeQuestion, onChangeOrder }) => {
  return (
    <StyledButtonEditor>
      <InputNumberbox
        type="number"
        value={item.questionNr}
        onChange={(e) => {
          onChangeOrder({ ...item, questionNr: parseInt(e.target.value) })
        }}
      />
      <TextField
        label="Question text"
        value={item.question ?? "0"}
        type="text"
        onChange={(value) => {
          onChangeQuestion({ ...item, question: value })
        }}
        className={css`
        flex: 1;
        padding: 0.5rem;
        width: 100%;
        margin: 0 auto;
        margin-right: 0.5rem;
        `}
      />
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <DeleteButton onClick={onDelete}>x</DeleteButton>
    </StyledButtonEditor>
  )
}

export default ButtonEditor
