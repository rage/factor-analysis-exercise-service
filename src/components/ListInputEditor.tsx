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
      label={`Input ${topic} as numbered list (1; itemtext..[newline] 2; itemtext..)`}
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
        const lista = data.split("\n").map((e) => {
          const f = e.split(";")
          const indx = f[0].split(' ').join('')
          return (
            [parseInt(indx), f[1]]
          )
        })
        console.log(data)
        console.log(lista, typeof lista)
        onChange(lista)
      }}
    />)
}

export default ListInputEditor