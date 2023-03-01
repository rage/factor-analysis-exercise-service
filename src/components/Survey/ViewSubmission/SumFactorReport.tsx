/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"

import { LegendKey, SumFactor } from "../../../util/spec-types/privateSpec"
import { GetLogo } from "../../Factorial/ViewSubmission/ReportLogos"
import { ExerciseItemHeader } from "../../StyledComponents/ExerciseItemHeader"

interface CoordinateProps {
  factor: SumFactor
  userName: string | null
  userScore: number
  userVar: LegendKey | null
}

export const SumFactorReport: React.FC<React.PropsWithChildren<CoordinateProps>> = ({
  factor,
  userName,
  userScore,
  userVar,
}) => {
  if (!factor.categories) {
    return <></>
  }
  const sortedBars = [...factor.categories].sort((a, b) => a.from - b.from)
  const start = sortedBars[0].from
  const finnish = sortedBars[sortedBars.length - 1].to

  const userLabel: string = userName ?? userVar?.label ?? "Your Score"
  const userPlacement =
    (100 * (-(start as number) + userScore)) / ((finnish as number) - (start as number))
  const labelPlacement =
    userPlacement > 100 - userLabel.length * 1.3
      ? userPlacement - Math.max(userLabel.length, 6) * 1.3
      : userPlacement + 3

  console.log(userPlacement, labelPlacement)
  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        margin-top: 1rem;
      `}
    >
      {factor.title && <ExerciseItemHeader titleText={factor.title} />}
      <div
        className={css`
          display: flex;
          position: relative;
          height: 50px;
          margin-top: 1rem;
        `}
      >
        <GetLogo logo={userVar?.logo ?? "dog"} position={userPlacement} withCarret />
        <label
          className={css`
            display: flex;
            position: absolute;
            left: ${labelPlacement}%;
            font-family: "Raleway";
            font-style: normal;
            font-weight: 500;
            font-size: 15px;
            display: flex;
            align-items: flex-end;
          `}
        >
          {userLabel}
        </label>
      </div>

      <div
        className={css`
          width: 100%;
          display: flex;
          height: 30px;
          margin-bottom: 3rem;
        `}
      >
        {sortedBars.map((car, idx) => {
          const width = (car.to - car.from) / (finnish - start)
          // console.log(width, finnish, start, userPlacement)
          const padding =
            idx === sortedBars.length - 1
              ? 0
              : (100 * (sortedBars[idx + 1].from - car.to)) / (finnish - start)
          return (
            <div
              key={idx}
              className={css`
                height: 50px;
                width: ${width * 100}%;
                background-color: ${car.color};
                place-content: center;
                margin-right: ${padding}%;
              `}
            >
              <div
                className={css`
                  height: 50px;
                  font-family: "Raleway";
                  font-style: normal;
                  font-weight: 500;
                  font-size: 15px;
                  line-height: 100%;
                  display: flex;
                  align-items: center;
                  text-align: center;
                  justify-content: center;
                `}
              >
                {car.label}
              </div>
            </div>
          )
        })}
      </div>
      <div
        className={css`
          font-family: "Raleway";
          font-style: normal;
          font-weight: 500;
          font-size: 15px;
          line-height: 150%;
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        `}
      >
        <p>{factor.description}</p>
      </div>
    </div>
  )
}
