// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Booking flow', () => {
  test('homepage loads and shows local profiles', async ({ page }) => {
    await page.goto('/')
    // LocalCard renders as <Link href="/local/{id}"> which becomes <a href="/local/{id}">
    const localLinks = page.locator('a[href^="/local/"]')
    await expect(localLinks.first()).toBeVisible({ timeout: 10_000 })
  })

  test('clicking a local card navigates to their profile page', async ({ page }) => {
    await page.goto('/')
    const firstLocal = page.locator('a[href^="/local/"]').first()
    await expect(firstLocal).toBeVisible({ timeout: 10_000 })
    await firstLocal.click()
    await expect(page).toHaveURL(/\/local\//)
  })

  test('local profile page loads without errors', async ({ page }) => {
    await page.goto('/')
    const firstLocal = page.locator('a[href^="/local/"]').first()
    await firstLocal.click()
    // Page should not show a generic error; check something rendered
    await expect(page.locator('body')).not.toContainText('Internal Server Error', { timeout: 8_000 })
  })
})
