/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import styled from "@emotion/styled"
import _ from "lodash"
import { parse, ParseResult } from "papaparse"
import { useState } from "react"

import { baseTheme } from "../../shared-module/styles"
import { CheckboxWrap } from "../StyledComponents/CheckboxWrap"
import { StyledInnerEditor } from "../StyledComponents/Wrappers"

interface Props {
  parseUsingHeaders: (data: StructToReturn) => void
  title: string
  parseNoHeaders: (data: []) => void
  disableHeaderOption?: boolean
  applyMsg: string
  checked?: boolean
  id: string
}

interface StructToReturn {
  [key: string]: { [key: string]: unknown }
}

const checkboxLabel = "parse by header"

const allowedExtensions = ["csv"]

const CuteButton = styled.button`
  background-color: ${baseTheme.colors.green[200]};
  &:hover {
    background-color: ${baseTheme.colors.green[100]};
  }
`
/**
 *
 * @param param0
 * @returns
 */
const CsvReader: React.FC<React.PropsWithChildren<Props>> = ({
  parseUsingHeaders,
  title,
  parseNoHeaders,
  disableHeaderOption,
  applyMsg,
  checked,
  id,
}) => {
  const [data, setData] = useState<Record<string, unknown>[]>()
  const [error, setError] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [applyHeaders, setApplyHeaders] = useState<boolean>(checked !== undefined ? checked : true)
  const [columnIdentifier, setColumnIdentifier] = useState("")

  const checkedCollor = disableHeaderOption ? "grey" : "rgb(55, 188, 155)"
  const parseByHeaders = () => {
    const structToReturn: StructToReturn = {}
    headers.map((header) => {
      if (header === columnIdentifier) {
        return
      }
      structToReturn[header] = {}
    })
    data?.map((row: Record<string, unknown>, idx) => {
      headers.forEach((header) => {
        if (header === columnIdentifier) {
          return
        }
        structToReturn[header][(row[columnIdentifier] as string) ?? idx] = row[header]
      })
    })
    parseUsingHeaders(structToReturn)
  }

  /**
   * Default parse without headers, returns each row of the csv file as an array
   */
  const defaultParse = () => {
    if (data) {
      parseNoHeaders(data as [])
    }
  }

  return (
    <div
      className={css`
        display: grid;
        margin-bottom: 10px;
        gap: 0.5em;
      `}
    >
      <StyledInnerEditor>
        <label
          htmlFor={id}
          className={css`
            display: flex;
            width: 79%;
            font-size: 18px;
          `}
        >
          {title}
        </label>
        {!disableHeaderOption ||
          (disableHeaderOption && applyHeaders && (
            <CheckboxWrap checkedCollor={checkedCollor} info disabled={disableHeaderOption}>
              <input
                type="checkbox"
                name="apply headers"
                checked={applyHeaders}
                onChange={(e) => {
                  setApplyHeaders(e.target.checked)
                }}
                disabled={disableHeaderOption}
              />
              <label
                className={css`
                  color: ${disableHeaderOption ? baseTheme.colors.gray[400] : "inherit"};
                `}
              >
                {checkboxLabel}
              </label>
            </CheckboxWrap>
          ))}
      </StyledInnerEditor>
      <input
        id={id}
        name="file"
        type="File"
        accept="csv"
        onChange={(e) => {
          setError("")
          setColumnIdentifier("")
          if (e?.target?.files?.length) {
            headers.length = 0
            const inputFile = e.target.files[0]

            const fileExtension = inputFile?.type.split("/")[1]
            if (!allowedExtensions.includes(fileExtension)) {
              setError("Please input a csv file")
              return
            }
            // @ts-ignore: this is needed because inputFile throws a No overload matches this call that doesn't get fixed
            parse(inputFile, {
              delimiter: ",",
              newline: "", // auto-detect
              quoteChar: '"',
              escapeChar: '"',
              header: applyHeaders,
              transformHeader: (header) => {
                const newHeaders = headers
                newHeaders.push(header)
                setHeaders(newHeaders)
                return header
              },
              dynamicTyping: true,
              preview: 0,
              encoding: "",
              worker: false,
              comments: false,
              step: undefined,
              complete: function (results: ParseResult<Record<string, unknown>>) {
                console.log("Parsing complete:", results)
                if (results.errors[0]) {
                  setError(results.errors[0].type + results.errors[0].message)
                }
                setData(results.data)
              },
              error: (error) => {
                console.log(error.message)
                setError(error.message)
              },
              download: false,
              downloadRequestHeaders: undefined,
              downloadRequestBody: undefined,
              skipEmptyLines: true,
              chunk: undefined,
              chunkSize: undefined,
              fastMode: undefined,
              beforeFirstChunk: undefined,
              withCredentials: undefined,
              transform: (value) => {
                return value.trim()
              },
              delimitersToGuess: [",", ";"],
            })
          }
        }}
      />
      {data && (
        <div
          className={css`
            margintop: "3rem";
            ${error && `color: red;`}
          `}
        >
          {error
            ? error
            : applyHeaders
            ? `Detected ${headers.length} valid header items with ${data?.length} rows`
            : `Detected ${data?.length} rows`}
        </div>
      )}
      {data && !error && applyHeaders && (
        <>
          <select
            onChange={(event) => {
              setColumnIdentifier(event.target.value)
            }}
          >
            <option>--select key column--</option>
            {headers.map((h, idx) => {
              return (
                <option value={h} key={idx}>
                  Col nr {idx + 1}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {h}
                </option>
              )
            })}
          </select>
          {data && !error && (
            <CuteButton
              onClick={parseByHeaders}
              className={css`
                background-color: ${baseTheme.colors.green[200]};
              `}
            >
              {applyMsg}
            </CuteButton>
          )}
        </>
      )}
      {!error && !applyHeaders && (
        <button
          onClick={defaultParse}
          className={css`
            background-color: ${baseTheme.colors.green[200]};
          `}
        >
          {applyMsg}
        </button>
      )}
    </div>
  )
}

export default CsvReader
