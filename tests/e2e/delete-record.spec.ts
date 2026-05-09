import { expect, test } from '@playwright/test'

test('deletes a record from the list with confirmation', async ({ page, request }) => {
  const unique = Date.now()
  const title = `E2E 删除记录 ${unique}`
  const content = `这是一条 E2E 删除记录内容 ${unique}。`
  const tag = `del${unique.toString().slice(-8)}`

  const response = await request.post('/api/records', {
    data: {
      title,
      content,
      category: 'WORK',
      moodScore: 3,
      constructivenessScore: 4,
      energyCostScore: 1,
      tags: [tag],
      occurredAt: new Date('2026-05-09T10:00:00.000Z').toISOString(),
    },
  })
  expect(response.ok()).toBe(true)

  await page.goto('/records')
  await page.waitForLoadState('networkidle')

  const recordLink = page.getByRole('link', { name: `查看记录：${title}` })
  const deleteButton = page.getByRole('button', { name: `删除记录：${title}` })

  await expect(recordLink).toBeVisible()
  await deleteButton.click()
  await expect(page).toHaveURL(/\/records$/)

  const confirmDialog = page.getByRole('dialog', { name: '删除这条记录？' })
  await expect(confirmDialog).toBeVisible()

  await confirmDialog.getByRole('button', { name: '再想想' }).click()
  await expect(confirmDialog).toBeHidden()
  await expect(recordLink).toBeVisible()

  await deleteButton.click()
  await expect(confirmDialog).toBeVisible()
  await confirmDialog.getByRole('button', { name: '删除记录' }).click()

  await expect(page.getByRole('dialog', { name: '删除成功' })).toBeVisible()
  await expect(recordLink).toBeHidden()
})
