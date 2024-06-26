import { css } from "@emotion/css"
import { useState } from "react"
import { useWindowSize } from "usehooks-ts"

import TextArea from "../../../shared-module/components/InputFields/TextAreaField"
import TextField from "../../../shared-module/components/InputFields/TextField"
import { baseTheme } from "../../../shared-module/styles"
import { LegendKey, SumFactor } from "../../../util/spec-types/privateSpec"
import { LogoSelection } from "../../Factorial/ExerciseEditor/ComponentEditors/LogoSelector"
import { ButtonWrapper, StyledInnerEditor } from "../../StyledComponents/Wrappers"
import { SumFactorReport } from "../ViewSubmission/SumFactorReport"

import FactorCategoryEditor from "./FactorCategoryEditor"

interface Props {
  sumFactor: SumFactor
  onChange: (survey: SumFactor) => void
}
const SumFactorEditor: React.FC<React.PropsWithChildren<Props>> = ({ sumFactor, onChange }) => {
  const [testScore, setTestScore] = useState(0)
  useWindowSize()

  return (
    <div id="sum-factor-editor">
      <fieldset>
        <legend>{"Define the sum-factor"}</legend>
        <TextField
          label="Title text"
          type="text"
          placeholder="Factor title text"
          onChangeByValue={(value) => {
            onChange({ ...sumFactor, title: value })
          }}
          value={sumFactor.title}
          className={css`
            flex: 2;
          `}
        />
        <StyledInnerEditor respondTo>
          <TextField
            label="Default label for user score icon"
            type="text"
            value={sumFactor.userVariable?.label ? sumFactor.userVariable?.label : ""}
            onChangeByValue={(value) => {
              onChange({
                ...sumFactor,
                userVariable: {
                  ...sumFactor.userVariable,
                  label: value,
                },
              })
            }}
            className={css`
              flex: 3;
            `}
          />
          <TextField
            label="Global variable key for user icon"
            type="text"
            value={sumFactor.userVariable?.globalKey ? sumFactor.userVariable.globalKey : ""}
            onChangeByValue={(value) => {
              onChange({
                ...sumFactor,
                userVariable: {
                  ...sumFactor?.userVariable,
                  globalKey: value,
                },
              })
            }}
            className={css`
              flex: 3;
              padding: 0 0.5rem 0 0.5rem;
            `}
          />
          <LogoSelection
            label={"Select icon for user score"}
            chosenLogo={sumFactor?.userVariable?.logo}
            onChange={(value) => {
              onChange({
                ...sumFactor,
                userVariable: {
                  ...sumFactor.userVariable,
                  logo: value,
                },
              })
            }}
          />
        </StyledInnerEditor>
        <ButtonWrapper>
          <button
            onClick={() => {
              const newSumFactor = { ...sumFactor }
              if (typeof newSumFactor.categories === "undefined") {
                newSumFactor.categories = []
              }
              newSumFactor.categories.push({
                from: 0,
                to: 0,
                label: "",
                color: "",
              })
              onChange(newSumFactor)
            }}
            className={css`
              flex: 1;
              width: 100%;
              background-color: ${baseTheme.colors.blue[200]};
            `}
          >
            {"Add Sum-Factor Sub-Category"}
          </button>
        </ButtonWrapper>
        <ol>
          {sumFactor.categories?.map((cat, idx) => {
            return (
              <li key={idx}>
                <fieldset>
                  <FactorCategoryEditor
                    onChange={(newCat) => {
                      const newCats = sumFactor.categories?.map((c, i) => {
                        if (idx != i) {
                          return c
                        }
                        return newCat
                      })
                      onChange({ ...sumFactor, categories: newCats })
                    }}
                    idx={idx}
                    category={cat}
                    onDelete={() => {
                      const newCats = sumFactor.categories
                      newCats?.splice(idx, 1)
                      onChange({ ...sumFactor, categories: newCats })
                    }}
                  />
                </fieldset>
              </li>
            )
          })}
        </ol>
        <TextArea
          label="Description"
          placeholder="Factor description"
          autoResize
          onChangeByValue={(value) => {
            onChange({ ...sumFactor, description: value })
          }}
          value={sumFactor.description}
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
        <fieldset>
          <legend>{"Test it out"}</legend>
          <TextField
            label="Move the score icon"
            placeholder={testScore.toString()}
            type="number"
            onChangeByValue={(score) => setTestScore(+score)}
          />
        </fieldset>
      </fieldset>
      <SumFactorReport
        factor={sumFactor}
        userName={sumFactor.userVariable?.label ?? "Your score"}
        userScore={testScore}
        userVar={sumFactor.userVariable as LegendKey}
        parentWidthPx={document.getElementById("sum-factor-editor")?.clientWidth ?? 0}
      />
    </div>
  )
}

export default SumFactorEditor
