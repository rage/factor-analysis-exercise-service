/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"
// eslint-disable-next-line import/order
import { FaDog } from "react-icons/fa"
//import { respondToOrLarger } from "../../shared-module/styles/respond"
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

export const FactorialReport: React.FC<React.PropsWithChildren<CoordinateProps>> = ({ factor }) => {
  console.log(factor.name)

  const species =
    (100 * -(factor.range?.min as number)) /
    ((factor.range?.max as number) - (factor.range?.min as number))
  console.log(species)

  const userScore =
    (100 * (-(factor.range?.min as number) + factor.score)) /
    ((factor.range?.max as number) - (factor.range?.min as number))
  console.log(userScore)

  return (
    <div>
      <ExerciseItemHeader titleText={factor.name} />
      <div
        className={css`
          display: flex;
          height: 37px;
          place-content: left;
          gap: 0.5rem;
          margin-bottom: 3rem;
          label {
            font-family: "Raleway";
            font-style: normal;
            font-weight: 500;
            font-size: 15px;
            line-height: 250%;
            display: flex;
            align-items: flex-end;
          }
          div[id="logo"] {
            margin-right: 1rem;
          }
        `}
      >
        <label>{"Species average"}</label>
        <div
          id="logo"
          className={css`
            height: 37px;
            background-color: #d9d9d9;
            width: 37px;
            border-radius: 37px;
            display: grid;
            place-content: center;
            div {
              height: 14px;
              width: 14px;
              background-color: black;
            }
          `}
        >
          <div
            className={css`
              border-radius: 10px;
            `}
          />
        </div>
        <label>{"DOG NAME"}</label>
        <div
          className={css`
            height: 37px;
            background-color: #d9d9d9;
            width: 37px;
            border-radius: 37px;
            display: grid;
            place-content: center;
            div {
              height: 20px;
              width: 20px;
              background-color: pink;
              border-radius: 10px;
            }
          `}
        >
          <div
            className={css`
              display: grid;
              place-content: center;
            `}
          >
            <FaDog
              className={css`
                height: 100%;
              `}
            />
          </div>
        </div>
      </div>
      <div
        className={css`
          display: flex;
          position: relative;
          height: 50px;
        `}
      >
        <div
          className={css`
            height: 37px;
            background-color: #d9d9d9;
            width: 37px;
            border-radius: 37px;
            position: absolute;
            left: ${`${species}%`};
            transform: translate(-50%, 0);
            display: grid;
            place-content: center;
            div {
              height: 14px;
              width: 14px;
              background-color: black;
            }
          `}
        >
          <div
            className={css`
              border-radius: 10px;
            `}
          />
        </div>
        <div
          className={css`
            height: 37px;
            background-color: #d9d9d9;
            width: 37px;
            border-radius: 37px;
            position: absolute;
            left: ${`${userScore}%`};
            transform: translate(-50%, 0);
            display: grid;
            place-content: center;
            div {
              height: 20px;
              width: 20px;
              background-color: pink;
              border-radius: 10px;
            }
          `}
        >
          <div
            className={css`
              display: grid;
              place-content: center;
            `}
          >
            <FaDog
              className={css`
                height: 100%;
              `}
            />
          </div>
        </div>
      </div>

      <div
        className={css`
          width: 100%;
          display: flex;
          gap: 3px;
          height: 30px;
        `}
      >
        {barColors.map((color, idx) => {
          return (
            <rect
              key={idx}
              className={css`
                height: 15px;
                width: 103px;
                background-color: ${color};
              `}
            />
          )
        })}
      </div>
      <div>
        <p>{factor.description}</p>
      </div>
    </div>
  )
}
