import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ channel:'chrome' })
try {
  const page = await browser.newPage({ viewport:{ width:1440,height:1100 } })
  const errors = []
  page.on('pageerror',e => errors.push(e.message))
  const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5183'
  await page.goto(base+'/#/shop',{ waitUntil:'networkidle' })
  await page.locator('.catalog-product').first().waitFor()
  assert.equal(await page.locator('.catalog-product').count(),6)
  const packs = page.getByRole('group',{ name:'Packaging',exact:true })
  const bulk = packs.getByRole('radio',{ name:/5 gallon/ })
  await bulk.check()
  const row = page.locator('.catalog-product').filter({ has:bulk })
  assert.match(await row.locator('.catalog-product-price').textContent(),/74.00/)
  assert.match(await row.locator('img').getAttribute('src'),/apc-bulk/)
  await row.getByRole('button',{ name:/Add All-purpose cleaner/ }).click()
  await page.getByRole('button',{ name:'Review cart',exact:true }).click()
  await page.getByRole('dialog').getByRole('heading',{ name:/All-purpose cleaner/ }).waitFor()
  assert.match(await page.getByRole('dialog').locator('.cart-total').textContent(),/74.00/)
  await page.keyboard.press('Escape')
  await page.getByRole('button',{ name:'Favorites',exact:true }).click()
  await page.getByRole('button',{ name:'Clear favorites filter',exact:true }).waitFor()
  await page.getByRole('tab',{ name:/Requires Approval/ }).click()
  assert.equal(await page.getByRole('button',{ name:'Favorites',exact:true }).getAttribute('aria-pressed'),'false')
  assert.equal(await page.locator('.catalog-product').count(),4)
  await page.getByRole('link',{ name:'Power Clean',exact:true }).waitFor()
  await page.getByRole('tab',{ name:/Approved Core Items/ }).click()
  const search = page.getByRole('searchbox',{ name:'Search account catalog' })
  await search.click()
  assert.equal(await page.locator('.catalog-search').evaluate(el => getComputedStyle(el).outlineStyle),'none')
  assert.equal(await search.evaluate(el => getComputedStyle(el).outlineStyle),'none')
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  assert.equal(await search.evaluate(el => el === document.activeElement),true)
  assert.equal(await page.locator('.catalog-search').evaluate(el => getComputedStyle(el).outlineStyle),'solid')
  await search.fill('RCP-1002')
  assert.equal(await page.locator('.catalog-product').count(),1)
  assert.match(await page.locator('.catalog-product-name').textContent(),/bulk/)
  await search.fill('')
  for (const theme of ['light','dark']) {
    if (await page.locator('.portal').getAttribute('data-theme') !== theme) await page.getByRole('button',{ name:'Dark mode',exact:true }).click()
    for (const view of ['list','grid']) {
      await page.getByRole('button',{ name:view === 'list' ? 'List view' : 'Grid view',exact:true }).click()
      for (const width of [1440,1024,768,540,390,320]) {
        await page.setViewportSize({ width,height:1100 })
        await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth)
        const labels = await packs.locator('label').evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().height))
        assert.ok(labels.every(height=>height>=44))
        if ([1440,390].includes(width)) await page.screenshot({ path:`qa/shop-refined-${theme}-${view}-${width}.png`,fullPage:true })
      }
    }
  }
  assert.deepEqual(errors,[])
  console.log('Passed: grouped packaging updates price/photo/cart SKU, exact-SKU search, approval-tab filters clear, pointer vs keyboard search focus, both themes/views at six widths, 44px packaging targets, no runtime errors.')
} finally { await browser.close() }
