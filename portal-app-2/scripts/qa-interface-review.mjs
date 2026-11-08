import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'

const browser = await chromium.launch({ channel: 'chrome' })
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(process.env.QA_BASE_URL || 'http://127.0.0.1:5183/', { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.getByRole('button', { name: 'Order by SKU', exact: true }).evaluate(el => el.tagName), 'BUTTON')
  await page.getByRole('tab', { name: 'Frequently ordered', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  assert.equal(await page.getByRole('tab', { name: /Saved list/ }).getAttribute('aria-selected'), 'true')
  assert.equal(await page.locator('.product-row').count(), 3)
  await page.keyboard.press('Home')
  assert.equal(await page.getByRole('tab', { name: 'Frequently ordered', exact: true }).getAttribute('tabindex'), '0')
  assert.equal(await page.getByRole('tab', { name: /Saved list/ }).getAttribute('tabindex'), '-1')
  assert.equal(await page.getByRole('tabpanel').getAttribute('aria-labelledby'), 'reorder-tab-frequent')
  await page.getByRole('button', { name: 'Order by SKU', exact: true }).click()
  await page.getByRole('button', { name: 'Review items', exact: true }).click()
  const sku = page.getByLabel('SKU, quantity', { exact: true })
  assert.equal(await sku.getAttribute('aria-invalid'), 'true')
  assert.equal(await sku.evaluate(el => el === document.activeElement), true)
  assert.match(await sku.getAttribute('aria-describedby'), /quick-order-errors/)
  await sku.fill('RCP-1001,1')
  assert.equal(await sku.getAttribute('aria-invalid'), null)
  await page.keyboard.press('Escape')
  const results = []
  for (const theme of ['light', 'dark']) {
    if (await page.locator('.portal').getAttribute('data-theme') !== theme) await page.getByRole('button', { name: 'Dark mode', exact: true }).click()
    for (const width of [1440,1280,1024,768,540,390,320]) {
      await page.setViewportSize({ width, height: 1100 })
      await page.waitForTimeout(150)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${theme} ${width}: overflow`)
      const metrics = await page.evaluate(() => {
        const reorder = document.querySelector('#reorder'), overview = document.querySelector('.visual-overview')
        const control = document.querySelector('.quantity-control button:last-child').getBoundingClientRect()
        return { orderingFirst: reorder.getBoundingClientRect().top < overview.getBoundingClientRect().top, productFont: parseFloat(getComputedStyle(document.querySelector('.product-name')).fontSize), control: { width: control.width, height: control.height } }
      })
      assert.equal(metrics.orderingFirst, true)
      assert.ok(metrics.productFont >= 14)
      assert.ok(metrics.control.width >= 40 && metrics.control.height >= 40)
      results.push({ theme,width,...metrics })
      if ([1440,390].includes(width)) {
        await page.evaluate(() => scrollTo(0,0))
        await page.waitForTimeout(1000)
        await page.screenshot({ path: `qa/review-after-${theme}-${width}.png`, fullPage: true })
      }
    }
    const contrast = await page.locator('.portal').evaluate(el => {
      const css = getComputedStyle(el)
      const luminance = hex => {
        const raw = hex.trim().slice(1)
        const expanded = raw.length === 3 ? [...raw].map(c => c+c).join('') : raw
        const values = expanded.match(/../g).map(c => parseInt(c,16)/255).map(c => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4)
        return values[0]*.2126+values[1]*.7152+values[2]*.0722
      }
      const surface = luminance(css.getPropertyValue('--ss-surface'))
      return ['--purchase-ink','--purchase-supporting','--purchase-metadata','--purchase-muted'].map(token => { const value = luminance(css.getPropertyValue(token)); return { token,ratio: (Math.max(surface,value)+.05)/(Math.min(surface,value)+.05) } })
    })
    for (const item of contrast) assert.ok(item.ratio >= 4.5, `${theme} ${item.token}: ${item.ratio}`)
  }
  const touch = await browser.newContext({ viewport: { width: 320,height: 844 }, isMobile: true,hasTouch: true })
  const mobile = await touch.newPage()
  mobile.on('pageerror', error => errors.push(error.message))
  await mobile.goto(process.env.QA_BASE_URL || 'http://127.0.0.1:5183/', { waitUntil: 'networkidle' })
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  const targets = await mobile.locator('.quantity-control button,.add-button').evaluateAll(nodes => nodes.map(el => { const r = el.getBoundingClientRect(); return { width:r.width,height:r.height } }))
  for (const r of targets) assert.ok(r.width >= 44 && r.height >= 44, `${JSON.stringify(r)} touch target`)
  await mobile.getByRole('button', { name: 'Open navigation', exact: true }).click()
  assert.equal(await mobile.locator('.workspace').evaluate(el => el.inert), true)
  assert.equal(await mobile.getByRole('button', { name: 'Close navigation drawer', exact: true }).evaluate(el => el === document.activeElement), true)
  await mobile.keyboard.press('Shift+Tab')
  assert.equal(await mobile.locator('.sidebar').evaluate(el => el.contains(document.activeElement)), true)
  await mobile.keyboard.press('Escape')
  assert.equal(await mobile.locator('.workspace').evaluate(el => el.inert), false)
  assert.equal(await mobile.getByRole('button', { name: 'Open navigation', exact: true }).evaluate(el => el === document.activeElement), true)
  await mobile.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await mobile.setViewportSize({ width: 1024,height: 900 })
  await mobile.waitForFunction(() => !document.querySelector('.workspace').inert)
  assert.equal(await mobile.locator('.sidebar').evaluate(el => el.classList.contains('is-open')), false)
  await touch.close()
  assert.deepEqual(errors, [])
  writeFileSync('qa/interface-review-results.json',JSON.stringify({ passed:true,results,errors },null,2))
  console.log('Passed: purchasing hierarchy, native buttons, roving keyboard tabs, field-error association/focus, four text-token contrast ratios in both themes, desktop/touch targets, mobile drawer isolation/focus, seven widths in both themes, and no runtime errors.')
} finally { await browser.close() }
