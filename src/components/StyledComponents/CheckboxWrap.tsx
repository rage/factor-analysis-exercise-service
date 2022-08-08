import styled from "@emotion/styled"

interface DivProps {
  checkedCollor: string
}

export const CheckboxWrap = styled.div<DivProps>`
  margin-bottom: 1.5px;
  display: flex;
  font-family: "Raleway";
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 36px;
  color: #1a2333;
  align-items: left;

  input[type="checkbox"] {
    appearance: none;
    background-color: #fff;
    margin-right: 10px;
    margin-top: 5px;
    font: inherit;
    color: currentColor;
    width: 30px;
    height: 28px;
    border: 1px solid #989ca3;
    transform: translateY(-0.075em);
    display: grid;
    place-content: center;
  }

  input[type="checkbox"]:before {
    content: "";
    width: 0.65em;
    height: 0.65em;
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
`
