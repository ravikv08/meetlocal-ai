// tests/e2e/review-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Review flow', () => {
  test('/review/:bookingId redirects unauthenticated users', async ({ browser }) => {
    // Fresh context with NO stored session
    const ctx = await browser.newContext({ baseURL: 'http://localhost:3000' })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/review/nonexistent-booking')
    // Should redirect to signin or show not-found — never a raw server error
    await page.waitForTimeout(3_000)
    const url = page.url()
    const body = await page.textContent('body') ?? ''
    const isAcceptable =
      url.includes('signin') ||
      url.includes('auth') ||
      body.toLowerCase().includes('not found') ||
      body.toLowerCase().includes('404') ||
      body.toLowerCase().includes('sign in')
    expect(isAcceptable).toBe(true)
    await ctx.close()
  })

  test('home page loads for authenticated users', async ({ page }) => {
    // Uses the storageState session from auth.setup.ts
    await page.goto('/')
    await expect(page.locator('body')).not.toContainText('Internal Server Error', { timeout: 8_000 })
  })
})
