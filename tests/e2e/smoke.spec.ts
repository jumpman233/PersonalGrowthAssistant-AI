import { expect, test } from '@playwright/test'

test('loads the Nuxt app shell', async ({ page }) => {
  await page.goto('/records/new', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('body')).toBeVisible()
  await expect(page.locator('main')).toBeVisible()
})
