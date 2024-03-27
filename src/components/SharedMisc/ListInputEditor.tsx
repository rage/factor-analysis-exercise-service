import { css } from "@emotion/css"

import TextArea from "../../shared-module/components/InputFields/TextAreaField"
import { Question } from "../../util/spec-types/privateSpec"
import { parseLabelQuestion, reverseParseLabelQuestion } from "../../util/utils"

interface Props {
  questions: Question[]
  onChange: (parsedList: (string[] | null)[]) => void
  topic: string
  disabled?: boolean
}

//export from excel or .csv?

const ListInputEditor: React.FC<React.PropsWithChildren<Props>> = ({
  questions,
  topic,
  onChange,
  disabled,
}) => {
  return (
    <TextArea
      placeholder={`Input ${topic}s as (semicolon separated) label;question list (${topic}label; ${topic}-text..[newline] ${topic}label; ${topic}-text..)`}
      autoResize
      className={css`
        width: 100%;
        textarea {
          width: 100%;
          resize: vertical;
          max-height: 200px;
        }
      `}
      onChangeByValue={(value) => {
        const data = value ? value : ""
        const parsedList = data.split("\n").map((e) => {
          return parseLabelQuestion(e)
        })
        onChange(parsedList)
      }}
      defaultValue={questions
        .map((quest) => {
          return reverseParseLabelQuestion(quest.questionLabel, quest.question)
        })
        .join("\n")}
      disabled={disabled}
    />
  )
}

export default ListInputEditor
