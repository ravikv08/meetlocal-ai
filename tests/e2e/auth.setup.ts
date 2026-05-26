// tests/e2e/auth.setup.ts
import { test as setup } from '@playwright/test'
import fs from 'fs'

const AUTH_FILE = 'tests/e2e/.auth/user.json'

// Dev magic-link auth flow:
// 1. Fill email on /signin → triggers signIn("resend") server action
// 2. Dev server writes a magic link to OS temp dir (lib/dev-magic-link.ts)
// 3. /signin/check-email renders a "Sign me in" anchor with that URL
// 4. Click it → NextAuth completes the callback → save session state
setup('authenticate', async ({ page }) => {
  fs.mkdirSync('tests/e2e/.auth', { recursive: true })

  // Navigate to signin and submit an email
  await page.goto('/signin')
  await page.locator('input[name="email"]').fill('e2e-test@example.com')
  // The page has two submit buttons (Google form + email form); click the email one
  await page.locator('button[type="submit"]').last().click()

  // Wait for the server to redirect to the check-email page
  await page.waitForURL('**/signin/check-email', { timeout: 15_000 })

  // Dev mode: the page renders a "Sign me in" link pointing to the magic callback URL
  await page.getByRole('link', { name: /sign me in/i }).click()

  // Wait for NextAuth to complete and redirect to the home page or profile
  await page.waitForURL(/\/(profile|trips|$)/, { timeout: 15_000 })

  await page.context().storageState({ path: AUTH_FILE })
})
