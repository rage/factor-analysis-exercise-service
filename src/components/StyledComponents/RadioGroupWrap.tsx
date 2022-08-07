import styled from "@emotion/styled"

interface DivProps {
  checkedCollor: string
}

export const RadioGroupWrap = styled.div<DivProps>`
  margin-bottom: 2px;
  display: flex;
  border: 2px solid #ebedee;
  border-radius: 2px;
  font-family: "Raleway";
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 60px;
  color: #1a2333;
  align-items: left;

  input[type="radio"] {
    appearance: none;
    background-color: #fff;
    margin-right: 10px;
    margin-top: 20px;
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
`
