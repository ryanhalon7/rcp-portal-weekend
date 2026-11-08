import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'

mkdirSync('qa', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  const toggle = page.getByRole('button', { name: 'Dark mode', exact: true })
  assert.equal(await toggle.getAttribute('aria-pressed'), 'true', 'Uses system preference initially')
  await page.screenshot({ path: 'qa/dark-desktop.png', fullPage: true })
  await toggle.focus()
  await page.keyboard.press('Enter')
  assert.equal(await toggle.getAttribute('aria-pressed'), 'false')
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await toggle.getAttribute('aria-pressed'), 'false', 'Explicit light preference overrides dark OS after reload')
  await toggle.click()
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await toggle.getAttribute('aria-pressed'), 'true', 'Dark preference persists')
  await page.getByRole('button', { name: 'Quick order', exact: true }).click()
  await page.getByLabel('SKU, quantity', { exact: true }).fill('NOT-A-SKU,2')
  await page.getByRole('button', { name: 'Review items' }).click()
  await page.screenshot({ path: 'qa/dark-dialog.png', fullPage: true })
  await page.keyboard.press('Escape')
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth, null, { timeout: 2000 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No dark-mode overflow at ${width}px`)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'qa/dark-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await page.screenshot({ path: 'qa/dark-navigation.png', fullPage: true })
  await page.getByRole('button', { name: 'Close navigation drawer', exact: true }).click()
  await toggle.click()
  await page.screenshot({ path: 'qa/light-mobile-toggle.png', fullPage: true })
  assert.deepEqual(errors, [])
  console.log('Passed: system preference, keyboard toggle, persistent light/dark choices, dark dialog/error state, mobile navigation, and no overflow at 4 widths. No browser runtime errors.')
} finally {
  await browser.close()
}
