import { test, expect } from '@playwright/test'

test.describe('Review flow', () => {
  test('unauthenticated access to /review redirects to /signin', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()
    await page.goto('http://localhost:3000/review/any-id')
    await expect(page).toHaveURL(/\/signin/, { timeout: 8_000 })
    await context.close()
  })
})
