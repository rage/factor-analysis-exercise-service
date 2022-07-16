import { css } from "@emotion/css"
import styled from "@emotion/styled"
import TextArea from "../../shared-module/components/InputFields/TextAreaField"

import { Question } from "../../util/stateInterfaces"
import MarkdownText from "../MarkdownText"
interface Props {
  item: Question
  onDelete: () => void
  onChangeQuestion: (item: Question) => void
}

const StyledEditor = styled.div`
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

const QuestionEditor: React.FC<Props> = ({ item, onDelete, onChangeQuestion }) => {
  return (
    <StyledEditor>
      <TextArea
        label="Question text"
        value={item.question ?? ""}
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
      <div
        className={css`
          flex: 1;
          margin: 0.5rem;
        `}
      >
        {item.question && <MarkdownText text={item.question} />}
      </div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <DeleteButton onClick={onDelete}>x</DeleteButton>
    </StyledEditor>
  )
}

export default QuestionEditor
