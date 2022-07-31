import DataFrame from "dataframe-js"

export const dataframe = (matrix: number[][], factors: string[]) => {
  const df = new DataFrame(matrix, factors)
  df.show()
  return df
}
