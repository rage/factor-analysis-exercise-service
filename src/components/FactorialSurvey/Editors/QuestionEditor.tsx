import { css } from "@emotion/css"

import TextArea from "../../../shared-module/components/InputFields/TextAreaField"
import { Question } from "../../../util/stateInterfaces"
import { parseLabelQuestion, reverseParseLabelQuestion } from "../../../util/utils"
import MarkdownText from "../../MarkdownText"
import { StyledInnerEditor, StyledOuterEditor } from "../../StyledComponents/Wrappers"
interface Props {
  item: Question
  onChangeQuestion: (item: Question) => void
}

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
