import { css } from "@emotion/css"
import React from "react"
import Select from "react-select"

import { primaryFont } from "../../../../shared-module/styles"
import { CircleLogo, DogLogo, EmptyLogo, PawLogo } from "../../ViewSubmission/ReportLogos"

interface SelectorProps {
  onChange: (logoLabel: string) => void
  label: string
}

export const LogoSelection: React.FC<React.PropsWithChildren<SelectorProps>> = ({
  onChange,
  label,
}) => {
  const logos = [
    { value: "circle", label: "circle", logo: <CircleLogo /> },
    { value: "paw", label: "paw", logo: <PawLogo /> },
    { value: "dog", label: "dog", logo: <DogLogo /> },
  ]
  const emptyLogo = { value: "empty", label: "empty", logo: <EmptyLogo /> }
  return (
    <div
      className={css`
        margin-bottom: 1.1rem;
        width: 10rem;
      `}
    >
      <label
        htmlFor="logo-selector"
        className={css`
          color: #333;
          font-family: ${primaryFont};
          font-weight: 500;
          font-size: 14px;
          display: block;
          margin-bottom: 2px;
        `}
      >
        {label}
        <Select
          id="logo-selector"
          options={logos}
          defaultValue={emptyLogo}
          onChange={(e) => onChange(e?.label ?? "")}
          formatOptionLabel={(logo) => {
            return <>{logo.logo}</>
          }}
        />
      </label>
    </div>
  )
}
