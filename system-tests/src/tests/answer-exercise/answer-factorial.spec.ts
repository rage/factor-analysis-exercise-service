// @ts-check
import { test } from "@playwright/test"

import privateSpec from "../../../../tests/.test-data/mini-test/private-spec.json"
import waitForFunction from "../../utils/waitForFunction"

test("can navigate to answer-exercise playground-views", async ({ page }) => {
  await page.goto("https://courses.mooc.fi/playground-views")

  await page.fill('[name="url"]', "http://localhost:12345/api/service-info")
  await page.waitForSelector("text=Valid service info")

  await page.fill('[name="private_spec"]', JSON.stringify(privateSpec))
  await page.waitForSelector("text=answer-exercise")

  await page.click('button:text("answer-exercise")')
  const frame = await waitForFunction(page, () =>
    page.frames().find((f) => {
      return f.url().startsWith("http://localhost:12345/iframe")
    }),
  )
  if (!frame) {
    throw new Error("Could not find frame")
  }
})
