// @ts-check
import { expect, test } from "@playwright/test"

import waitForFunction from "../../utils/waitForFunction"

test("can open in the production playground-views and select survey type", async ({ page }) => {
  await page.goto("https://courses.mooc.fi/playground-views")

  await page.fill('[name="url"]', "http://localhost:12345/api/service-info")
  await page.waitForSelector("text=Valid service info")

  const frame = await waitForFunction(page, () =>
    page.frames().find((f) => {
      return f.url().startsWith("http://localhost:12345/iframe")
    }),
  )
  if (!frame) {
    throw new Error("Could not find frame")
  }
  await (await page.waitForSelector("text=Communication with the IFrame")).scrollIntoViewIfNeeded()
  //locator().scrollintoviewifneeded
  await (await frame.waitForSelector("text=Choose type of Survey")).scrollIntoViewIfNeeded()
  const dropdown = await frame.locator('[aria-label="select-survey-type"]')
  expect(await dropdown.selectOption("factorial")).toHaveLength(1)

  //await (await frame.locator('[aria-label="select-survey-type"]')).selectOption("factorial")
  await frame.waitForSelector("text=Options")
})
