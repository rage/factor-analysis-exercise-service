import { css } from "@emotion/css"

import TextArea from "../../../shared-module/components/InputFields/TextAreaField"
import { Factor } from "../../../util/stateInterfaces"
import { StyledInnerEditor, StyledOuterEditor } from "../../StyledComponents/Wrappers"

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
          <TextArea
            label="Name"
            placeholder="Factor name"
            autoResize
            onChange={(value) => {
              onChangeFactor({ ...factor, name: value })
            }}
            value={factor.name}
            className={css`
              flex: 1;
              textarea {
                width: 100%;
                padding: 0.5rem;
                margin: 0 auto;
                margin-right: 0.5rem;
                resize: vertical;
                max-height: 100px;
              }
            `}
          />
          <TextArea
            label="Description"
            placeholder="Factor description"
            autoResize
            onChange={(value) => {
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
        </StyledInnerEditor>
      </fieldset>
    </StyledOuterEditor>
  )
}

export default FactorEditor
