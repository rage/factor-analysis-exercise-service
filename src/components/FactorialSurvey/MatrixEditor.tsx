import { css } from "@emotion/css"
import { useState } from "react"
import TextArea from "../../shared-module/components/InputFields/TextAreaField"
import { FactorialSurvey } from "../../util/stateInterfaces"

interface Props {
  item: FactorialSurvey
  onChange: (matrix: number[][]) => void
}

const parseMatrixString = (matrixToParse: string): number[][] => {
  const matrix = matrixToParse.split(' ').join('')
    .split('\n').join('')
    .split("],[")
    .map((s) => {
      return (
        s.split('[').join('')
          .split(']').join('')
          .split(',').map(Number)
      )
    })
  return matrix
}

const MatrixEditor: React.FC<Props> = ({ item, onChange }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  return (
    <TextArea
      label="Factor Matrix JSON"
      autoResize
      className={css`
            width: 100%;
            textarea {
              width: 100%;
              resize: vertical;
            }
          `}
      onChange={(value) => {
        const matrixString = value ? (JSON.parse(value) as string) : ""
        const matrix = parseMatrixString(matrixString)
        const questionLen = matrix.length
        // TODO figure out how to handle matrix check and output errors in TextArea, now it does not work
        if (questionLen !== item.questions?.length) {
          setErrorMsg("question amount and matrix don't match")
        }
        onChange(matrix)
      }}
      errorMessage={errorMsg ? errorMsg : ""}
      required={true}
    />
  )
}

export default MatrixEditor