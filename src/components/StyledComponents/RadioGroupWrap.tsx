import styled from "@emotion/styled"

import { baseTheme } from "../../shared-module/styles"

interface DivProps {
  checkedCollor: string
  border?: boolean
}

export const CheckedRadioGroupWrap = styled.div<DivProps>`
  margin-bottom: 2px;
  display: flex;
  border: ${({ border }) => (border ? "2px solid #ebedee" : "none")};
  border-radius: 2px;
  font-family: "Raleway";
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 40px;
  color: #1a2333;
  align-items: left;

  input[type="radio"] {
    appearance: none;
    background-color: #fff;
    margin-right: 10px;
    margin-top: 12px;
    margin-left: 20px;
    font: inherit;
    color: currentColor;
    width: 1.15em;
    height: 1.1em;
    border: 1px solid #c1c1c1;
    border-radius: 1em;
    transform: translateY(-0.075em);
    display: grid;
    place-content: center;
  }

  input[type="radio"]:before {
    content: "";
    width: 0.65em;
    height: 0.65em;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em #fff;
    clip-path: polygon(28% 38%, 41% 53%, 75% 24%, 86% 38%, 40% 78%, 15% 50%);
  }

  input[type="radio"]:checked {
    border-color: ${({ checkedCollor }) => checkedCollor};
    background: ${({ checkedCollor }) => checkedCollor};
  }

  input[type="radio"]:checked::before {
    transform: scale(1);
  }

  span {
    font-family: "Raleway";
    font-weight: 400;
    font-size: 18px;
  }
`

export const RadioGroupWrap = styled.div<DivProps>`
  font-family: "Raleway";
  font-size: 18px;
  font-style: normal;
  margin: 0.5rem 0.5rem 0.5rem 0.3rem;
  line-height: 30px;
  display: flex;
  grid-template-columns: 1em auto;
  justify-content: left;
  gap: 0.5em;

  input[type="radio"] {
    appearance: none;
    background-color: #fff;
    margin: 0;
    font: inherit;
    width: 30px;
    height: 30px;
    border: 1px solid #989ca3;
    border-radius: 50%;
    transform: translateY(-0.075em);
    display: grid;
    place-content: center;
  }

  input[type="radio"]::before {
    content: "";
    width: 18px;
    height: 18px;
    border-radius: 50%;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    background-color: ${baseTheme.colors.green[600]};
  }

  span {
    font-family: "Raleway";
    font-weight: 400;
    font-size: 18px;
  }

  input[type="radio"]:checked::before {
    transform: scale(1);
    background: #1f6964;
  }
`
