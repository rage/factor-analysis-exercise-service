/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import Papa, { parse, ParseResult } from "papaparse"
import { useState } from "react"

interface Props {
  id: string
}

const allowedExtensions = ["csv"]

const CsvReader: React.FC<React.PropsWithChildren<Props>> = () => {
  const [_data, setData] = useState<ParseResult<unknown>>()
  const [error, setError] = useState("")

  return (
    <div>
      <label
        htmlFor="csvInput"
        className={css`
          display: block;
        `}
      >
        Enter CSV File
      </label>
      <input
        id="csvInput"
        name="file"
        type="File"
        accept="csv"
        onChange={(e) => {
          setError("")
          if (e?.target?.files?.length) {
            console.log("entered the function")

            const inputFile = e.target.files[0]

            const fileExtension = inputFile?.type.split("/")[1]
            if (!allowedExtensions.includes(fileExtension)) {
              setError("Please input a csv file")
              return
            }
            // @ts-ignore: this is needed because inputFile throws a No overload matches this call that doesn't get fixed
            parse(inputFile, {
              delimiter: "", // auto-detect
              newline: "", // auto-detect
              quoteChar: "",
              escapeChar: "",
              header: true,
              transformHeader: undefined,
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
                setData(results)
              },
              error: function (error) {
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
              transform: undefined,
              delimitersToGuess: [",", "\t", "|", ";", " ", Papa.RECORD_SEP, Papa.UNIT_SEP],
            })
          }
        }}
      />
      <div
        className={css`
          margintop: "3rem";
        `}
      >
        {error ?? error}
      </div>
    </div>
  )
}

export default CsvReader
