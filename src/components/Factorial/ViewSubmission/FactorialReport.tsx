/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"

import { FactorReport } from "../../../util/spec-types/grading"
import { LegendKey } from "../../../util/spec-types/privateSpec"
import { ExerciseItemHeader } from "../../StyledComponents/ExerciseItemHeader"

import { GetLogo } from "./ReportLogos"

export const barColors = [
  "#DAE6E5",
  "#B4CDCB",
  "#8FB4B2",
  "#6A9B98",
  "#44827E",
  "#1f6964",
  "#065853",
  "#05514C",
  "#02413D",
]

interface CoordinateProps {
  factor: FactorReport
  userName: string | null
  userCompVar: string | null
  comparingVar: LegendKey | null
  userVar: LegendKey | null
  zeroVar: LegendKey | null
}

export const FactorialReport: React.FC<React.PropsWithChildren<CoordinateProps>> = ({
  factor,
  userName,
  userCompVar,
  comparingVar,
  userVar,
  zeroVar,
}) => {
  const species =
    (100 * (-(factor.range?.min as number) + (factor.mainComparingVar ?? 0))) /
    ((factor.range?.max as number) - (factor.range?.min as number))

  const userScore =
    (100 * (-(factor.range?.min as number) + factor.score)) /
    ((factor.range?.max as number) - (factor.range?.min as number))

  let comparingVarAvg = null
  if (
    factor.comparingVariable &&
    userCompVar &&
    comparingVar?.globalKey &&
    factor.comparingVariable[comparingVar.globalKey] &&
    !isNaN(factor.comparingVariable[comparingVar.globalKey][userCompVar])
  ) {
    comparingVarAvg =
      (100 *
        (-(factor.range?.min as number) +
          factor.comparingVariable[comparingVar.globalKey][userCompVar])) /
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
          height: 100%;
          width: 100%;
          margin-bottom: 1.5rem;
          .div-container {
            display: flex;
            text-align: center;
            justify-content: space-apart;
            label {
              display: grid;
              font-family: "Raleway";
              font-style: normal;
              font-weight: 500;
              font-size: 15px;
              place-content: center;
            }
          }
        `}
      >
        <div className="div-container">
          <GetLogo logo={userVar?.logo ?? "dog"} id={`${factor.label}-ownpet-logo`} />
          <label>{userName ?? userVar?.label ?? "Your Score"}</label>
        </div>
        <div className="div-container">
          <GetLogo logo={zeroVar?.logo ?? "paw"} id={`${factor.label}-zero-logo`} />
          <label>{zeroVar?.label ?? "Dogs average"}</label>
        </div>
        {userCompVar && comparingVarAvg && (
          <div className="div-container">
            <GetLogo logo={comparingVar?.logo ?? "circle"} id={`${factor.label}-compareTo-logo`} />
            <label>{`${userCompVar}`}</label>
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
        <GetLogo logo={zeroVar?.logo ?? "paw"} position={species} withCarret={true} />
        {userCompVar && factor.comparingVariable && comparingVar?.globalKey && comparingVarAvg && (
          <GetLogo logo={comparingVar.logo ?? "circle"} position={comparingVarAvg} withCarret />
        )}
        <GetLogo logo={userVar?.logo ?? "dog"} position={userScore} withCarret />
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
            <div
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
      {factor.description && (
        <div
          className={css`
            font-family: "Raleway";
            font-style: normal;
            font-weight: 500;
            font-size: 15px;
            line-height: 150%;
            display: flex;
            align-items: center;
          `}
        >
          <p>{factor.description}</p>
        </div>
      )}
    </div>
  )
}
