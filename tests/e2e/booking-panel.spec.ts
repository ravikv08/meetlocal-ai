import { test, expect } from '@playwright/test'

// storageState is inherited from the chromium project config; authenticated by default

test.describe('BookingPanel on local profile', () => {
  test('BookingPanel is visible on a local profile page', async ({ page }) => {
    await page.goto('/')
    const firstLocal = page.locator('a[href^="/local/"]').first()
    await expect(firstLocal).toBeVisible({ timeout: 10_000 })
    await firstLocal.click()
    await expect(page).toHaveURL(/\/local\//)

    // BookingPanel header shows "/ hour"
    await expect(page.getByText(/\/\s*hour/)).toBeVisible({ timeout: 8_000 })
  })

  test('clicking a different hours option does not crash the page', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href^="/local/"]').first().click()
    await expect(page).toHaveURL(/\/local\//)
    await expect(page.getByText(/\/\s*hour/)).toBeVisible({ timeout: 8_000 })

    // Hours is a <select> — change its value to "4" (4 hours)
    const hoursSelect = page.locator('select').nth(1)
    if (await hoursSelect.isVisible()) {
      await hoursSelect.selectOption('4')
      await page.waitForTimeout(300)
    }

    // Page must remain functional — no server error
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })

  test('local profile page does not return a 500', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href^="/local/"]').first().click()
    await expect(page).toHaveURL(/\/local\//)
    await expect(page.locator('body')).not.toContainText('Internal Server Error', {
      timeout: 8_000,
    })
  })
})
