import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(process.env.QA_BASE_URL || 'http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.locator('.field-guide').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => [...document.querySelectorAll('img')].every(img => img.complete && img.naturalWidth > 0))
  assert.equal(await page.locator('.spend-readout > strong').textContent(), '$24,340')
  assert.equal(await page.locator('.mix-legend strong').allTextContents().then(values => values.reduce((sum, value) => sum + Number(value.replace(/[$,]/g, '')), 0)), 24340)
  await page.getByRole('radio', { name: '3 months', exact: true }).click()
  assert.equal(await page.locator('.spend-readout > strong').textContent(), '$13,310')
  await page.getByRole('button', { name: 'Sep 2026 item spend: $4,110', exact: true }).focus()
  assert.equal(await page.locator('.spend-readout > strong').textContent(), '$4,110')
  await page.getByRole('radio', { name: '3 months', exact: true }).focus()
  assert.equal(await page.locator('.spend-readout > strong').textContent(), '$13,310')
  await page.keyboard.press('ArrowRight')
  assert.equal(await page.getByRole('radio', { name: '6 months', exact: true }).getAttribute('aria-checked'), 'true')
  assert.equal(await page.locator('.spend-readout > strong').textContent(), '$24,340')
  await page.getByRole('button', { name: /ORDERING FOR/ }).click()
  await page.getByRole('option', { name: /Orlando, FL/ }).click()
  assert.equal(await page.locator('.spend-readout > strong').textContent(), '$18,499')
  await page.getByRole('button', { name: /ORDERING FOR/ }).click()
  await page.getByRole('option', { name: /Tampa, FL/ }).click()
  await page.getByRole('button', { name: 'Dismiss notification' }).click()
  await page.locator('.chart-foot summary').click()
  assert.equal(await page.locator('.chart-foot tbody tr').count(), 6)
  await page.locator('.chart-foot summary').click()
  for (const theme of ['light', 'dark']) {
    if (await page.locator('.portal').getAttribute('data-theme') !== theme) await page.getByRole('button', { name: 'Dark mode', exact: true }).click()
    for (const width of [1440, 1280, 1024, 768, 600, 540, 390, 358, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(150)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${theme}: overflow at ${width}px`)
      if ([1440, 390].includes(width)) {
        await page.waitForTimeout(1300)
        await page.screenshot({ path: `qa/visuals-${theme}-${width}.png`, fullPage: true })
      }
    }
  }
  assert.deepEqual(errors, [])
  console.log('Passed: stock photos decoded, chart totals reconcile, period filter, keyboard chart readout, location-specific data, accessible data table, and no overflow in both themes at 9 widths. No runtime errors.')
} finally { await browser.close() }
