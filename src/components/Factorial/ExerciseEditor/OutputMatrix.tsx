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
const Th = styled.th`
  border: 1px solid;
  padding: 5px 10px;
  text-align: left;
  border-top-width: 0;
  border-left-width: 0;
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
        <colgroup>
          <col />
          <col span={state.factors.length} className="factors" />
          <col span={2} className="scaling" />
        </colgroup>
        <thead
          className={css`
            position: sticky;
            top: 0px;
            z-index: 999;
            background-color: ${baseTheme.colors.green[100]};
          `}
        >
          <tr>
            <Th id={""}>{""}</Th>
            {state.factors.map((f) => {
              return (
                <Th scope="col" key={f.label} id={f.label}>
                  {f.label}
                </Th>
              )
            })}
            <Th scope="col" id="mean">
              {"mean"}
            </Th>
            <Th scope="col" id="scale">
              {"scale"}
            </Th>
          </tr>
        </thead>
        <Tbody>
          {sanitizedQuestions.map((question, q_idx) => {
            return (
              <tr key={question.id}>
                <Th
                  scope="row"
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
                </Th>
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
                <Td
                  headers="means"
                  className={css`
                    background-color: ${baseTheme.colors.clear[200]};
                  `}
                >
                  {state.meansAndStandardDeviations
                    ? state.meansAndStandardDeviations.means[question.questionLabel]
                    : "-"}
                </Td>
                <Td
                  headers="scale"
                  className={css`
                    background-color: ${baseTheme.colors.clear[200]};
                  `}
                >
                  {state.meansAndStandardDeviations
                    ? state.meansAndStandardDeviations.standardDeviations[question.questionLabel]
                    : "-"}
                </Td>
              </tr>
            )
          })}
        </Tbody>
        <thead>
          <tr>
            <Th
              colSpan={state.factors.length + 1}
              className={css`
                align: center;
                background-color: ${baseTheme.colors.clear[200]};
              `}
            >
              {"Breed Averages"}
            </Th>
          </tr>
        </thead>
        <Tbody>
          {state.factors[0].breedAvgs &&
            Object.keys(state.factors[0].breedAvgs).map((e, idx) => {
              return (
                <tr key={idx}>
                  <Th
                    id={e}
                    scope="row"
                    className={css`
                      position: sticky;
                      left: 0px;
                      background-color: ${baseTheme.colors.crimson[100]};
                      max-width: 10rem;
                      word-wrap: break-word;
                      white-space: normal;
                    `}
                  >
                    {e}
                  </Th>
                  {state.factors.map((f) => {
                    if (f.breedAvgs) {
                      return (
                        <Td headers={f.label} key={f.id}>
                          {f.breedAvgs[e] ?? ""}
                        </Td>
                      )
                    }
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
