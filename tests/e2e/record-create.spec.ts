import { expect, test } from '@playwright/test'

test('creates a record and lands on the detail page', async ({ page }) => {
  const unique = Date.now()
  const title = `E2E 新建记录 ${unique}`
  const content = `这是一条 E2E 新建记录内容 ${unique}，用于确认保存后详情页展示正常。`
  const tag = `e2e${unique.toString().slice(-8)}`

  await page.goto('/records/new')
  await page.waitForLoadState('networkidle')

  await page.getByTestId('record-form-title').fill(title)
  await page.getByTestId('record-form-content').fill(content)
  await expect(page.getByTestId('record-form-title')).toHaveValue(title)
  await expect(page.getByTestId('record-form-content')).toHaveValue(content)

  await page.getByTestId('record-form-category-STUDY').click()
  await page.getByTestId('record-form-score-moodScore-4').click()
  await page.getByTestId('record-form-score-constructivenessScore-5').click()
  await page.getByTestId('record-form-score-energyCostScore-1').click()
  await page.getByRole('combobox').fill(tag)
  await page.getByRole('option', { name: tag }).click()

  await page.getByTestId('record-form-submit').click()

  await expect(page).toHaveURL(/\/records\/(?!new$)[^/?]+/)
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await expect(page.getByText(content)).toBeVisible()
  await expect(page.getByText('学习')).toBeVisible()
  await expect(page.getByText(tag)).toBeVisible()
  await expect(page.getByText('新增成功')).toBeVisible()
  await expect(page.getByText('4', { exact: true })).toBeVisible()
  await expect(page.getByText('5', { exact: true })).toBeVisible()
  await expect(page.getByText('1', { exact: true })).toBeVisible()
})
