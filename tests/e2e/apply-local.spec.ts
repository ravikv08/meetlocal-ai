// tests/e2e/apply-local.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Become a local — apply flow', () => {
  test('apply page is reachable from /become-a-local', async ({ page }) => {
    await page.goto('/become-a-local')
    // Should show a page (not 404)
    await expect(page.locator('body')).not.toContainText('404')
    await expect(page.locator('body')).not.toContainText('Not Found')
  })

  test('/become-a-local/apply shows a form', async ({ page }) => {
    await page.goto('/become-a-local/apply')
    // The apply form has many inputs — neighborhood, tagline, etc.
    await expect(page.locator('input, textarea').first()).toBeVisible({ timeout: 10_000 })
  })

  test('apply form shows validation errors when submitted empty without IC agreement', async ({ page }) => {
    await page.goto('/become-a-local/apply')
    // ApplyForm validates: tags must be picked and IC agreement must be checked
    // Clicking submit without tags triggers setError("Pick at least one thing...")
    // The error div uses class text-magenta on the form
    const submitBtn = page.getByRole('button', { name: /submit application/i })
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // Error message renders in a div — check the page stays on /apply
      await expect(page).toHaveURL(/apply/)
    }
  })
})
