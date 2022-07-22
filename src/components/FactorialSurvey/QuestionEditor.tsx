import { css } from "@emotion/css"
import styled from "@emotion/styled"
import TextArea from "../../shared-module/components/InputFields/TextAreaField"

import { Question } from "../../util/stateInterfaces"
import MarkdownText from "../MarkdownText"
interface Props {
  item: Question
  onChangeQuestion: (item: Question) => void
}

const StyledOuterEditor = styled.div`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  padding: 1rem;
  display: flex;
  align-items: left;
  justify-content: space-apart;
  flex-direction: column;
  `

const StyledInnerEditor = styled.div`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-apart;
  `

const QuestionEditor: React.FC<Props> = ({ item, onChangeQuestion }) => {
  return (
    <StyledOuterEditor>
      <fieldset>
        <legend>{item.questionLabel}</legend>
        <StyledInnerEditor        >
          {item.question && <MarkdownText text={item.question} />}
        </StyledInnerEditor>
        <TextArea
          label="Editor"
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
      </fieldset>
    </StyledOuterEditor>
  )
}

export default QuestionEditor
