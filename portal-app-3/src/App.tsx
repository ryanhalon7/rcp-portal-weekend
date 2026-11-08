import { useEffect, useRef, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpen, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardCheck, CreditCard, FileText, Heart, Home, MapPin, Menu, Minus, Package, Plus, Search, Settings2, ShoppingBag, ShoppingCart, Truck, X, Zap, ChartNoAxesCombined } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const products = [
  { id: 'RCP-1001', name: 'All-purpose cleaner', pack: '1 gallon · Case of 4', price: 64, image: 'apc-1.avif', unit: 'case' },
  { id: 'RCP-2040', name: 'Wash & wax concentrate', pack: '5 gallon · Pail', price: 89.5, image: 'wash-n-wax-1.avif', unit: 'pail' },
  { id: 'RCP-3102', name: 'Microfiber detailing towels', pack: '16 × 16 in · Pack of 12', price: 24, image: 'microfiber-towels.avif', unit: 'pack' },
  { id: 'RCP-1050', name: 'Streak-free glass cleaner', pack: '1 gallon · Case of 4', price: 48, image: 'glass-cleaner.avif', unit: 'case' },
]
const orders = [
  { id: '10528', date: 'Nov 5, 2026', amount: 420.5, status: 'In transit', items: '2 products', icon: Truck, lines: [{ id: 'RCP-1001', qty: 2 }, { id: 'RCP-2040', qty: 3 }] },
  { id: '10512', date: 'Nov 3, 2026', amount: 216, status: 'Processing', items: '2 products', icon: Package, lines: [{ id: 'RCP-3102', qty: 3 }, { id: 'RCP-1050', qty: 3 }] },
  { id: '10496', date: 'Oct 29, 2026', amount: 304, status: 'Delivered', items: '2 products', icon: CheckCheck, lines: [{ id: 'RCP-1001', qty: 4 }, { id: 'RCP-3102', qty: 2 }] },
]
type Cart = Record<string, number>
type Dialog = 'quick' | 'cart' | 'notifications' | 'credit' | 'approvals' | 'invoices' | 'help' | 'orders' | 'spend' | 'lists' | 'profile' | `order-${string}` | null
function CircleButton({ icon: Icon = ArrowUpRight, label, onClick, light = false }: { icon?: LucideIcon; label: string; onClick: () => void; light?: boolean }) {
  return <button className={`circle-button ${light ? 'light' : ''}`} aria-label={label} onClick={onClick}><Icon size={16} strokeWidth={1.4} /></button>
}
function TinyChart({ type }: { type: 'bars' | 'wave' | 'dots' | 'steps' }) {
  if (type === 'bars') return <div className="mini-bars" aria-hidden="true">{[15, 30, 22, 45, 34, 65, 50, 80, 58, 95].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
  if (type === 'dots') return <div className="mini-dots" aria-hidden="true">{[0,1,2,3,4].map(i => <i key={i} />)}</div>
  if (type === 'steps') return <svg className="mini-line" viewBox="0 0 110 45" aria-hidden="true"><path d="M2 38V28H25V20H48V25H70V12H92V4H108" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="92" cy="4" r="3" /></svg>
  return <svg className="mini-line" viewBox="0 0 110 45" aria-hidden="true"><path d="M1 37C12 37 8 16 20 23S30 45 40 14S54 5 60 26S72 40 79 17S91 34 108 26" fill="none" stroke="currentColor" strokeWidth=".8"/><circle cx="44" cy="8" r="2.4"/><circle cx="81" cy="14" r="2.4"/></svg>
}

export default function App() {
  const [location, setLocation] = useState(() => localStorage.getItem('rcp3-location') || 'Tampa, FL')
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [query, setQuery] = useState('')
  const [list, setList] = useState('frequent')
  const [period, setPeriod] = useState('November')
  const [qty, setQty] = useState<Cart>({})
  const [carts, setCarts] = useState<Record<string, Cart>>(() => { try { return JSON.parse(localStorage.getItem('rcp3-carts') || '{}') } catch { return {} } })
  const [toast, setToast] = useState('')
  const [skuInput, setSkuInput] = useState('')
  const [skuError, setSkuError] = useState('')
  const [read, setRead] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const cart = carts[location] || {}
  const total = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0)
  const count = Object.values(cart).reduce((a, b) => a + b, 0)
  useEffect(() => { localStorage.setItem('rcp3-carts', JSON.stringify(carts)) }, [carts])
  useEffect(() => { localStorage.setItem('rcp3-location', location) }, [location])
  useEffect(() => {
    if (dialog) { if (!dialogRef.current?.open) previousFocus.current = document.activeElement as HTMLElement; dialogRef.current?.showModal() }
    else { dialogRef.current?.close(); previousFocus.current?.focus() }
  }, [dialog])
  useEffect(() => {
    const sidebar = document.getElementById('sidebar')!
    const media = window.matchMedia('(max-width: 760px)')
    const sync = () => { sidebar.inert = media.matches && !navOpen }
    sync(); media.addEventListener('change', sync)
    if (navOpen) sidebar.querySelector<HTMLAnchorElement>('a')?.focus()
    const trap = (event: KeyboardEvent) => {
      if (!navOpen || !media.matches || event.key !== 'Tab') return
      const controls = Array.from(sidebar.querySelectorAll<HTMLElement>('a, button:not(:disabled)'))
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => { media.removeEventListener('change', sync); document.removeEventListener('keydown', trap) }
  }, [navOpen])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 4000); return () => clearTimeout(t) } }, [toast])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); document.getElementById('product-search')?.focus() } if (e.key === 'Escape') { setLocationOpen(false); setNavOpen(false) } }
    document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler)
  }, [])
  function add(lines: Cart) {
    setCarts(prev => { const next = { ...(prev[location] || {}) }; Object.entries(lines).forEach(([id, quantity]) => { next[id] = (next[id] || 0) + quantity }); return { ...prev, [location]: next } })
    setToast(`Added to your ${location.split(',')[0]} location cart`)
  }
  function updateCart(id: string, delta: number) { setCarts(prev => ({ ...prev, [location]: { ...cart, [id]: Math.max(0, (cart[id] || 0) + delta) } })) }
  function submitSkus() {
    const lines: Cart = {}; const errors: string[] = []
    skuInput.trim().split('\n').forEach((row, i) => { const parts = row.trim().split(/[\s,]+/); const product = products.find(p => p.id === parts[0]?.toUpperCase()); const amount = Number(parts[1] || 1); if (!product || !Number.isSafeInteger(amount) || amount < 1 || amount > 999) errors.push(`Row ${i+1}: enter a listed SKU and a whole quantity from 1–999.`); else lines[product.id] = (lines[product.id] || 0) + amount })
    if (errors.length) { setSkuError(errors.join('\n')); return }
    add(lines); setSkuInput(''); setSkuError(''); setDialog('cart')
  }
  const visibleProducts = products.filter(p => (list !== 'saved' || ['RCP-1001','RCP-3102','RCP-1050'].includes(p.id)) && `${p.name} ${p.id}`.toLowerCase().includes(query.toLowerCase()))
  const selectedOrder = orders.find(o => `order-${o.id}` === dialog)
  const metrics: { title: string; value: string; sub: string; icon: LucideIcon; type: 'bars' | 'wave' | 'dots' | 'steps'; target: Dialog; feature?: boolean }[] = [
    { title: 'Available credit', value: '$18,450', sub: 'of $25,000', icon: CreditCard, type: 'dots', target: 'credit', feature: true },
    { title: 'Open orders', value: '02', sub: 'on their way', icon: Package, type: 'steps', target: 'orders' },
    { title: 'Awaiting approval', value: '01', sub: '$144.00', icon: ClipboardCheck, type: 'wave', target: 'approvals' },
    { title: 'Open invoices', value: '03', sub: '$2,340.00', icon: FileText, type: 'bars', target: 'invoices' },
    { title: 'Saved lists', value: '04', sub: 'ready to reorder', icon: Heart, type: 'wave', target: 'lists' },
    { title: 'Account terms', value: '30', sub: 'days net', icon: CheckCheck, type: 'dots', target: 'credit' },
  ]
  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to dashboard</a>
    {navOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)} />}
    <aside id="sidebar" className={`sidebar ${navOpen ? 'is-open' : ''}`}>
      <a href="#" className="brand" aria-label="RCP America home"><img src="/assets/RCP SIMPLE BLACK 1.png" alt="RCP America"/><span>PARTNER PORTAL</span></a>
      <div className="account-tag"><span className="account-avatar">CW</span><div><strong>Camping World</strong><span>Wholesale partner</span></div><span className="connected-dot" /></div>
      <span className="nav-label">WORKSPACE</span>
      <nav aria-label="Main navigation">
        <button className="nav-item selected" onClick={() => { setNavOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-current="page"><Home size={18}/><span>Overview</span><span className="active-dot"/></button>
        {[{ icon: ShoppingBag, name: 'Shop products' }, { icon: Heart, name: 'Lists & reorder' }, { icon: Package, name: 'Orders & invoices' }, { icon: FileText, name: 'Quotes' }].map(({icon: Icon,name}) => <button key={name} className="nav-item" disabled title="Planned for a future screen"><Icon size={18}/><span>{name}</span></button>)}
        <span className="nav-label manage-label">MANAGE</span>
        {[{ icon: ClipboardCheck, name: 'Approvals', badge: '1' }, { icon: ChartNoAxesCombined, name: 'Reports' }, { icon: CreditCard, name: 'Account & credit' }, { icon: BookOpen, name: 'Resources' }].map(({icon: Icon,name,badge}) => <button key={name} className="nav-item" disabled title="Planned for a future screen"><Icon size={18}/><span>{name}</span>{badge && <span className="nav-count">{badge}</span>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="rep-card"><span className="rep-orbit"><CircleHelp size={21} strokeWidth={1.1}/></span><strong>A real person.<br/>Right here for you.</strong><p>Your RCP team is a click away.</p><button onClick={() => setDialog('help')}>Get in touch <ArrowUpRight size={14}/></button></div><button className="profile" onClick={() => setDialog('profile')}><span className="profile-avatar">JD</span><span><strong>Jamie Davis</strong><small>Purchasing manager</small></span><Settings2 size={16}/></button></div>
    </aside>
    <div className="workspace">
      <div className="overview-zone">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" aria-expanded={navOpen} aria-controls="sidebar" onClick={() => setNavOpen(true)}><Menu size={21}/></button>
          <div className="location-wrap"><button className="location-button" aria-expanded={locationOpen} onClick={() => setLocationOpen(!locationOpen)}><MapPin size={17}/><span><small>ORDERING FOR</small><strong>{location}</strong></span><ChevronDown size={14}/></button>
          {locationOpen && <><button className="popover-dismiss" aria-label="Close location selector" onClick={() => setLocationOpen(false)}/><div className="location-popover"><strong>Choose your location</strong><label className="location-search"><Search size={15}/><input aria-label="Search locations" placeholder="Search locations…" value={locationSearch} onChange={e => setLocationSearch(e.target.value)}/></label><p>Each location has its own shared cart.</p>{['Tampa, FL','Orlando, FL','Jacksonville, FL'].filter(l => l.toLowerCase().includes(locationSearch.toLowerCase())).map(l => <button key={l} onClick={() => { setLocation(l); setLocationOpen(false); setLocationSearch('') }}><MapPin size={16}/>{l}{l === location && <Check size={16}/>}</button>)}{!['Tampa, FL','Orlando, FL','Jacksonville, FL'].some(l => l.toLowerCase().includes(locationSearch.toLowerCase())) && <p>No matching locations.</p>}</div></>}</div>
          <label className="global-search"><Search size={17}/><input id="product-search" placeholder="Search products or SKU…" aria-label="Search products or SKU" value={query} onChange={e => { setQuery(e.target.value); document.getElementById('reorder')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }}/><kbd>⌘ K</kbd></label>
          <div className="header-actions"><button className="icon-button notifications" aria-label="Notifications" onClick={() => setDialog('notifications')}><Bell size={18}/>{!read && <i/>}</button><button className="quick-button" aria-label="Quick order" onClick={() => setDialog('quick')}><Zap size={16}/><span>Quick order</span></button><button className="cart-button" aria-label={`Location cart, ${count} units, ${money(total)}`} onClick={() => setDialog('cart')}><ShoppingCart size={17}/><span>{money(total)}</span><b>{count}</b></button></div>
        </header>
        <main id="main">
          <label className="mobile-product-search"><Search size={16}/><input aria-label="Find a product or SKU" placeholder="Find a product or SKU…" value={query} onChange={e => setQuery(e.target.value)}/>{query && <button aria-label="Clear mobile search" onClick={() => setQuery('')}><X size={16}/></button>}</label>
          <div className="page-heading"><div className="breadcrumb">Your workspace, in focus <span>↗</span></div><div className="heading-row"><h1>Good morning, Jamie<span>.</span></h1><span className="today">Saturday, November 7, 2026</span></div><p>Stocked up. On track. Ready for what’s next.</p></div>
          <section className="dashboard-grid" aria-label="Account overview">
            <div className="spend-summary"><div className="section-top"><h2>Your month at a glance</h2><div className="month-switch"><button aria-label="Previous month" onClick={() => setPeriod(period === 'November' ? 'October' : 'November')}><ChevronLeft size={13}/></button><span>{period}</span><button aria-label="Next month" disabled={period === 'November'} onClick={() => setPeriod('November')}><ChevronRight size={13}/></button></div></div>
              <div className="spend-main"><div className="spend-amount"><span className="eyebrow">TOTAL SPEND</span><strong>{period === 'November' ? '$4,280' : '$6,120'}<small>.00</small></strong><span className="spend-change"><ArrowDownRight size={13}/> 12.8% <span>vs. same period last month</span></span></div><div className="gauge"><svg viewBox="0 0 170 110" aria-label="68 percent of spend on approved core items" role="img"><path className="gauge-track" d="M15 92a70 70 0 0 1 140 0"/><path className="gauge-fill" d="M15 92a70 70 0 0 1 140 0" pathLength="100" strokeDasharray="68 100"/><path d="M85 92l36-53" stroke="currentColor" strokeWidth="1"/><circle cx="85" cy="92" r="3"/></svg><span><b>68%</b> core items</span></div></div>
              <div className="spend-key"><span><i/>Approved core <b>{period === 'November' ? '$2,910.40' : '$4,161.60'}</b></span><span><i/>Other spend <b>{period === 'November' ? '$1,369.60' : '$1,958.40'}</b></span></div>
              <div className="summary-bottom"><div><span className="outline-icon"><ShoppingBag size={16}/></span><span>Orders this month<strong>{period === 'November' ? '06' : '09'}</strong></span></div><CircleButton label="View spend breakdown" onClick={() => setDialog('spend')}/></div>
            </div>
            <div className="metric-grid">{metrics.map(({title,value,sub,icon: Icon,type,target,feature}) => <article key={title} className={`metric-card ${feature ? 'credit-feature' : ''}`}><div className="metric-top"><span className="outline-icon"><Icon size={16} strokeWidth={1.25}/></span><CircleButton light={feature} label={`View ${title.toLowerCase()}`} onClick={() => setDialog(target)}/></div><h2>{title}</h2><div className="metric-bottom"><div className="metric-number"><strong>{value}</strong><span>{sub}</span></div><TinyChart type={type}/></div></article>)}</div>
          </section>
          <div className="attention-strip"><span className="attention-icon"><ClipboardCheck size={16}/></span><p><strong>One request is waiting for approval.</strong> Your core items can keep moving.</p><button onClick={() => setDialog('approvals')}>View request <ArrowRight size={15}/></button></div>
        </main>
      </div>
      <section className="activity-zone" aria-label="Ordering workspace">
        <div className="reorder-panel" id="reorder"><div className="dark-section-heading"><div><span className="eyebrow">LESS ADMIN. MORE MOMENTUM.</span><h2>Your next order starts here<span>.</span></h2></div><CircleButton label="Open quick order" onClick={() => setDialog('quick')}/></div>
          <div className="reorder-toolbar"><div className="tab-group" role="tablist" aria-label="Reorder source"><button role="tab" aria-selected={list === 'frequent'} className={list === 'frequent' ? 'active' : ''} onClick={() => setList('frequent')}>Frequently ordered</button><button role="tab" aria-selected={list === 'saved'} className={list === 'saved' ? 'active' : ''} onClick={() => setList('saved')}>Bay essentials <Heart size={12}/></button></div><span className="core-label"><Check size={12}/> Approved core</span></div>
          <div className="product-list">{visibleProducts.map(p => <div className="product-row" key={p.id}><div className="product-photo"><img src={`/images/${p.image}`} alt={p.name}/></div><div className="product-info"><strong>{p.name}</strong><span>{p.pack}</span><small>{p.id}</small></div><div className="product-price">{money(p.price)}<small>/ {p.unit}</small></div><div className="quantity-stepper"><button aria-label={`Decrease ${p.name} quantity`} disabled={(qty[p.id] || 1) <= 1} onClick={() => setQty({ ...qty, [p.id]: Math.max(1, (qty[p.id] || 1) - 1) })}><Minus size={12}/></button><span aria-label={`${p.name} quantity`}>{qty[p.id] || 1}</span><button aria-label={`Increase ${p.name} quantity`} disabled={(qty[p.id] || 1) >= 999} onClick={() => setQty({ ...qty, [p.id]: (qty[p.id] || 1) + 1 })}><Plus size={12}/></button></div><button className="add-product" aria-label={`Add ${p.name} to cart`} onClick={() => add({ [p.id]: qty[p.id] || 1 })}><Plus size={16}/></button></div>)}{!visibleProducts.length && <div className="empty-state"><Search size={25}/><strong>No matching products</strong><p>Try a product name or SKU.</p><button onClick={() => setQuery('')}>Clear search</button></div>}</div>
          <div className="reorder-footer"><span>Account pricing. The essentials you know.</span><button onClick={() => setDialog('quick')}>Order by SKU <ArrowUpRight size={14}/></button></div>
        </div>
        <div className="orders-panel"><div className="dark-section-heading"><div><span className="eyebrow">FROM OUR DOOR TO YOURS</span><h2>Recent orders <sup>03</sup></h2></div><CircleButton label="View recent orders" onClick={() => setDialog('orders')}/></div><div className="order-list">{orders.map(o => <button key={o.id} className="order-row" onClick={() => setDialog(`order-${o.id}`)}><span className="order-icon"><o.icon size={18} strokeWidth={1.2}/></span><span className="order-info"><strong>#{o.id}<span className={`status ${o.status.toLowerCase().replace(' ','-')}`}>{o.status}</span></strong><small>{o.date} <i/> {o.items}</small></span><span className="order-total">{money(o.amount)}<ArrowUpRight size={14}/></span></button>)}</div><div className="delivery-note"><Truck size={19} strokeWidth={1.2}/><div><strong>A little visibility goes a long way.</strong><p>Open an order for its latest status and details.</p></div></div><div className="orders-foot"><span className="connected-dot"/> Ordering for {location}<span>Shared location cart</span></div></div>
      </section>
      <footer className="page-footer"><span>RCP AMERICA <i/> Built around your business.</span><span>Edition 03 · Interactive preview · Sample data</span></footer>
    </div>
    <div className="toast" role="status" aria-live="polite">{toast && <><Check size={17}/>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15}/></button></>}</div>
    <dialog ref={dialogRef} onCancel={() => setDialog(null)} onClick={e => { if (e.target === e.currentTarget) setDialog(null) }} aria-labelledby="dialog-title">
      <div className="dialog-body"><div className="dialog-heading"><span className="eyebrow">{location} · PREVIEW</span><button className="icon-button" aria-label="Close dialog" onClick={() => setDialog(null)}><X size={20}/></button></div>
        <h2 id="dialog-title">{selectedOrder ? `Order #${selectedOrder.id}` : ({quick:'Quick order',cart:'Your location cart',notifications:'Your updates',credit:'Account & credit',approvals:'Awaiting approval',invoices:'Open invoices',help:'Your RCP team',orders:'Recent orders',spend:`${period} spend`,lists:'Your saved lists',profile:'Your workspace profile'} as Record<string,string>)[dialog || '']}</h2>
        {dialog === 'quick' && <><p>Add essentials by SKU. Use one SKU and quantity per line.</p><label className="field-label" htmlFor="skus">SKU, quantity</label><textarea id="skus" value={skuInput} onChange={e => { setSkuInput(e.target.value); setSkuError('') }} placeholder={'RCP-1001, 2\nRCP-3102, 1'} rows={5}/>{skuError && <p className="form-error" role="alert">{skuError}</p>}<details><summary>Available SKUs in this preview</summary>{products.map(p => <p key={p.id}><b>{p.id}</b> · {p.name} · {money(p.price)}</p>)}</details><button className="primary-button" disabled={!skuInput.trim()} onClick={submitSkus}>Add to location cart <ArrowRight size={16}/></button></>}
        {dialog === 'cart' && <><p>Shared cart for {location}. Items stay with this location when you switch.</p>{count ? <>{products.filter(p => cart[p.id]).map(p => <div className="cart-line" key={p.id}><img src={`/images/${p.image}`} alt=""/><div><strong>{p.name}</strong><small>{money(p.price)} / {p.unit}</small><div className="quantity-stepper"><button aria-label={`Remove one ${p.name}`} onClick={() => updateCart(p.id, -1)}><Minus size={12}/></button><span>{cart[p.id]}</span><button aria-label={`Add one ${p.name}`} onClick={() => updateCart(p.id, 1)}><Plus size={12}/></button></div></div><b>{money(p.price * cart[p.id])}</b></div>)}<div className="dialog-total"><span>Item subtotal</span><strong>{money(total)}</strong></div><p className="preview-note">All items are approved core. Tax and delivery are calculated at checkout. Checkout will be added in a future screen.</p></> : <div className="empty-state"><ShoppingCart size={32}/><strong>A fresh start for your next order.</strong><p>Add your essentials from the dashboard or enter a SKU.</p><button className="primary-button" onClick={() => setDialog('quick')}>Start a quick order</button></div>}</>}
        {dialog === 'orders' && <><p>Latest sample orders for {location}.</p>{orders.map(o => <button className="dialog-row" key={o.id} onClick={() => setDialog(`order-${o.id}`)}><span><b>#{o.id}</b><small>{o.date} · {o.status}</small></span><b>{money(o.amount)}</b><ChevronRight size={16}/></button>)}</>}
        {selectedOrder && <><p>{selectedOrder.date} · {location}</p><div className="order-detail-status"><selectedOrder.icon size={22}/><strong>{selectedOrder.status}</strong></div><p>{selectedOrder.status === 'In transit' ? 'Your order has shipped. Carrier tracking is not connected in this preview.' : selectedOrder.status === 'Processing' ? 'Your order is being prepared.' : 'This order has been delivered.'}</p>{selectedOrder.lines.map(line => { const p = products.find(p => p.id === line.id)!; return <div className="dialog-row" key={p.id}><span><b>{p.name}</b><small>{line.qty} {p.unit}{line.qty > 1 ? 's' : ''} · {p.id}</small></span><b>{money(p.price*line.qty)}</b></div> })}<div className="dialog-total"><span>Items</span><strong>{money(selectedOrder.lines.reduce((s,l) => s + products.find(p => p.id === l.id)!.price*l.qty,0))}</strong></div><p className="preview-note">Reorder uses the sample catalog’s current prices. Tax and delivery are excluded.</p><button className="primary-button" onClick={() => { add(Object.fromEntries(selectedOrder.lines.map(l => [l.id,l.qty]))); setDialog('cart') }}>Reorder these items <ArrowRight size={16}/></button></>}
        {dialog === 'credit' && <><p>Camping World · Example account terms</p><div className="credit-balance"><small>Available credit</small><strong>$18,450.00</strong></div><div className="dialog-row"><span>Credit limit</span><b>$25,000.00</b></div><div className="dialog-row"><span>Receivables</span><b>$2,340.00</b></div><div className="dialog-row"><span>Uninvoiced commitments</span><b>$4,210.00</b></div><div className="dialog-row"><span>Payment terms</span><b>Net 30 days</b></div><p className="preview-note">Illustrative balances only. Live credit reconciliation and finance requests are planned.</p></>}
        {dialog === 'approvals' && <><p>Off-list items require customer approval on every purchase.</p><div className="request-card"><span className="status processing">Pending approval</span><h3>Non-acid wheel cleaner</h3><p>RCP-4025 · 2 cases × $72.00</p><strong>$144.00</strong><small>Requested by Jamie Davis · Nov 6, 2026</small></div><p className="preview-note">Your approved core items can proceed separately. Approval decisions will be available in the approvals screen.</p></>}
        {dialog === 'invoices' && <><p>Three sample invoices · $2,340.00 outstanding</p>{[{id:'INV-9028',date:'Due Nov 15',amount:840},{id:'INV-9016',date:'Due Nov 21',amount:1020},{id:'INV-9004',date:'Due Nov 28',amount:480}].map(i => <div className="dialog-row" key={i.id}><span><b>{i.id}</b><small>{i.date}, 2026</small></span><b>{money(i.amount)}</b></div>)}<p className="preview-note">Invoice files and payments are not connected in this dashboard preview.</p></>}
        {dialog === 'spend' && <><p>{period} 2026 · {location} · Illustrative data</p><div className="dialog-row"><span>Approved core items</span><b>{period === 'November' ? '$2,910.40' : '$4,161.60'}</b></div><div className="dialog-row"><span>Requires approval</span><b>{period === 'November' ? '$820.00' : '$1,200.00'}</b></div><div className="dialog-row"><span>Unclassified items</span><b>{period === 'November' ? '$240.00' : '$350.00'}</b></div><div className="dialog-row"><span>Tax & delivery</span><b>{period === 'November' ? '$309.60' : '$408.40'}</b></div><div className="dialog-total"><span>Total spend</span><strong>{period === 'November' ? '$4,280.00' : '$6,120.00'}</strong></div><p className="preview-note">November is a partial month. The 12.8% change compares the same elapsed days of each month. Tampa’s historical data is incomplete; figures are placeholders for visual review.</p></>}
        {dialog === 'lists' && <><p>Repeat the routine. Keep your quantities flexible.</p>{['Bay essentials','Weekly wash supplies','Detailing team','Monthly restock'].map((name,i) => <div className="dialog-row" key={name}><span><b>{name}</b><small>{i === 0 ? '3 products · Available in this preview' : 'Sample list · Contents coming later'}</small></span>{i === 0 && <button className="icon-button" aria-label="Show Bay essentials" onClick={() => { setList('saved'); setQuery(''); setDialog(null); document.getElementById('reorder')?.scrollIntoView({ behavior: 'smooth' }) }}><ArrowRight size={18}/></button>}</div>)}</>}
        {dialog === 'notifications' && <><p>Latest activity for your location.</p><div className="dialog-row"><Truck size={20}/><span><b>Order #10528 is on its way</b><small>Sample shipment update · Nov 6</small></span></div><div className="dialog-row"><ClipboardCheck size={20}/><span><b>One request awaits approval</b><small>Non-acid wheel cleaner · $144.00</small></span></div><button className="primary-button" disabled={read} onClick={() => { setRead(true); setToast('All updates marked as read') }}>{read ? 'All caught up' : 'Mark all as read'} <CheckCheck size={16}/></button></>}
        {dialog === 'help' && <><p>Product questions, ordering help, or something else? Your account team can help.</p><div className="request-card"><CircleHelp size={28}/><h3>Your RCP account representative</h3><p>Contact details will appear here when your account is connected.</p></div><p className="preview-note">This is a local design preview. Messages are not sent from this screen.</p></>}
        {dialog === 'profile' && <><div className="profile-detail"><span className="profile-avatar">JD</span><div><h3>Jamie Davis</h3><p>Purchasing manager · Camping World</p></div></div><div className="dialog-row"><span>Current location</span><b>{location}</b></div><div className="dialog-row"><span>Access</span><b>Buyer</b></div><p className="preview-note">Profile and permission management will be added in a future screen.</p></>}
      </div>
    </dialog>
  </div>
}
