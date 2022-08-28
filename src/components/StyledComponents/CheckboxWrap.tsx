import styled from "@emotion/styled"

import { baseTheme } from "../../shared-module/styles"

interface DivProps {
  checkedCollor: string
  info?: boolean
  disabled?: boolean
}

export const CheckboxWrap = styled.div<DivProps>`
  display: grid;
  align-items: left;
  justify-content: left;
  gap: 0.5em;
  grid-template-columns: ${({ info }) => (info ? "1.5em auto" : "2em auto")};
  background-color: ${({ disabled }) => (disabled ? baseTheme.colors.grey[100] : "inherit")};

  input[type="checkbox"] {
    appearance: none;
    background-color: #fff;
    font: inherit;
    color: currentColor;
    width: ${({ info }) => (info ? "17px" : "30px")};
    height: ${({ info }) => (info ? "17px" : "28px")};
    border: 1px solid #989ca3;
    transform: translateY(-0.075em);
    display: grid;
    place-content: center;
  }

  input[type="checkbox"]:before {
    content: "";
    width: 12px;
    height: 12px;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em #fff;
    clip-path: polygon(28% 38%, 41% 53%, 75% 24%, 86% 38%, 40% 78%, 15% 50%);
  }

  input[type="checkbox"]:checked {
    border-color: ${({ checkedCollor }) => checkedCollor};
    background: ${({ checkedCollor }) => checkedCollor};
  }

  input[type="checkbox"]:checked::before {
    transform: scale(1);
  }

  label {
    font: inherit;
    margin-left: 20 px;
    line-height: 17px:
    color: #1a2333;
  }
`
