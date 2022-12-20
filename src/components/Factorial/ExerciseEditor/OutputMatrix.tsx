import { css } from "@emotion/css"
import styled from "@emotion/styled"
import React, { useEffect, useState } from "react"

import { baseTheme, primaryFont } from "../../../shared-module/styles"
import { FactorialSurvey, Question } from "../../../util/stateInterfaces"
import { sanitizeQuestions } from "../../../util/utils"

interface Props {
  state: FactorialSurvey
}

const Table = styled.table`
  width: 100%;
  max-width: 100%;
  height: 240px;
  margin: 1rem auto;
  display: block;
  overflow-x: auto;
  border-spacing: 0;
`

const Td = styled.td`
  border: 1px solid;
  padding: 5px 10px;
  border-top-width: 0;
  border-left-width: 0;
  font-size: 12px;
  font-family: ${primaryFont};
`

const Tbody = styled.tbody`
  white-space: nowrap;
`

const OutputMatrix: React.FC<React.PropsWithChildren<Props>> = ({ state }) => {
  const sanitizedQuestions = sanitizeQuestions(state.questions) as Question[]

  const [error, setError] = useState<string[]>([])
  useEffect(() => {
    const newError: string[] = []
    setError(newError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <div>
      <div
        className={css`
          margin-top: 1rem;
          margin-bottom: 1rem;
          ${error && `color: red;`}
        `}
      >
        {error.map((e, idx) => {
          return (
            <p
              key={idx}
            >{`${e} : Could not match with any factor weights. Check that the spelling is identical`}</p>
          )
        })}
      </div>
      <Table>
        <thead
          className={css`
            position: sticky;
            top: 0px;
            z-index: 999;
            background-color: ${baseTheme.colors.green[100]};
          `}
        >
          <tr>
            <Td>{""}</Td>
            <Td>{"mean"}</Td>
            <Td>{"scale"}</Td>
            {state.factors.map((f) => {
              return <Td key={f.id}>{f.label}</Td>
            })}
          </tr>
        </thead>
        <Tbody>
          {sanitizedQuestions.map((question, q_idx) => {
            return (
              <tr key={question.id}>
                <Td
                  className={css`
                    ${error.indexOf(question.questionLabel) > -1 && `color: red;`}
                    position: sticky;
                    left: 0px;
                    background-color: ${baseTheme.colors.blue[100]};
                    max-width: 10rem;
                    word-wrap: break-word;
                    white-space: normal;
                  `}
                >
                  {q_idx + 1} {sanitizedQuestions[q_idx].questionLabel}
                </Td>
                <Td
                  className={css`
                    background-color: ${baseTheme.colors.clear[200]};
                  `}
                >
                  {state.meansVector ? state.meansVector.means[question.questionLabel] : "-"}
                </Td>
                <Td
                  className={css`
                    background-color: ${baseTheme.colors.clear[200]};
                  `}
                >
                  {state.meansVector ? state.meansVector.stds[question.questionLabel] : "-"}
                </Td>
                {state.factors.map((factor) => {
                  if (typeof factor.weights[question.questionLabel] === "undefined") {
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
