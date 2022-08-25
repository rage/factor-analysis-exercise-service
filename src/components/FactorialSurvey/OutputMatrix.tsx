import { css } from "@emotion/css"
import styled from "@emotion/styled"
import React, { useState } from "react"

import { FactorialSurvey, Question } from "../../util/stateInterfaces"
import { sanitizeQuestions } from "../../util/utils"

interface Props {
  state: FactorialSurvey
}

const Table = styled.table`
  width: 100%;
  max-width: 700px;
  height: 240px;
  margin: 0 auto;
  display: block;
  overflow-x: auto;
  border-spacing: 0;
`

const Td = styled.td`
  border: 1px solid;
  padding: 5px 10px;
  border-top-width: 0;
  border-left-width: 0;
`

const Tbody = styled.tbody`
  white-space: nowrap;
`

const OutputMatrix: React.FC<React.PropsWithChildren<Props>> = ({ state }) => {
  const sanitizedQuestions = sanitizeQuestions(state.questions) as Question[]

  const [error, setError] = useState<string[]>([])

  return (
    <div>
      <div
        className={css`
          margin-top: 1rem;
          margin-bottom: 1rem;
          ${error && `color: red;`}
        `}
      >
        {error.length > 0 &&
          error.map((e, idx) => {
            if (sanitizedQuestions.find((question) => question.questionLabel === e)) {
              return (
                <p
                  key={idx}
                >{`${e} : Could not match with any factor weights. Check that the spelling is identical`}</p>
              )
            }
          })}
      </div>
      <Table>
        <Tbody>
          <tr>
            <Td>{""}</Td>
            {state.factors.map((f) => {
              return <Td key={f.id}>{f.name}</Td>
            })}
          </tr>
          {sanitizedQuestions.map((question, q_idx) => {
            return (
              <tr key={question.id}>
                <Td
                  className={css`
                    ${error.indexOf(question.questionLabel) > -1 && `color: red;`}
                  `}
                >
                  {q_idx + 1} {sanitizedQuestions[q_idx]?.questionLabel}
                </Td>
                {state.factors.map((factor) => {
                  if (!factor.weights[question.questionLabel]) {
                    if (error.indexOf(question.questionLabel) < 0) {
                      const newError = error
                      newError.push(question.questionLabel)
                      setError(newError)
                    }
                  }
                  return <Td key={factor.id}>{factor.weights[question.questionLabel]}</Td>
                })}
              </tr>
            )
          })}
        </Tbody>
      </Table>
    </div>
  )
}

export default OutputMatrix
