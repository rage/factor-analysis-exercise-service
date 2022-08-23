import styled from "@emotion/styled"
import React from "react"

import { FactorialSurvey } from "../../util/stateInterfaces"
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
  const sanitizedQuestions = sanitizeQuestions(state.questions)
  return (
    <div>
      <Table>
        <Tbody>
          <tr>
            <Td>{""}</Td>
            {state.factors.map((f) => {
              return <Td key={f.id}>{f.name}</Td>
            })}
          </tr>
          {state.questions.map((question, q_idx) => {
            return (
              <tr key={question.id}>
                <Td>
                  {q_idx + 1} {sanitizedQuestions[q_idx]?.questionLabel}
                </Td>
                {state.factors.map((factor) => {
                  return <Td key={factor.id}>{factor.weights[question.questionLabel]}</Td>
                })}
                {/* {question.map((weight, idx) => {
                  return <Td key={idx}>{weight}</Td>
                })} */}
              </tr>
            )
          })}
        </Tbody>
      </Table>
    </div>
  )
}

export default OutputMatrix
