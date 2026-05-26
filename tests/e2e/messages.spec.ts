// tests/e2e/messages.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Messages / chat', () => {
  test('/messages redirects unauthenticated users to sign-in', async ({ browser }) => {
    // Fresh context with NO stored session — bypasses the storageState in playwright.config.ts
    const ctx = await browser.newContext({ baseURL: 'http://localhost:3000' })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/messages/some-booking-id')
    // MessagesPage does: redirect(`/signin?from=...`) for unauthenticated requests
    await expect(page).toHaveURL(/signin|auth/, { timeout: 8_000 })
    await ctx.close()
  })

  test('authenticated user can access profile page', async ({ page }) => {
    // Uses the storageState session from auth.setup.ts
    await page.goto('/profile')
    await expect(page.locator('body')).not.toContainText('sign in', { timeout: 8_000 })
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })
})
