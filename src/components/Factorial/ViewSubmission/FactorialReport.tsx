/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"

import { respondToOrLarger } from "../../../shared-module/styles/respond"
import { FactorReport } from "../../../util/stateInterfaces"
import { ExerciseItemHeader } from "../../StyledComponents/ExerciseItemHeader"

import { CircleLogo, DogLogo, PawLogo } from "./ReportLogos"

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
          .div-container {
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
        <div className="div-container">
          <PawLogo id={`${factor.label}-paw-logo`} />
          <label>{"Dogs average"}</label>
        </div>
        <div className="div-container">
          <DogLogo id={`${factor.label}-ownpet-logo`} />
          <label>{name ?? "Your Score"}</label>
        </div>
        {breed && (
          <div className="div-container">
            <CircleLogo id={`${factor.label}-circle-logo`} />
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
        <PawLogo position={species} withCarret={true} />
        {breed && factor.breedAvgs && factor.breedAvgs[breed] !== undefined && breedAvg && (
          <CircleLogo position={breedAvg} withCarret />
        )}
        <DogLogo position={userScore} withCarret />
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
