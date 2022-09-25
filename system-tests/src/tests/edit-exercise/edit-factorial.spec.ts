// @ts-check
import { expect, test } from "@playwright/test"

import expectScreenshotsToMatchSnapshots from "../../utils/screenshot"
import waitForFunction from "../../utils/waitForFunction"

test("can add factorial survey type wtih information elements and questions intermixed", async ({
  page,
  headless,
}) => {
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
  page
    .frameLocator("iframe")
    .locator('div:has-text("Choose type of Survey--factorialnon-factorial")')
  //locator().scrollintoviewifneeded
  await (await frame.waitForSelector("text=Choose type of Survey")).scrollIntoViewIfNeeded()
  const dropdown = await frame.locator('[aria-label="select-survey-type"]')
  expect(await dropdown.selectOption("factorial")).toHaveLength(1)

  //await (await frame.locator('[aria-label="select-survey-type"]')).selectOption("factorial")
  await frame.waitForSelector("text=Options")
  frame
    .locator("textarea")
    .fill(
      "info; this is just an info element to provide some info for the coming section....\nquestion_one; This is the first question\nquestion_two;This is the second\ninfo;Questions should have unique question labels for identification\nthree;otherwise they can contain anything\nfive; newlines should be avoided",
    )
  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "mini-spec-edit-exercise",
    frame,
    clearNotifications: true,
  })

  // Add four options
  // Click text=Add Option
  await frame.locator("text=Add Option").click()
  // Fill [id="option-text-1"]
  await frame.locator('[id="option-text-1"]').fill("no")
  // Click [id="rate-value-1"]
  await frame.locator('[id="rate-value-1"]').click()
  // Fill [id="rate-value-1"]
  await frame.locator('[id="rate-value-1"]').fill("1")
  // Click text=Add Option
  await frame.locator("text=Add Option").click()
  // Click [id="option-text-2"]
  await frame.locator('[id="option-text-2"]').click()
  // Fill [id="option-text-2"]
  await frame.locator('[id="option-text-2"]').fill("maybe")
  // Click [id="rate-value-2"]
  await frame.locator('[id="rate-value-2"]').click()
  // Fill [id="rate-value-2"]
  await frame.locator('[id="rate-value-2"]').fill("2")
  // Click text=Add Option
  await frame.locator("text=Add Option").click()
  // Click [id="option-text-3"]
  await frame.locator('[id="option-text-3"]').click()
  // Fill [id="option-text-3"]
  await frame.locator('[id="option-text-3"]').fill("yes")
  // Click [id="rate-value-3"]
  await frame.locator('[id="rate-value-3"]').click()
  // Fill [id="rate-value-3"]
  await frame.locator('[id="rate-value-3"]').fill("3")
  // Click text=Add Option
  await frame.locator("text=Add Option").click()
  // Click [id="option-text-4"]
  await frame.locator('[id="option-text-4"]').click()
  // Fill [id="option-text-4"]
  await frame.locator('[id="option-text-4"]').fill("Can't tell")
  // Click [id="rate-value-4"]
  await frame.locator('[id="rate-value-4"]').click()
  // Fill [id="rate-value-4"]
  await frame.locator('[id="rate-value-4"]').fill("")

  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "mini-spec-edit-exercise-with-options",
    frame,
    clearNotifications: true,
  })

  // Click text=Set as private spec input
  await page.locator("text=Set as private spec input").click()

  // Click button:has-text("answer-exercise")
  await page.locator('button:has-text("answer-exercise")').click()

  const answer_frame = await waitForFunction(page, () =>
    page.frames().find((f) => {
      return f.url().startsWith("http://localhost:12345/iframe")
    }),
  )
  if (!answer_frame) {
    throw new Error("Could not find frame")
  }
  await answer_frame.waitForSelector(
    "text=this is just an info element to provide some info for the coming section....",
  )
  await expectScreenshotsToMatchSnapshots({
    axeSkip: ["heading-order", "scrollable-region-focusable"],
    headless,
    snapshotName: "mini-spec-edit-exercise-set-as-private-spec-and-go-answer-exercise",
    frame: answer_frame,
    clearNotifications: true,
  })
})
