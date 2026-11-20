/* eslint-disable @typescript-eslint/no-var-requires */
// Runs a TypeScript script without type checking: `node scripts/run-ts.js <script.ts> [args...]`.
const fs = require("fs")
const path = require("path")
const ts = require("typescript")

require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  })
  module._compile(outputText, filename)
}

const [script, ...args] = process.argv.slice(2)
process.argv = [process.argv[0], script, ...args]
require(path.resolve(script))
