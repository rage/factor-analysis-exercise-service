/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable i18next/no-literal-string */

const nextJest = require("next/jest")

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: "./" })

// Any custom config you want to pass to Jest
const customJestConfig = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["<rootDir>/system-tests/"],
}

// next/jest only lets custom config append to transformIgnorePatterns, and its built-in
// "/node_modules/" pattern would skip the ESM-only @moocfi packages.
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)()
  config.transformIgnorePatterns = config.transformIgnorePatterns.map((pattern) =>
    pattern === "/node_modules/" ? "/node_modules/(?!@moocfi/)" : pattern,
  )
  return config
}
