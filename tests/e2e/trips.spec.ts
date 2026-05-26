import { test, expect } from '@playwright/test'

// storageState is inherited from the chromium project config

test.describe('/trips page', () => {
  test('loads without a server error', async ({ page }) => {
    await page.goto('/trips')
    await expect(page.locator('body')).not.toContainText('Internal Server Error', {
      timeout: 8_000,
    })
  })

  test('shows bookings list or empty-state message', async ({ page }) => {
    await page.goto('/trips')
    // Either bookings links or an empty-state message should be present
    const bookingLinks = await page.locator('a[href^="/messages/"]').count()
    const emptyState = await page.getByText(/no trips|no bookings|no upcoming/i).count()
    expect(bookingLinks + emptyState).toBeGreaterThan(0)
  })
})
