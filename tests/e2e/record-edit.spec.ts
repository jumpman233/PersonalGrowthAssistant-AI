import { expect, test } from '@playwright/test'

test('edits a record and returns to the detail page', async ({ page, request }) => {
  const unique = Date.now()
  const originalTitle = `E2E 编辑原始 ${unique}`
  const originalContent = `这是一条 E2E 编辑前内容 ${unique}。`
  const updatedContent = `这是一条 E2E 编辑后内容 ${unique}，用于确认修改保存后详情页更新。`
  const originalTag = `edit${unique.toString().slice(-8)}`
  const updatedTag = `done${unique.toString().slice(-8)}`

  const response = await request.post('/api/records', {
    data: {
      title: originalTitle,
      content: originalContent,
      category: 'WORK',
      moodScore: 3,
      constructivenessScore: 3,
      energyCostScore: 2,
      tags: [originalTag],
      occurredAt: new Date('2026-05-05T10:00:00.000Z').toISOString(),
    },
  })
  expect(response.ok()).toBe(true)
  const record = (await response.json()) as { id: string }

  await page.goto(`/records/${record.id}`)
  await page.waitForLoadState('networkidle')

  await page.getByRole('link', { name: '编辑记录' }).first().click()
  await expect(page).toHaveURL(new RegExp(`/records/${record.id}/edit$`))
  await expect(page.getByTestId('record-form-title')).toHaveValue(originalTitle)
  await expect(page.getByTestId('record-form-content')).toHaveValue(originalContent)
  await expect(page.getByTestId('record-form-tags').getByText(originalTag, { exact: true }).first()).toBeVisible()

  await page.getByTestId('record-form-content').fill(updatedContent)
  await page.getByTestId('record-form-score-moodScore-5').click()
  await page.getByTestId('record-form-score-constructivenessScore-4').click()
  await page.getByTestId('record-form-score-energyCostScore-1').click()
  await page.getByRole('combobox').fill(updatedTag)
  await page.getByRole('option', { name: updatedTag }).click()
  await page.keyboard.press('Escape')
  await page.getByTestId('record-form-submit').click()

  await expect(page).toHaveURL(new RegExp(`/records/${record.id}(\\?.*)?$`))
  await expect(page.getByRole('heading', { name: originalTitle })).toBeVisible()
  await expect(page.getByText(updatedContent)).toBeVisible()
  await expect(page.getByText(originalTag)).toBeVisible()
  await expect(page.getByText(updatedTag)).toBeVisible()
  await expect(page.getByText('修改成功')).toBeVisible()
  await expect(page.getByText('5', { exact: true })).toBeVisible()
  await expect(page.getByText('4', { exact: true })).toBeVisible()
  await expect(page.getByText('1', { exact: true })).toBeVisible()
})
