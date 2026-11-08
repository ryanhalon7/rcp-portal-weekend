import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'
const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(process.env.QA_BASE_URL || 'http://127.0.0.1:5182/', { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.locator('.portal').getAttribute('data-theme'), 'light')
  assert.equal(await page.locator('.topbar nav').count(), 0)
  assert.equal((await page.locator('.sidebar').boundingBox()).x, 0)
  assert.equal(await page.locator('.sidebar nav .nav-item').count(), 6)
  await page.getByRole('button', { name: 'Build your next order', exact: true }).click()
  assert.equal(await page.getByRole('tab', { name: 'Frequently ordered', exact: true }).getAttribute('aria-selected'), 'true')
  await page.getByRole('button', { name: 'Add All-purpose cleaner to cart', exact: true }).click()
  assert.equal(await page.locator('.feature-cart-link strong').textContent(), '$64.00')
  await page.getByRole('button', { name: /ORDERING FOR/ }).click()
  await page.getByRole('option', { name: /Orlando/ }).click()
  assert.equal(await page.locator('.location-feature h3').textContent(), 'Orlando, FL')
  assert.equal(await page.locator('.feature-cart-link strong').textContent(), '$0.00')
  await page.getByRole('button', { name: 'View location cart', exact: true }).click()
  await page.getByRole('dialog').getByText('Your next order starts here.').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /ORDERING FOR/ }).click()
  await page.getByRole('option', { name: /Tampa/ }).click()
  await page.getByRole('button', { name: 'Dismiss notification' }).click()
  await page.locator('.field-guide').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0))
  for (const theme of ['light', 'dark']) {
    if (await page.locator('.portal').getAttribute('data-theme') !== theme) await page.getByRole('button', { name: 'Dark mode', exact: true }).click()
    for (const width of [1440, 1280, 1024, 768, 600, 540, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      await page.waitForTimeout(200)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${theme} ${width}: page overflow`)
      assert.equal(await page.locator('.spend-card').evaluate(el => el.scrollWidth > el.clientWidth), false, `${theme} ${width}: chart overflow`)
      assert.equal(await page.locator('#reorder').evaluate(el => el.getBoundingClientRect().top < document.querySelector('.field-guide').getBoundingClientRect().top), true, 'Ordering comes before the photo banner')
      if ([1440, 390].includes(width)) {
        await page.evaluate(() => scrollTo(0, 0))
        await page.waitForTimeout(1200)
        await page.screenshot({ path: `qa/edition-two-${theme}-${width}.png`, fullPage: true })
      }
    }
  }
  assert.deepEqual(errors, [])
  console.log('Passed: left sidebar, restock action, live location/cart summary, decoded local images, both themes at eight widths, and no runtime errors.')
} finally { await browser.close() }
