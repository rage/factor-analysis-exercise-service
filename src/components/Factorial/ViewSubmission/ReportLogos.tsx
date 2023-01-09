import { css } from "@emotion/css"
import styled from "@emotion/styled"
import React from "react"
import { FaCaretDown, FaDog, FaPaw } from "react-icons/fa"

interface LogoProps {
  id?: string
  backgroundColor: string
  withCarret?: boolean
  position?: number
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
  div[id="logo"] {
    height: 26px;
    width: 26px;
    background-color: ${({ backgroundColor }) => backgroundColor};
    border-radius: 20px;
    display: grid;
    place-content: center;
    div[id="content"] {
      height: 12px;
      width: 12px;
      background-color: black;
      border-radius: 14px;
    }
  }
`
export const CircleLogo: React.FC<React.PropsWithChildren<LogoProps>> = ({
  id,
  backgroundColor,
  position,
  withCarret,
}) => {
  return (
    <LogoWrapper id={id} backgroundColor={backgroundColor} position={position}>
      <div id="logo">
        <div id="content" />
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
              color: ${backgroundColor};
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
  backgroundColor,
  position,
  withCarret,
}) => {
  return (
    <LogoWrapper id={id} backgroundColor={backgroundColor} position={position}>
      <div id="logo">
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
              color: ${backgroundColor};
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
  backgroundColor,
  withCarret,
  position,
}) => {
  return (
    <LogoWrapper id={id} backgroundColor={backgroundColor} position={position}>
      <div id="logo">
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
              color: ${backgroundColor};
              height: 100%;
              margin-top: -1px;
            `}
          />
        </div>
      )}
    </LogoWrapper>
  )
}
