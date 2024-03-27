import { css } from "@emotion/css"

import CheckBox from "../../../../shared-module/components/InputFields/CheckBox"
import TextArea from "../../../../shared-module/components/InputFields/TextAreaField"
import { baseTheme, primaryFont } from "../../../../shared-module/styles"
import { Question } from "../../../../util/spec-types/privateSpec"
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
          label={`Markdown Editor (special purpose labels: "info")`}
          placeholder="question_label; question text"
          autoResize
          onChangeByValue={(value) => {
            const parsedValue = parseLabelQuestion(value)
            if (!parsedValue) {
              return
            }
            const newItem = { ...item, questionLabel: parsedValue[0], question: parsedValue[1] }
            if (newItem.questionLabel === "info") {
              delete newItem.mandatory
            }
            onChangeQuestion(newItem)
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
        {item.questionLabel !== "info" && (
          <CheckBox
            label="Mandatory"
            onChangeByValue={(checked) => {
              const mandatory = checked
              onChangeQuestion({ ...item, mandatory: mandatory ?? false })
            }}
            checked={item.mandatory ?? false}
          />
        )}
      </fieldset>
    </StyledOuterEditor>
  )
}

export default QuestionEditor
