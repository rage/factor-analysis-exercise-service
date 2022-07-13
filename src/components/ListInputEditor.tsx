import { css } from "@emotion/css";
import TextArea from "../shared-module/components/InputFields/TextAreaField";
import { FactorialSurvey } from "../util/stateInterfaces";

interface Props {
  item: FactorialSurvey
  onChange: (parsedList: (string | number)[][]) => void
  topic: string
}

const ListInputEditor: React.FC<Props> = ({ topic, onChange }) => {
  return (
    <TextArea
      label={`Input ${topic}s as (semicolon) numbered list (1; ${topic}-text..[newline] 2; ${topic}-text..)`}
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
          const tmp = e.split(";")
          const indx = tmp[0].split(' ').join('')
          return (
            [parseInt(indx), tmp[1]]
          )
        })
        onChange(parsedList)
      }}
    />)
}

export default ListInputEditor