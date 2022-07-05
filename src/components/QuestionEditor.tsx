import { css } from "@emotion/css"
import styled from "@emotion/styled"
import TextField from "../shared-module/components/InputFields/TextField"

import { Question } from "../util/stateInterfaces"
interface Props {
  item: Question
  factorAmount: number | null
  onDelete: () => void
  onChangeQuestion: (item: Question) => void
  onChangeVector: (item: Question) => void
}

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

const ButtonEditor: React.FC<Props> = ({ item, factorAmount, onDelete, onChangeQuestion, onChangeVector }) => {
  return (
    <StyledButtonEditor>
      <TextField
        label="Question text"
        value={item.question ?? "0"}
        type="text"
        onChange={(value) => {
          onChangeQuestion({ ...item, question: value })
        }}
        className={css`
        flex: 1;
        padding-right: 1;
      `}
      />
      <TextField
        label={`vector of ${factorAmount}`}
        value={item.factorWeights ?? ""}
        type="text"
        disabled={(factorAmount !== 0) ? false : true}
        onChange={(value) => {
          onChangeVector({ ...item, factorWeights: value })
        }}
        className={css`
      flex: 1;
      padding-right: 1;
    `}
      />
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <DeleteButton onClick={onDelete}>x</DeleteButton>
    </StyledButtonEditor>
  )
}

export default ButtonEditor
