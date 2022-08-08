import { css } from "@emotion/css"
import styled from "@emotion/styled"

import TextArea from "../../shared-module/components/InputFields/TextAreaField"
import { Question } from "../../util/stateInterfaces"
import { parseLabelQuestion, reverseParseLabelQuestion } from "../../util/utils"
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

const QuestionEditor: React.FC<React.PropsWithChildren<Props>> = ({ item, onChangeQuestion }) => {
  return (
    <StyledOuterEditor>
      <fieldset>
        <legend>{item.questionLabel}</legend>
        <StyledInnerEditor>
          {item.question && <MarkdownText text={item.question} />}
        </StyledInnerEditor>
        <TextArea
          label="Editor"
          placeholder="question_label; question text"
          autoResize
          onChange={(value) => {
            const parsedValue = parseLabelQuestion(value)
            if (!parsedValue) {
              return
            }
            onChangeQuestion({ ...item, questionLabel: parsedValue[0], question: parsedValue[1] })
          }}
          defaultValue={reverseParseLabelQuestion(item.questionLabel, item.question)}
          className={css`
            flex: 1;
            width: 100%;
            textarea {
              width: 100%;
              padding: 0.5rem;
              margin: 0 auto;
              margin-right: 0.5rem;
              resize: vertical;
              max-height: 120px;
            }
          `}
        />
      </fieldset>
    </StyledOuterEditor>
  )
}

export default QuestionEditor
