/* eslint-disable @typescript-eslint/no-var-requires */
const functions = require("firebase-functions")
const { default: next } = require("next")

const isDev = process.env.NODE_ENV !== "production"

const server = next({
  dev: isDev,
  //location of .next generated after running -> npm run build
  conf: { distDir: ".next" },
})

const nextjsHandle = server.getRequestHandler()
exports.nextServer = functions.region("europe-west3").https.onRequest((req, res) => {
  return server.prepare().then(() => nextjsHandle(req, res))
})
