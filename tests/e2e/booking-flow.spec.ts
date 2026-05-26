import { test, expect } from '@playwright/test'

test.describe('Booking flow', () => {
  test('homepage shows at least one local card (seed guaranteed)', async ({ page }) => {
    await page.goto('/')
    const localLinks = page.locator('a[href^="/local/"]')
    await expect(localLinks.first()).toBeVisible({ timeout: 10_000 })
    expect(await localLinks.count()).toBeGreaterThanOrEqual(1)
  })

  test('clicking a local card navigates to their profile page', async ({ page }) => {
    await page.goto('/')
    const firstLocal = page.locator('a[href^="/local/"]').first()
    await expect(firstLocal).toBeVisible({ timeout: 10_000 })
    await firstLocal.click()
    await expect(page).toHaveURL(/\/local\//)
  })

  test('local profile page renders BookingPanel (no server error)', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href^="/local/"]').first().click()
    await expect(page).toHaveURL(/\/local\//)
    // BookingPanel header shows "/ hour"
    await expect(page.getByText(/\/\s*hour/)).toBeVisible({ timeout: 8_000 })
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })
})
