import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle, Clock, FileText, Funnel, Heart, Info, Lightning, List, MagnifyingGlass, Package, ShoppingCart, SquaresFour, X } from '@phosphor-icons/react'
import { Button } from './vendor/stageshow/controls/Button'
import { Card } from './vendor/stageshow/parts/Card'
import { accountPolicy, CatalogError, loadCatalog, money, type Line, type Product } from './catalog'
import { shopHref, type ShopFilters } from './shop-route'
import ProductArt from './components/ProductArt'
import OrderQuantity from './components/OrderQuantity'
import './shop.css'

type Props = { filters: ShopFilters; locationId: string; locationName: string; cart: Line[]; cartSubtotal: number; onAdd: (lines: Line[]) => boolean; onQuickOrder: () => void; onCart: () => void; onSupport: () => void }
type LoadState = 'loading' | 'ready' | 'error' | 'denied' | 'unavailable'
const categories = ['all','Cleaners','Wash & wax','Tools & towels','Equipment']
function readFavorites(): string[] { try { const value: unknown = JSON.parse(localStorage.getItem('rcp-v2-favorites') || '["RCP-1001","RCP-2040","RCP-3102"]'); return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [] } catch { return [] } }

export default function Shop({ filters,locationId,locationName,cart,cartSubtotal,onAdd,onQuickOrder,onCart,onSupport }: Props) {
  const [catalog,setCatalog] = useState<Product[]>([])
  const [status,setStatus] = useState<LoadState>('loading')
  const [retry,setRetry] = useState(0)
  const [favorites,setFavorites] = useState(readFavorites)
  const [selectedPacks,setSelectedPacks] = useState<Record<string,string>>({})
  const [keyboardNavigation,setKeyboardNavigation] = useState(false)
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Tab') setKeyboardNavigation(true) }
    const pointer = () => setKeyboardNavigation(false)
    document.addEventListener('keydown',key,true)
    document.addEventListener('pointerdown',pointer,true)
    return () => { document.removeEventListener('keydown',key,true); document.removeEventListener('pointerdown',pointer,true) }
  },[])
  const [quantities,setQuantities] = useState<Record<string,number>>({})
  const [filtersOpen,setFiltersOpen] = useState(() => window.matchMedia('(min-width: 1101px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1101px)')
    const sync = () => setFiltersOpen(media.matches)
    media.addEventListener('change',sync)
    return () => media.removeEventListener('change',sync)
  },[])
  const [favoriteNotice,setFavoriteNotice] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const priorProduct = useRef(filters.product)
  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    loadCatalog(controller.signal).then(items => { if (!controller.signal.aborted) { setCatalog(items); setStatus('ready') } }).catch(error => { if (!controller.signal.aborted) setStatus(error instanceof CatalogError ? error.kind : 'error') })
    return () => controller.abort()
  },[retry,locationId])
  useEffect(() => { localStorage.setItem('rcp-v2-favorites',JSON.stringify(favorites)) },[favorites])
  useEffect(() => {
    if (priorProduct.current !== filters.product) { priorProduct.current = filters.product; window.scrollTo(0,0); headingRef.current?.focus() }
  },[filters.product])
  const update = (patch: Partial<ShopFilters>, replace = false) => {
    const url = shopHref({ ...filters,...patch })
    if (replace) { window.history.replaceState(null,'',url); window.dispatchEvent(new Event('hashchange')) }
    else { window.location.hash = url.slice(1); window.dispatchEvent(new Event('hashchange')) }
  }
  const toggleFavorite = (product: Product) => {
    const saved = favorites.includes(product.id)
    setFavorites(old => saved ? old.filter(id => id !== product.id) : [...old,product.id])
    setFavoriteNotice(`${product.name} ${saved ? 'removed from' : 'added to'} favorites.`)
  }
  const matches = (product: Product) => `${product.name} ${product.id}`.toLowerCase().includes(filters.q.trim().toLowerCase()) && (filters.category === 'all' || product.group === filters.category) && (!filters.favorites || favorites.includes(product.id))
  const core = filters.tab !== 'approval'
  const compare = (a: Product,b: Product) => filters.sort === 'name' ? a.name.localeCompare(b.name) : filters.sort === 'price-low' ? a.price-b.price : filters.sort === 'price-high' ? b.price-a.price : 0
  const filtered = catalog.filter(product => product.core === core && matches(product)).sort(compare)
  const uniqueCount = (items: Product[]) => new Set(items.map(item => item.family || item.id)).size
  const seenFamilies = new Set<string>()
  const visibleProducts = filtered.flatMap(item => {
    if (!item.family) return [item]
    if (seenFamilies.has(item.family)) return []
    seenFamilies.add(item.family)
    return [filtered.find(option => option.family === item.family && option.id === selectedPacks[item.family!]) || item]
  }).sort(compare)
  const changeTab = (tab: string) => {
    if (tab === filters.tab) return
    update({ tab,favorites:false,category:'all' })
    if (filters.favorites || filters.category !== 'all') setFavoriteNotice('Favorites and category filters cleared for the new catalog tab.')
  }
  const packChoices = (item: Product) => {
    const options = catalog.filter(option => option.family && option.family === item.family && filtered.some(match => match.id === option.id))
    return options.length > 1 ? <fieldset className="catalog-pack-choices"><legend>Packaging</legend>{options.map(option => <label key={option.id}><input type="radio" name={`pack-${item.family}`} checked={option.id === item.id} onChange={() => setSelectedPacks(old => ({ ...old,[item.family!]:option.id }))}/><span>{option.detail}</span></label>)}</fieldset> : <p>{item.detail}{item.family && <a className="catalog-pack-link" href={detailHref(item)}>Choose packaging<ArrowRight size={12}/></a>}</p>
  }
  const otherMatches = catalog.filter(product => product.core !== core && matches(product)).length
  const product = catalog.find(item => item.id === filters.product)
  const count = cart.reduce((sum,line) => sum+line.quantity,0)
  const detailHref = (item: Product) => shopHref({ ...filters,product:item.id })
  const favoriteButton = (item: Product) => <button type="button" className={`favorite-toggle ${favorites.includes(item.id) ? 'is-favorite' : ''}`} aria-label={`Favorite ${item.name}`} aria-pressed={favorites.includes(item.id)} onClick={() => toggleFavorite(item)}><Heart size={20} weight={favorites.includes(item.id) ? 'fill' : 'regular'}/></button>
  const purchasing = (item: Product) => <div className="catalog-buy"><OrderQuantity name={item.name} value={quantities[item.id] ?? 1} onChange={value => setQuantities(old => ({ ...old,[item.id]:value }))} disabled={!item.available}/><Button variant="primary" className="catalog-add" disabled={!item.available || !Number.isSafeInteger(quantities[item.id] ?? 1) || (quantities[item.id] ?? 1) < 1 || (quantities[item.id] ?? 1) > 999} aria-label={`Add ${item.name} to cart`} onClick={() => onAdd([{ id:item.id,quantity:quantities[item.id] ?? 1 }])}><span>{item.available ? 'Add to cart' : 'Unavailable'}</span></Button></div>
  const policy = (item: Product) => <span className={`catalog-policy ${item.core ? 'core' : 'approval'}`}>{item.core ? <CheckCircle size={14}/> : <Clock size={14}/>} {item.core ? 'Approved core item' : 'Requires approval'}</span>
  const statePanel = (kind: LoadState) => <Card className="catalog-state" pad="large"><Package size={36}/><h2>{kind === 'denied' ? 'Catalog access is restricted' : kind === 'unavailable' ? 'Catalog temporarily unavailable' : 'We couldn’t load your catalog'}</h2><p>{kind === 'denied' ? 'Ask your account representative to confirm your location access. No products have been added.' : 'Your location cart is safe. Try again, or contact your representative for help.'}</p><div className="catalog-state-actions">{kind !== 'denied' && <Button variant="primary" onClick={() => setRetry(value => value+1)}>Try again</Button>}<Button onClick={onSupport}>Contact your representative</Button></div></Card>

  return <section className="shop-page" aria-label="Shop account catalog">
    <div className="breadcrumb"><a href="#/">Workspace</a><ArrowRight size={12}/>{filters.product ? <><a href={filters.returnTo || shopHref({ ...filters,product:'' })}>{filters.returnTo ? filters.returnTo.startsWith('#/orders') ? 'Orders & invoices' : 'Lists & reorder' : 'Shop'}</a><ArrowRight size={12}/><span>Product details</span></> : <span>Shop</span>}<span className="demo-label">Sample catalog</span></div>
    <div className="page-heading shop-heading"><div><h1 ref={headingRef} tabIndex={-1}>{filters.product ? (product?.name || 'Product details') : 'Shop'}</h1><p>{accountPolicy.name} account catalog <span aria-hidden="true">{'\u00b7'}</span> Account pricing</p></div><Button size="large" icon={<Lightning size={18}/>} disabled={status !== 'ready'} onClick={onQuickOrder}>Order by SKU</Button></div>
    <span className="sr-only" role="status">{favoriteNotice}</span>
    {status === 'loading' ? <Card className="catalog-loading" pad="large" aria-busy="true" aria-label="Loading catalog"><p role="status">Loading your account catalog…</p>{[0,1,2].map(item => <div className="catalog-skeleton" key={item}><span/><span/><span/></div>)}</Card> : status !== 'ready' ? statePanel(status) : filters.product ? product ? <>
      <a className="catalog-back" href={filters.returnTo || shopHref({ ...filters,product:'' })}><ArrowLeft size={16}/>{filters.returnTo ? filters.returnTo.startsWith('#/orders') ? 'Back to orders & invoices' : 'Back to your list' : 'Back to your catalog'}</a>
      <Card className="product-detail-card" pad="large" gap={0}>
        <div className="product-detail-art"><ProductArt product={product}/><small>{product.photo ? 'Product photo - Sample catalog details' : 'Representative illustration - Sample product'}</small></div>
        <div className="product-detail-info"><div className="detail-policy-row">{policy(product)}{favoriteButton(product)}</div><span className="catalog-sku">{product.id} · {product.category}</span><h2>{product.name}</h2><p>{product.description}</p>{product.family && <fieldset className="pack-options"><legend>Choose packaging</legend>{catalog.filter(item => item.family === product.family).map(item => <a key={item.id} href={detailHref(item)} aria-current={item.id === product.id ? 'true' : undefined}>{item.detail}</a>)}</fieldset>}<div className="product-detail-price"><strong>{money(product.price)}</strong><span>/ {product.unit}<small>Sample account price · Tax & delivery excluded</small></span></div><dl className="product-specs"><div><dt>Packaging</dt><dd>{product.detail}</dd></div><div><dt>Purchasing unit</dt><dd>1 {product.unit}</dd></div><div><dt>Availability</dt><dd>{product.available ? 'Available to order in this sample' : 'Currently unavailable'}</dd></div><div><dt>Ordering location</dt><dd>{locationName}</dd></div></dl>

          {!product.core && <div className="detail-approval"><Clock size={18}/><p>This item is outside your account’s core list. Adding it to the cart does not approve it. Manager approval is required every time it is purchased.</p></div>}
          {purchasing(product)}<p className="catalog-delivery"><Info size={15}/>Delivery timing and charges are confirmed at checkout. No live inventory or delivery promise is shown.</p>
        </div>
      </Card>
      <div className="product-info-grid"><Card pad="large"><h2>Product documents</h2><p>Approved SDS, PDS, and manufacturer specifications have not been supplied for this sample product. Follow the official label and documentation before use.</p><button className="text-link" onClick={onSupport}><FileText size={17}/>Ask for product documents<ArrowUpRight size={15}/></button></Card><Card pad="large"><h2>Keep purchasing clear</h2><p>Quantities are whole purchasing units. One case contains the packaging shown above; nothing is silently rounded to case multiples.</p><p>Account pricing and eligibility are rechecked before a live order can be placed.</p></Card></div>
      {catalog.some(item => item.id !== product.id && item.group === product.group) && <section className="related-products"><div className="section-title"><h2>Also in {product.group.toLowerCase()}</h2></div><div>{catalog.filter(item => item.id !== product.id && item.group === product.group).slice(0,3).map(item => <a key={item.id} href={detailHref(item)}><ProductArt product={item}/><span><strong>{item.name}</strong><small>{item.detail}</small>{policy(item)}<b>{money(item.price)} / {item.unit}</b></span><ArrowRight size={18}/></a>)}</div></section>}
    </> : <Card className="catalog-state" pad="large"><Package size={36}/><h2>Product not available in your catalog</h2><p>This item may have been removed or may not be assigned to your account. It cannot be added from this link.</p><a className="catalog-back" href={filters.returnTo || shopHref({ ...filters,product:'' })}><ArrowLeft size={16}/>{filters.returnTo ? filters.returnTo.startsWith('#/orders') ? 'Back to orders & invoices' : 'Back to your list' : 'Back to catalog'}</a></Card> : <>
      <div className="catalog-layout">
        <aside className="catalog-sidebar" aria-label="Catalog filters">
          <details className="catalog-filter-disclosure" open={filtersOpen} onToggle={event => setFiltersOpen(event.currentTarget.open)}>
            <summary><Funnel size={18}/>Filters{(filters.category !== 'all' || filters.favorites) && <span className="filter-active">Active</span>}</summary>
            <div className="catalog-filter-content">
              <h2>Categories</h2>
              <div className="catalog-category-list" role="group" aria-label="Filter catalog category">{categories.map(category => <button key={category} type="button" aria-pressed={filters.category === category} onClick={() => update({ category })}><span>{category === 'all' ? 'All products' : category}</span><small>{uniqueCount(catalog.filter(item => item.core === core && (category === 'all' || item.group === category)))}</small></button>)}</div>
              <h2>Saved products</h2>
              <button className={`catalog-favorites-filter ${filters.favorites ? 'selected' : ''}`} aria-pressed={filters.favorites} onClick={() => update({ favorites:!filters.favorites })}><Heart size={18} weight={filters.favorites ? 'fill' : 'regular'}/>Favorites</button>
              {(filters.category !== 'all' || filters.favorites || filters.q) && <button className="catalog-reset" onClick={() => update({ q:'',category:'all',favorites:false })}>Clear filters</button>}
              <details className="catalog-policy-help"><summary><Info size={16}/>Purchasing policy</summary><p>Core items are approved for every {accountPolicy.name} location. Off-list items require manager approval on every purchase, including reorders and CSV imports.</p></details>
            </div>
          </details>
        </aside>
      <Card className="catalog-workspace" pad="large" gap={0}>
        <div className="catalog-tabs" role="tablist" aria-label="Catalog purchasing policy" onKeyDown={event => {
          const next = ['ArrowRight','ArrowLeft','Home','End'].includes(event.key) ? event.key === 'Home' ? 'core' : event.key === 'End' ? 'approval' : core ? 'approval' : 'core' : null
          if (!next || event.altKey || event.ctrlKey || event.metaKey) return
          event.preventDefault(); changeTab(next); event.currentTarget.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus()
        }}>{[['core','Approved Core Items'],['approval','Requires Approval']].map(([value,label]) => <button key={value} id={`catalog-tab-${value}`} data-tab={value} role="tab" type="button" aria-selected={filters.tab === value} aria-controls="catalog-panel" tabIndex={filters.tab === value ? 0 : -1} onClick={() => changeTab(value)}>{value === 'core' ? <CheckCircle size={18}/> : <Clock size={18}/>}<span>{label}</span><b>{uniqueCount(catalog.filter(item => item.core === (value === 'core')))}</b></button>)}</div>
        <div className="catalog-toolbar"><label className={`catalog-search ${keyboardNavigation ? 'keyboard-navigation' : ''}`} htmlFor="catalog-search"><MagnifyingGlass size={20}/><input id="catalog-search" type="search" autoComplete="off" name="catalog-search" value={filters.q} placeholder="Search by product name or SKU…" onChange={event => update({ q:event.target.value },true)}/><span className="sr-only">Search account catalog</span></label><div><label>Sort<select aria-label="Sort catalog" value={filters.sort} onChange={event => update({ sort:event.target.value })}><option value="recommended">Recommended</option><option value="name">Name A–Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label><div className="catalog-view" role="group" aria-label="Catalog view"><button aria-label="List view" aria-pressed={filters.view === 'list'} onClick={() => update({ view:'list' })}><List size={19}/></button><button aria-label="Grid view" aria-pressed={filters.view === 'grid'} onClick={() => update({ view:'grid' })}><SquaresFour size={19}/></button></div></div></div>
        <div className="catalog-results-bar"><div className="catalog-result-filters"><span role="status">{visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}</span>{filters.category !== 'all' && <button className="catalog-filter-chip" aria-label={`Clear ${filters.category} filter`} onClick={() => update({ category:'all' })}>{filters.category}<X size={13}/></button>}{filters.favorites && <button className="catalog-filter-chip" aria-label="Clear favorites filter" onClick={() => update({ favorites:false })}><Heart size={13}/>Favorites<X size={13}/></button>}</div>{!core && <span className="catalog-approval-note"><Clock size={14}/>Manager approval required at checkout</span>}</div>
        <div id="catalog-panel" role="tabpanel" aria-labelledby={`catalog-tab-${filters.tab}`} className={`catalog-products ${filters.view}`}>
          {!filtered.length ? <div className="catalog-state"><MagnifyingGlass size={32}/><h2>{catalog.length ? 'No products match these filters' : 'No products assigned yet'}</h2><p>{catalog.length ? 'Try another product name or SKU, or clear your category and favorites filters.' : 'Your account representative can help assign your eligible products.'}</p><div className="catalog-state-actions">{catalog.length ? <><Button onClick={() => update({ q:'',category:'all',favorites:false })}>Clear filters</Button>{otherMatches > 0 && <Button variant="primary" onClick={() => changeTab(core ? 'approval' : 'core')}>Search {core ? 'Requires Approval' : 'Approved Core Items'} ({otherMatches})</Button>}</> : <Button onClick={onSupport}>Contact your representative</Button>}</div></div> : visibleProducts.map(item => <article className="catalog-product" key={item.family || item.id}>
            <a className="catalog-image-link" href={detailHref(item)} aria-label={`View ${item.name}`}><ProductArt product={item}/></a>
            <div className="catalog-product-info"><div className="catalog-product-topline"><span className="catalog-sku">{item.id}</span>{favoriteButton(item)}</div><a className="catalog-product-name" href={detailHref(item)}>{item.name}</a>{item.family ? packChoices(item) : <p>{item.detail}</p>}{(!item.core || !item.available) && <div className="catalog-product-flags">{!item.core && policy(item)}{!item.available && <span className="catalog-unavailable">Currently unavailable</span>}</div>}</div>
            <div className="catalog-product-price"><strong>{money(item.price)}</strong><span>/ {item.unit}</span></div>{purchasing(item)}
          </article>)}
        </div>
        <div className="catalog-footnote"><Info size={17}/><p>Sample catalog, prices, and availability. Illustrations are used where product photos are unavailable. Official product data and documents will come from RCP. Tax and delivery are excluded.</p></div>
      </Card>
      </div>
      <div className="shop-help"><div><Package size={25}/><span><strong>Have a list of SKUs?</strong><p>Paste your list or upload a CSV. Review every matched item before adding it.</p></span></div><Button onClick={onQuickOrder}>Open SKU order<ArrowRight size={16}/></Button></div>
    </>}
    <div className="shop-cart-bar"><span><ShoppingCart size={21}/><span><strong>{locationName} location cart</strong><small>{count} {count === 1 ? 'unit' : 'units'} · {money(cartSubtotal)} item subtotal</small></span></span><Button variant="primary" onClick={onCart}>Review cart<ArrowRight size={16}/></Button></div>
  </section>
}
