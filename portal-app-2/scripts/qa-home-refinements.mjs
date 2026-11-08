import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ channel:'chrome' })
try {
  const page = await browser.newPage({ viewport:{ width:1440,height:1100 } })
  const errors = []
  page.on('pageerror',e => errors.push(e.message))
  await page.goto(process.env.QA_BASE_URL || 'http://127.0.0.1:5183/',{ waitUntil:'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil:'networkidle' })
  await page.getByRole('button',{ name:'Order by SKU',exact:true }).click()
  await page.getByRole('dialog',{ name:'Order by SKU',exact:true }).waitFor()
  await page.getByLabel('SKU, quantity',{ exact:true }).fill('RCP-1001,2\nRCP-3102,1\nRCP-4025,1')
  await page.getByRole('button',{ name:'Review items',exact:true }).click()
  await page.getByRole('button',{ name:'Add matched items to cart',exact:true }).click()
  const cart = page.getByRole('dialog',{ name:'Location cart',exact:true })
  await cart.waitFor()
  assert.equal(await cart.locator('.cart-item').count(),3)
  assert.equal(await cart.locator('.cart-total strong').textContent(),'$224.00')
  await cart.getByRole('button',{ name:'Remove one All-purpose cleaner',exact:true }).click()
  assert.equal(await cart.locator('.cart-total strong').textContent(),'$160.00')
  await cart.getByRole('button',{ name:'Remove Non-acid wheel cleaner from cart',exact:true }).click()
  assert.equal(await cart.locator('.cart-item').count(),2)
  assert.equal(await cart.locator('.cart-total strong').textContent(),'$88.00')
  assert.equal(await cart.locator('.cart-approval-note').count(),0)
  await page.screenshot({ path:'qa/cart-refined-desktop.png',fullPage:true })
  for (const theme of ['light','dark']) {
    if (await page.locator('.portal').getAttribute('data-theme') !== theme) {
      await page.keyboard.press('Escape')
      await page.getByRole('button',{ name:'Dark mode',exact:true }).click()
      await page.getByRole('button',{ name:/Location cart, 2 units/ }).click()
    }
    for (const width of [1440,1024,768,540,390,320]) {
      await page.setViewportSize({ width,height:900 })
      const overflow = await cart.evaluate(el => el.scrollWidth > el.clientWidth)
      assert.equal(overflow,false,`${theme} ${width}: cart overflow`)
      const targets = await cart.locator('.cart-quantity button,.cart-remove').evaluateAll(nodes => nodes.map(el=>el.getBoundingClientRect().height))
      assert.ok(targets.every(h => h >= 44))
      if (width === 390) await page.screenshot({ path:`qa/cart-refined-${theme}-mobile.png`,fullPage:true })
    }
  }
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width:1440,height:1100 })
  await page.getByRole('button',{ name:'Dark mode',exact:true }).click()
  const spend = page.locator('.spend-card')
  assert.equal(await spend.getByRole('heading',{ name:'Purchasing overview',exact:true }).count(),1)
  assert.equal(await spend.getByRole('heading',{ name:'Spend by category',exact:true }).count(),1)
  assert.equal(await page.locator('.mix-card').count(),0)
  const reconcile = async () => {
    const sums = await spend.locator('.spend-category-list dd strong').allTextContents()
    const total = await spend.locator('.spend-readout > strong').textContent()
    const number = s => Number(s.replace(/[^0-9.]/g,''))
    assert.equal(sums.reduce((sum,s)=>sum+number(s),0),number(total))
  }
  await reconcile()
  await spend.getByRole('radio',{ name:'3 months',exact:true }).click()
  await reconcile()
  await page.locator('.summary-approval').click()
  await page.getByRole('dialog').getByText('Awaiting approval',{ exact:true }).waitFor()
  await page.keyboard.press('Escape')
  await page.locator('.summary-invoices').click()
  await page.getByRole('dialog',{ name:'Open invoices',exact:true }).waitFor()
  await page.keyboard.press('Escape')
  for (const theme of ['light','dark']) {
    if (await page.locator('.portal').getAttribute('data-theme') !== theme) await page.getByRole('button',{ name:'Dark mode',exact:true }).click()
    for (const width of [1440,1024,768,540,390,320]) {
      await page.setViewportSize({ width,height:1100 })
      await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,`${theme} ${width}: home overflow`)
      if ([1440,390].includes(width)) await page.screenshot({ path:`qa/home-refined-${theme}-${width}.png`,fullPage:true })
    }
  }
  assert.deepEqual(errors,[])
  console.log('Passed: explicit SKU entry, cart edits/removal/totals, status-card destinations, category totals reconcile across periods, both themes at six widths, 44px cart targets, no runtime errors.')
} finally { await browser.close() }
