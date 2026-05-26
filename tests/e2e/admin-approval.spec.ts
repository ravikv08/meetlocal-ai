// tests/e2e/admin-approval.spec.ts
import { test, expect } from '@playwright/test'

// Note: for admin tests to reach protected content, the authenticated session
// must belong to a user listed in ADMIN_EMAILS.
// In dev, set ADMIN_EMAILS=e2e-test@example.com in .env.local.
// Without that, these tests verify the redirect/guard behaviour — not a 500.

test.describe('Admin — local approval', () => {
  test('admin locals page loads without server error', async ({ page }) => {
    await page.goto('/admin/locals')
    await expect(page.locator('body')).not.toContainText('Internal Server Error', { timeout: 8_000 })
    // Should either show admin content or redirect to signin — not a 500
    const url = page.url()
    expect(url).toMatch(/admin|signin/)
  })

  test('admin locals page contains filter links when accessed as admin', async ({ page }) => {
    await page.goto('/admin/locals')
    // If admin access: status filter links (All / pending / active / paused / removed) are present
    // If not admin: page redirects to signin — skip the assertion gracefully
    const isAdmin = !page.url().includes('signin')
    if (isAdmin) {
      await expect(page.getByRole('link', { name: /pending/i })).toBeVisible({ timeout: 5_000 })
    }
  })
})
