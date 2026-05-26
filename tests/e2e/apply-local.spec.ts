import { test, expect } from '@playwright/test'

test.describe('Become a local — apply flow', () => {
  test('apply page renders the application form heading', async ({ page }) => {
    await page.goto('/become-a-local/apply')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 8_000 })
  })

  test('apply page has at least 3 form inputs', async ({ page }) => {
    await page.goto('/become-a-local/apply')
    const inputs = page.locator('input, select, textarea')
    await expect(inputs.first()).toBeVisible({ timeout: 8_000 })
    expect(await inputs.count()).toBeGreaterThanOrEqual(3)
  })

  test('submitting an empty form shows a validation error', async ({ page }) => {
    await page.goto('/become-a-local/apply')
    // Submit without filling anything — button is disabled without IC agreement,
    // so submit the form directly to trigger validation
    await page.evaluate(() => {
      const form = document.querySelector('form')
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    // An inline error should appear about tags
    await expect(page.getByText(/pick at least one/i)).toBeVisible({ timeout: 4_000 })
  })
})
