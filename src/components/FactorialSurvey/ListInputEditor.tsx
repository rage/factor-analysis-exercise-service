import { css } from "@emotion/css";
import TextArea from "../../shared-module/components/InputFields/TextAreaField";
import { FactorialSurvey } from "../../util/stateInterfaces";
import { parseLabelQuestion } from "../../util/utils";

interface Props {
  item: FactorialSurvey
  onChange: (parsedList: (string[] | null)[]) => void
  topic: string
}

//export from excel or .csv?

const ListInputEditor: React.FC<Props> = ({ topic, onChange }) => {
  return (
    <TextArea
      label={`Input ${topic}s as (semicolon separated) label;question list (${topic}label; ${topic}-text..[newline] ${topic}label; ${topic}-text..)`}
      autoResize
      className={css`
            width: 100%;
            textarea {
              width: 100%;
              resize: vertical;
            }
          `}
      onChange={(value) => {
        const data = value ? value : ""
        const parsedList = data.split("\n").map((e) => {
          return (
            parseLabelQuestion(e)
          )
        })
        onChange(parsedList)
      }}
    />)
}

export default ListInputEditor