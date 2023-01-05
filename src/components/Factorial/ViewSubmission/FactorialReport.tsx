/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"
// eslint-disable-next-line import/order
import { FaCaretDown, FaDog, FaPaw } from "react-icons/fa"
import { baseTheme } from "../../../shared-module/styles"
import { respondToOrLarger } from "../../../shared-module/styles/respond"
//import { respondToOrLarger } from "../../shared-module/styles/respond"
import { FactorReport } from "../../../util/stateInterfaces"
import { ExerciseItemHeader } from "../../StyledComponents/ExerciseItemHeader"

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
  factor: FactorReport
  name: string | null
  breed: string | null
}

export const FactorialReport: React.FC<React.PropsWithChildren<CoordinateProps>> = ({
  factor,
  name,
  breed,
}) => {
  const species =
    (100 * -(factor.range?.min as number)) /
    ((factor.range?.max as number) - (factor.range?.min as number))

  const userScore =
    (100 * (-(factor.range?.min as number) + factor.score)) /
    ((factor.range?.max as number) - (factor.range?.min as number))

  let breedAvg = null //species + Math.random() * 4
  if (factor.breedAvgs && breed && factor.breedAvgs[breed] !== undefined) {
    breedAvg =
      (100 * (-(factor.range?.min as number) + factor.breedAvgs[breed])) /
      ((factor.range?.max as number) - (factor.range?.min as number))
  }

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <ExerciseItemHeader titleText={factor.name} />
      <div
        className={css`
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          ${respondToOrLarger.sm} {
            flex-direction: row;
          }
          height: 100%;
          width: 100%;
          place-content: left;
          gap: 0.5rem;
          margin-bottom: 3rem;
          div[id="container"] {
            display: flex;
            flex-direction: column;
            ${respondToOrLarger.sm} {
              flex-direction: row;
            }
            label {
              font-family: "Raleway";
              font-style: normal;
              font-weight: 500;
              font-size: 15px;
              line-height: 250%;
              display: flex;
              align-items: flex-end;
            }
          }
        `}
      >
        <div id="container">
          <div
            id={`${factor.label}-species-logo`}
            className={css`
              height: 37px;
              width: 37px;
              border-radius: 37px;
              display: grid;
              place-content: center;
              div {
                height: 26px;
                width: 26px;
                background-color: ${baseTheme.colors.blue[200]};
                border-radius: 20px;
                display: grid;
                place-content: center;
              }
            `}
          >
            <div>
              <FaPaw
                className={css`
                  height: 100%;
                `}
              />
            </div>
          </div>
          <label>{"Dogs average"}</label>
        </div>
        <div id="container">
          <div
            id={`${factor.label}-ownpet-logo`}
            className={css`
              height: 37px;
              width: 37px;
              border-radius: 37px;
              display: grid;
              place-content: center;
              div {
                height: 26px;
                width: 26px;
                background-color: ${baseTheme.colors.purple[100]};
                border-radius: 20px;
                display: grid;
                place-content: center;
              }
            `}
          >
            <div>
              <FaDog
                className={css`
                  height: 100%;
                `}
              />
            </div>
          </div>
          <label>{name ?? "Your Score"}</label>
        </div>
        {breed && (
          <div id="container">
            <div
              id={`${factor.label}-breed-logo`}
              className={css`
                height: 37px;
                width: 37px;
                border-radius: 37px;
                display: grid;
                place-content: center;
                div {
                  height: 26px;
                  width: 26px;
                  background-color: ${baseTheme.colors.red[200]};
                  border-radius: 20px;
                  display: grid;
                  place-content: center;
                  div {
                    height: 14px;
                    width: 14px;
                    background-color: black;
                    border-radius: 14px;
                  }
                }
              `}
            >
              <div>
                <div />
              </div>
            </div>
            <label>{`${breed} average`}</label>
          </div>
        )}
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
            position: absolute;
            left: ${`${species}%`};
            transform: translate(-50%, 0);
            display: grid;
            place-content: center;
          `}
        >
          <div
            className={css`
              height: 28px;
              width: 28px;
              background-color: ${baseTheme.colors.blue[200]};
              border-radius: 30px;
              display: grid;
              place-content: center;
            `}
          >
            <FaPaw
              className={css`
                height: 100%;
              `}
            />
          </div>
          <div
            className={css`
              display: grid;
              height: 12px;
              place-content: center;
            `}
          >
            <FaCaretDown
              className={css`
                color: ${baseTheme.colors.blue[400]};
                height: 100%;
                margin-top: -1px;
              `}
            />
          </div>
        </div>
        {breed && factor.breedAvgs && factor.breedAvgs[breed] !== undefined && (
          <div
            className={css`
              position: absolute;
              left: ${`${breedAvg}%`};
              transform: translate(-50%, 0);
              display: grid;
              place-content: center;
            `}
          >
            <div
              className={css`
                height: 28px;
                width: 28px;
                background-color: ${baseTheme.colors.red[200]};
                border-radius: 30px;
                display: grid;
                place-content: center;
              `}
            >
              <div
                className={css`
                  height: 14px;
                  width: 14px;
                  background-color: black;
                  border-radius: 14px;
                `}
              />
            </div>
            <div
              className={css`
                display: grid;
                height: 12px;
                place-content: center;
              `}
            >
              <FaCaretDown
                className={css`
                  color: ${baseTheme.colors.red[400]};
                  height: 100%;
                  margin-top: 11px;
                `}
              />
            </div>
          </div>
        )}
        <div
          className={css`
            position: absolute;
            left: ${`${userScore}%`};
            transform: translate(-50%, 0);
            display: grid;
          `}
        >
          <div
            className={css`
              display: grid;
              place-content: center;
              background-color: ${baseTheme.colors.purple[100]};
              height: 28px;
              width: 28px;
              border-radius: 30px;
            `}
          >
            <FaDog
              className={css`
                height: 100%;
              `}
            />
          </div>
          <div
            className={css`
              display: grid;
              height: 12px;
              place-content: center;
            `}
          >
            <FaCaretDown
              className={css`
                color: ${baseTheme.colors.purple[400]};
                height: 100%;
                margin-top: 5px;
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
