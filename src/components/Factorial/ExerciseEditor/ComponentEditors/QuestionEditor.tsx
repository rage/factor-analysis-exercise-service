import { css } from "@emotion/css"

import TextArea from "../../../../shared-module/components/InputFields/TextAreaField"
import { baseTheme, primaryFont } from "../../../../shared-module/styles"
import { Question } from "../../../../util/stateInterfaces"
import {
  insertVariablesToText,
  parseLabelQuestion,
  reverseParseLabelQuestion,
} from "../../../../util/utils"
import MarkdownText from "../../../MarkdownText"
import { StyledInnerEditor, StyledOuterEditor } from "../../../StyledComponents/Wrappers"
import { getBackgroundColor } from "../../../Survey/Editors/SurveyItemEditor"
interface Props {
  item: Question
  onChangeQuestion: (item: Question) => void
}

const QuestionEditor: React.FC<React.PropsWithChildren<Props>> = ({ item, onChangeQuestion }) => {
  return (
    <StyledOuterEditor>
      <fieldset
        className={css`
          background-color: ${getBackgroundColor(item.questionLabel)};
          legend {
            font-family: ${primaryFont};
            font-style: normal;
            font-weight: 500;
            font-size: 18px;
          }
        `}
      >
        <legend>{item.questionLabel}</legend>
        <StyledInnerEditor
          className={css`
            font-family: ${primaryFont};
            color: ${baseTheme.colors.gray[600]};
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            background-color: ${item.questionLabel === "info" ||
            item.questionLabel === "info-header"
              ? "inherit"
              : baseTheme.colors.clear[100]};
          `}
        >
          {item.question && <MarkdownText text={insertVariablesToText(item.question)} />}
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
