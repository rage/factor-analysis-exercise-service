/* eslint-disable i18next/no-literal-string */
import { css } from "@emotion/css"
import _ from "lodash"
import Papa, { parse, ParseResult } from "papaparse"
import { useState } from "react"
import { v4 } from "uuid"

import { Factor } from "../util/stateInterfaces"

interface Props {
  id: string
  setFactors: (factors: Map<string, Factor>) => void
}

const allowedExtensions = ["csv"]

const CsvReader: React.FC<React.PropsWithChildren<Props>> = ({ setFactors }) => {
  const [data, setData] = useState<Record<string, unknown>[]>()
  const [error, setError] = useState("")
  const [headers, setHeaders] = useState<string[]>([])

  const parseFileData = () => {
    const factors: Map<string, Factor> = new Map()
    headers.map((header) => {
      const factor: Factor = { id: v4(), label: header, name: "", weights: {} }
      factors.set(header, factor)
    })
    data?.map((row: Record<string, unknown>) => {
      factors.forEach((value, key) => {
        value.weights[Object.values(row)[0] as string] = row[key] as number
      })
    })
    console.log(factors)
    setFactors(factors)
  }

  return (
    <div
      className={css`
        display: grid;
        margin-bottom: 10px;
      `}
    >
      <label
        htmlFor="csvInput"
        className={css`
          display: block;
        `}
      >
        Enter Factor weights CSV File
      </label>
      <input
        id="csvInput"
        name="file"
        type="File"
        accept="csv"
        onChange={(e) => {
          setError("")
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
              delimiter: "", // auto-detect
              newline: "", // auto-detect
              quoteChar: "",
              escapeChar: "",
              header: true,
              transformHeader: (header) => {
                if (header.length) {
                  const newHeaders = headers
                  newHeaders.push(header)
                  setHeaders(newHeaders)
                }
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
              transform: undefined,
              delimitersToGuess: [",", "\t", "|", ";", " ", Papa.RECORD_SEP, Papa.UNIT_SEP],
            })
          }
        }}
      />
      <div
        className={css`
          margintop: "3rem";
          ${error && `color: red;`}
        `}
      >
        {error ? error : `Detected ${headers.length} valid header items with ${data?.length} rows`}
      </div>
      {data && !error && <button onClick={parseFileData}>set factor weights</button>}
    </div>
  )
}

export default CsvReader
