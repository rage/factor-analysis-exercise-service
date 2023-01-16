import { css } from "@emotion/css"
import styled from "@emotion/styled"
import React from "react"
import { FaCaretDown, FaDog, FaPaw } from "react-icons/fa"

import { baseTheme } from "../../../shared-module/styles"

interface LogoProps {
  id?: string
  backgroundColor?: string
  withCarret?: boolean
  position?: number
}

interface GetLogoProps extends LogoProps {
  logo: string
}

const LogoWrapper = styled.div<LogoProps>`
  height: 37px;
  width: 37px;
  border-radius: 37px;
  display: grid;
  place-content: center;
  ${({ position }) =>
    position
      ? `position: absolute;
  left: ${position}%;
  transform: translate(-50%, 0);`
      : ""}
  .div-logo {
    height: 26px;
    width: 26px;
    background-color: ${({ backgroundColor }) => backgroundColor};
    border-radius: 20px;
    display: grid;
    place-content: center;
    .div-content {
      height: 12px;
      width: 12px;
      background-color: black;
      border-radius: 14px;
    }
  }
`
export const CircleLogo: React.FC<React.PropsWithChildren<LogoProps>> = ({
  id,
  position,
  withCarret,
}) => {
  return (
    <LogoWrapper id={id} backgroundColor={baseTheme.colors.red[200]} position={position}>
      <div className="div-logo">
        <div className="div-content" />
      </div>
      {withCarret && (
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
      )}
    </LogoWrapper>
  )
}

export const DogLogo: React.FC<React.PropsWithChildren<LogoProps>> = ({
  id,
  position,
  withCarret,
}) => {
  return (
    <LogoWrapper id={id} backgroundColor={baseTheme.colors.purple[100]} position={position}>
      <div className="div-logo">
        <FaDog
          className={css`
            height: 100%;
          `}
        />
      </div>
      {withCarret && (
        <div
          className={css`
            display: grid;
            height: 12px;
            place-content: center;
          `}
        >
          <FaCaretDown
            className={css`
              color: ${baseTheme.colors.purple[300]};
              height: 100%;
              margin-top: 5px;
            `}
          />
        </div>
      )}
    </LogoWrapper>
  )
}

export const PawLogo: React.FC<React.PropsWithChildren<LogoProps>> = ({
  id,
  withCarret,
  position,
}) => {
  return (
    <LogoWrapper id={id} backgroundColor={baseTheme.colors.blue[200]} position={position}>
      <div className="div-logo">
        <FaPaw
          className={css`
            height: 100%;
          `}
        />
      </div>
      {withCarret && (
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
      )}
    </LogoWrapper>
  )
}

export const EmptyLogo: React.FC<React.PropsWithChildren<LogoProps>> = ({ id }) => {
  return (
    <LogoWrapper id={id} backgroundColor={baseTheme.colors.primary[100]}>
      <div className="div-logo" />
    </LogoWrapper>
  )
}

export const GetLogo: React.FC<React.PropsWithChildren<GetLogoProps>> = ({ logo, ...props }) => {
  switch (logo) {
    case "circle": {
      return <CircleLogo {...(props as LogoProps)} />
    }
    case "paw": {
      return <PawLogo {...(props as LogoProps)} />
    }
    case "dog": {
      return <DogLogo {...(props as LogoProps)} />
    }
    default: {
      return <EmptyLogo />
    }
  }
}
