/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import React from "react"

import { LegendKey, SubCategory, SumFactor } from "../../../util/spec-types/privateSpec"
import { getTextWidth } from "../../../util/utils"
import { GetLogo } from "../../Factorial/ViewSubmission/ReportLogos"
import { ExerciseItemHeader } from "../../StyledComponents/ExerciseItemHeader"

interface CoordinateProps {
  factor: SumFactor
  userName: string | null
  userScore: number
  userVar: LegendKey | null
  parentWidthPx: number
}

type Bar = SubCategory & { barWidth: number; padding: number; labelWidth: number }

export const SumFactorReport: React.FC<React.PropsWithChildren<CoordinateProps>> = ({
  factor,
  userName,
  userScore,
  userVar,
  parentWidthPx,
}) => {
  if (!factor.categories) {
    return <></>
  }
  const sortedCategories = [...factor.categories].sort((a, b) => a.from - b.from)
  const start = sortedCategories[0].from
  const finnish = sortedCategories[sortedCategories.length - 1].to
  let labelsFitInBars = true
  const sortedBars: Bar[] = sortedCategories.map((cat, idx) => {
    const width = (100 * (cat.to - cat.from)) / (finnish - start)
    const padding =
      idx === sortedCategories.length - 1
        ? 0
        : (100 * (sortedCategories[idx + 1].from - cat.to)) / (finnish - start)
    const labelWidth = getTextWidth(cat.label, "15px Raleway")
    if (parentWidthPx && width < (100 * labelWidth) / parentWidthPx) {
      labelsFitInBars = false
    }
    return { ...cat, barWidth: width, padding: padding, labelWidth: labelWidth }
  })

  const userLabel: string = userName ?? userVar?.label ?? "Your Score"
  const userPlacement =
    (100 * (-(start as number) + userScore)) / ((finnish as number) - (start as number))
  const userLabelWidth = (100 * getTextWidth(userLabel, "15px Raleway")) / parentWidthPx
  const labelPlacement =
    userPlacement >= 100 - userLabelWidth - 2000 / parentWidthPx
      ? userPlacement - userLabelWidth - 2000 / parentWidthPx
      : userPlacement + 2000 / parentWidthPx

  return (
    <div
      id="sum-factor-report"
      className={css`
        display: flex;
        flex-direction: column;
        margin-top: 1rem;
        margin-bottom: 1rem;
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
          return (
            <div
              key={idx}
              className={css`
                height: 50px;
                width: ${car.barWidth}%;
                background-color: ${car.color};
                place-content: center;
                margin-right: ${car.padding}%;
              `}
            >
              {labelsFitInBars && (
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
              )}
            </div>
          )
        })}
      </div>
      {!labelsFitInBars &&
        sortedBars.map((bar, idx) => {
          return (
            <div
              key={idx}
              className={css`
                display: flex;
                place-content: left;
                text-align: center;
                justify-content: space-apart;
              `}
            >
              <div
                className={css`
                  height: 25px;
                  width: 25px;
                  background-color: ${bar.color};
                `}
              />
              <div
                className={css`
                  display: grid;
                  margin-left: 10px;
                  height: 25px;
                  font-family: "Raleway";
                  font-style: normal;
                  font-weight: 500;
                  font-size: 15px;
                  place-content: center;
                  line-height: 100%;
                `}
              >
                {bar.label}
              </div>
            </div>
          )
        })}
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
            margin-top: ${!labelsFitInBars ? "1.5rem" : "0"};
          `}
        >
          <p>{factor.description}</p>
        </div>
      )}
    </div>
  )
}
