/* eslint-disable i18next/no-literal-string */
import { Head, Html, Main, NextScript } from "next/document"
import React from "react"

import { buildLoadFailureRecoveryScript } from "../util/reloadGuard"
import { STATIC_LOADING_INDICATOR_ID } from "../util/staticLoadingIndicator"

const loadFailureRecoveryScript = buildLoadFailureRecoveryScript()

/** Adds the load-failure recovery script and a loading text that shows before any JS runs. */
export default function Document() {
  return (
    <Html>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: loadFailureRecoveryScript }} />
      </Head>
      <body>
        <div id={STATIC_LOADING_INDICATOR_ID}>Ladataan… / Loading…</div>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
