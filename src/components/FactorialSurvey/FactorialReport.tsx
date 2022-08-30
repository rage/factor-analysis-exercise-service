import { css } from "@emotion/css"
//import styled from "@emotion/styled"
import React from "react"

// eslint-disable-next-line import/order
import { respondToOrLarger } from "../../shared-module/styles/respond"

//import { FaDog } from "react-icons/fa"

import { Factor } from "../../util/stateInterfaces"
import { ExerciseItemHeader } from "../StyledComponents/ExerciseItemHeader"

export const barColors = [
  "#DAE6E5",
  "#B4CDCB",
  "#8FB4B2",
  "#6A9B98",
  "#44827E",
  "rgba(31, 105, 100, 0.9)",
  "#065853",
  "#05514C",
  "#02413D",
]

interface CoordinateProps {
  factor: Factor
}

/* const IconBubble = styled.circle<{ percent: number }>`
  fill: #d9d9d9;
  r: 16.5px;
  cy: 50%;
  cx: ${({ percent }) => `${percent}%`};
` */

export const FactorialReport: React.FC<React.PropsWithChildren<CoordinateProps>> = ({ factor }) => {
  const species =
    (100 * -(factor.range?.min as number)) /
    ((factor.range?.max as number) - (factor.range?.min as number))
  console.log(species)
  const userScore =
    (100 * (-(factor.range?.min as number) + factor.score)) /
    ((factor.range?.max as number) - (factor.range?.min as number))
  console.log(userScore)

  return (
    <>
      <ExerciseItemHeader titleText={factor.name} />
      <div
        className={css`
          ${respondToOrLarger.xl}
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="50px" width="100%">
          {/* <IconBubble percent={species} /> */}
          <circle cx={`${species}%`} cy="50%" fill="#d9d9d9" r="16.5px" />
          <circle cx={`${species}%`} cy="50%" r="7px" />
          {/* <IconBubble percent={userScore} /> */}
          <circle cx={`${userScore}%`} cy="50%" fill="#d9d9d9" r="16.5px" />
          <circle cx={`${userScore}%`} cy="50%" r="7px" fill="pink" />
        </svg>
      </div>
      <div
        className={css`
          display: flex;
          gap: 3px;
        `}
      >
        {barColors.map((color, idx) => {
          return (
            <svg height="15px" width="103px" key={idx} xmlns="http://www.w3.org/2000/svg">
              <rect fill={color} height="100" width="100" />
            </svg>
          )
        })}
      </div>
    </>
  )
}
