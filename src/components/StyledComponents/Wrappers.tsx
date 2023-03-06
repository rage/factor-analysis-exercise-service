import styled from "@emotion/styled"

import { respondToOrLarger } from "../../shared-module/styles/respond"

export const infoHeaderColor = "rgba(85, 179, 245, 0.05)"
export const infoColor = "#faf6e3"

export const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: 0.5rem;
  margin-right: 0.5;

  font-family: "Raleway";
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 30px;

  color: #1a2333;
`

export const InfoWrapper = styled.div`
  background: ${infoColor};
  width: 100%;
  padding: 15px;
  margin-bottom: 10px;

  font-family: "Raleway";
  font-style: normal;
  font-weight: 500;
  font-size: 20px;

  display: flex;
  align-items: flex-end;
  text-align: left;
  color: #494949;
`

export const InfoHeaderWrapper = styled.div`
  background: ${infoHeaderColor};
  width: 100%;
  padding: 15px;

  font-family: Lato;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 120%;

  display: grid;
  align-items: flex-end;
  text-align: left;
  gap: 1rem;
`

export const Wrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: 0.5rem;
  margin-right: 0.5;
`

export const NewButton = styled.button`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  display: block;
  padding: 0.5rem;
  background-color: white;
  border: 1px solid black;
  transition: all 0.3s;

  &:hover {
    background-color: #f1f1f1;
  }
`

export const ButtonWrapper = styled.div`
  padding: 1rem 0;
`

export const StyledLabelEditor = styled.div`
  margin: 0 auto;
  margin-bottom: 5px;
  width: 100%;
  border: 1px solid grey;
  padding: 0 1rem 0 0;
  display: flex;
  align-items: center;
  justify-content: space-apart;
`

export const DeleteButton = styled.button`
  width: 2rem;
  height: 2rem;
`

export const StyledOuterEditor = styled.div<{ border?: boolean }>`
  margin: 0.5rem auto;
  width: 100%;
  border: ${({ border }) => (border ? "1px solid black" : "none")};
  display: flex;
  align-items: left;
  justify-content: space-apart;
  flex-direction: column;
`

export const StyledInnerEditor = styled.div<{ respondTo?: boolean }>`
  margin: 0 auto;
  padding: 0.5rem 0 0.5rem 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-apart;
  ${({ respondTo }) =>
    respondTo &&
    `flex-direction: column;
  ${respondToOrLarger.sm} {
    flex-direction: row;
  }`}
`

export const Input = styled.input`
  padding: 0.5rem;
  width: 100%;
  margin: 0 auto;
  margin-right: 0.5rem;
`
