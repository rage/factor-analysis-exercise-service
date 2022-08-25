import styled from "@emotion/styled"

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
  background: #faf6e3;
  width: 100%;
  padding: 15px;

  font-family: "Raleway";
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 100%;

  /* or 17px */
  display: flex;
  align-items: flex-end;
  text-align: left;

  color: #494949;
`

export const InfoHeaderWrapper = styled.div`
  background: rgba(85, 179, 245, 0.05);
  width: 100%;
  padding: 15px;

  font-family: Lato;
  font-style: normal;
  font-weight: 500;
  font-size: 17px;
  line-height: 120%;

  /* or 17px */
  display: grid;
  align-items: flex-end;
  text-align: left;

  color: black;
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
  margin-bottom: 1rem;
  width: 100%;
  border: 1px solid black;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-apart;
`

export const DeleteButton = styled.button`
  width: 2rem;
  height: 2rem;
`

export const StyledOuterEditor = styled.div<{ border?: boolean }>`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  border: ${({ border }) => (border ? "1px solid black" : "none")};
  padding: 1rem;
  display: flex;
  align-items: left;
  justify-content: space-apart;
  flex-direction: column;
`

export const StyledInnerEditor = styled.div`
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-apart;
`

export const Input = styled.input`
  padding: 0.5rem;
  width: 100%;
  margin: 0 auto;
  margin-right: 0.5rem;
`
