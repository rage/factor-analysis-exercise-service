import { css } from "@emotion/css"

import TextArea from "../../../../shared-module/components/InputFields/TextAreaField"
import TextField from "../../../../shared-module/components/InputFields/TextField"
import { Factor } from "../../../../util/spec-types/privateSpec"
import { StyledInnerEditor, StyledOuterEditor } from "../../../StyledComponents/Wrappers"

interface Props {
  factor: Factor
  onChangeFactor: (factor: Factor) => void
}

const FactorEditor: React.FC<React.PropsWithChildren<Props>> = ({ factor, onChangeFactor }) => {
  return (
    <StyledOuterEditor>
      <fieldset>
        <legend>{factor.label}</legend>
        <StyledInnerEditor>
          <TextField
            label="Name"
            type="text"
            placeholder="Factor name"
            onChangeByValue={(value) => {
              onChangeFactor({ ...factor, name: value })
            }}
            value={factor.name}
            className={css`
              flex: 2;
            `}
          />

          <TextField
            label="min"
            type="number"
            placeholder="ranging from"
            value={factor.range?.min ? (factor.range?.min as unknown as string) : "0"}
            onChangeByValue={(value) => {
              onChangeFactor({
                ...factor,
                range: { max: factor.range?.max ?? 0, min: parseFloat(value) },
              })
            }}
            className={css`
              flex: 1;
              padding: 0 0.2rem 0 1rem;
            `}
          />
          <TextField
            label="max"
            type="number"
            placeholder="ranging to"
            value={factor.range?.max ? (factor.range?.max as unknown as string) : "0"}
            onChangeByValue={(value) => {
              onChangeFactor({
                ...factor,
                range: { min: factor.range?.min ?? 0, max: parseFloat(value) },
              })
            }}
            className={css`
              flex: 1;
              padding: 0 0.4rem 0 0rem;
            `}
          />
          <TextField
            label="factor average"
            type="number"
            placeholder="mean"
            value={factor.mainComparingVar ? (factor.mainComparingVar as unknown as string) : "0"}
            onChangeByValue={(value) => {
              onChangeFactor({
                ...factor,
                mainComparingVar: parseFloat(value) ?? 0,
              })
            }}
            className={css`
              flex: 1;
            `}
          />
        </StyledInnerEditor>
        <TextArea
          label="Description"
          placeholder="Factor description"
          autoResize
          onChangeByValue={(value) => {
            onChangeFactor({ ...factor, description: value })
          }}
          value={factor.description}
          className={css`
            flex: 2;
            textarea {
              width: 100%;
              padding: 0.5rem;
              margin: 0 auto;
              margin-right: 0.5rem;
              resize: vertical;
              max-height: 120px;
            }
          `}
        />
      </fieldset>
    </StyledOuterEditor>
  )
}

export default FactorEditor
