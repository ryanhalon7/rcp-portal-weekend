import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Moon, Sun } from '@phosphor-icons/react'
import { House, SquaresFour, ArrowsClockwise, Receipt, ChatCenteredText, BookOpen, CaretDown, CaretRight, ArrowRight, Plus, Minus, MagnifyingGlass, ShoppingCart, Bell, Question, GearSix, SignOut, Lightning, MapPin, ArrowUpRight, Package, Truck, Clock, Check, X, List, FileText, EnvelopeSimple, Phone, CalendarBlank, Funnel, DownloadSimple, Drop, Flask, Broom, Star, CheckCircle, Info, ArrowSquareOut } from '@phosphor-icons/react'
import { Button, type ButtonProps } from './vendor/stageshow/controls/Button'
import { Badge } from './vendor/stageshow/controls/Badge'
import { Row } from './vendor/stageshow/parts/Row'
import { Card } from './vendor/stageshow/parts/Card'
import { Avatar } from './vendor/stageshow/parts/Avatar'
import { LookContext } from './vendor/stageshow/looks'
import SpendOverview from './SpendOverview'
import ProductPhoto from './components/ProductPhoto'
import Stepper, { Step } from './components/react-bits/Stepper'
import AnimatedList from './components/react-bits/AnimatedList'
import { products, money, orderable, type Product, type Line } from './catalog'
import { historyHref } from './history-route'
import { orders, type Order } from './orders'
import { usePortalRoute, shopHref, listsHref } from './shop-route'
const Shop = lazy(() => import('./Shop'))
const Lists = lazy(() => import('./Lists'))
const OrderHistory = lazy(() => import('./OrderHistory'))

const locations = [{ id: 'tampa', name: 'Tampa, FL', code: 'CW-018', street: 'Camping World · Tampa' }, { id: 'orlando', name: 'Orlando, FL', code: 'CW-024', street: 'Camping World · Orlando' }, { id: 'jacksonville', name: 'Jacksonville, FL', code: 'CW-032', street: 'Camping World · Jacksonville' }]
function read<T,>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback } }
function Action(props: ButtonProps) { return <Button {...props}/> }
function IconButton({ label, children, onClick, className = '' }: { label: string; children: ReactNode; onClick: () => void; className?: string }) { return <button className={`icon-button ${className}`} aria-label={label} title={label} onClick={onClick}>{children}</button> }
function SectionTitle({ title, sub, action, onClick }: { title: string; sub?: string; action?: string; onClick?: () => void }) { return <div className="section-title"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>{action && <button className="text-link" onClick={onClick}>{action}<ArrowRight size={15}/></button>}</div> }
function ProductIcon({ product }: { product: Product }) { const Icon = product.icon; return <span className={`product-image ${product.color} ${product.photo ? 'has-photo' : ''}`}><ProductPhoto product={product} fallback={<Icon size={27} weight="regular"/>}/></span> }

function ReorderTabs({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const values = ['frequent', 'saved']
  return <div className="tab-list" role="tablist" aria-label="Reorder lists" onKeyDown={event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    const current = values.indexOf(value)
    const next = event.key === 'ArrowRight' ? (current + 1) % values.length : event.key === 'ArrowLeft' ? (current - 1 + values.length) % values.length : event.key === 'Home' ? 0 : event.key === 'End' ? values.length - 1 : null
    if (next === null) return
    event.preventDefault()
    onChange(values[next])
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }}>
    {values.map((item, index) => <button key={item} type="button" id={`reorder-tab-${item}`} role="tab" aria-selected={value === item} aria-controls="reorder-panel" tabIndex={value === item ? 0 : -1} onClick={() => onChange(item)} className={value === item ? 'selected' : ''}>{index === 0 ? 'Frequently ordered' : <>Saved list<span>3</span></>}</button>)}
  </div>
}

function QuickOrder({ theme, locationName, onCancel, onAdd }: { theme: 'light' | 'dark'; locationName: string; onCancel: () => void; onAdd: (lines: Line[]) => void }) {
  const [quickText, setQuickText] = useState('')
  const [quickErrors, setQuickErrors] = useState<string[]>([])
  const [quickPreview, setQuickPreview] = useState<Line[]>([])
  const [step, setStep] = useState(1)
  const skuInputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { if (quickErrors.length) skuInputRef.current?.focus() }, [quickErrors])
  const validateQuick = () => {
    const errors: string[] = []; const lines: Line[] = []
    quickText.split(/\r?\n/).filter(l => l.trim()).forEach((line, i) => { const [sku, qty = '1', ...extra] = line.trim().split(/[,\t ]+/); const product = products.find(p => p.id.toLowerCase() === sku.toLowerCase()); const quantity = Number(qty); if (!product) errors.push(`Row ${i + 1}: “${sku}” is not in this location’s catalog.`); else if (!product.available) errors.push(`Row ${i + 1}: this product is currently unavailable.`); else if (extra.length || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999) errors.push(`Row ${i + 1}: enter a whole quantity between 1 and 999.`); else { const found = lines.find(l => l.id === product.id); if (found) { found.quantity += quantity; if (found.quantity > 999) errors.push(`Row ${i + 1}: combined quantity exceeds 999.`) } else lines.push({ id: product.id, quantity }) } })
    if (!quickText.trim()) errors.push('Enter at least one SKU and quantity.')
    setQuickErrors(errors); setQuickPreview(errors.length ? [] : lines)
    if (!errors.length) setStep(2)
  }
  const downloadTemplate = () => { const url = URL.createObjectURL(new Blob(['sku,quantity\nRCP-1001,1\nRCP-2040,2\n'], { type: 'text/csv' })); const a = document.createElement('a'); a.href = url; a.download = 'rcp-quick-order-template.csv'; a.click(); URL.revokeObjectURL(url) }
  return <Stepper className="quick-order-stepper" step={step} onStepChange={setStep} theme={theme} accentColor="var(--brand-strong)" frame={false} width="100%" radius={10} linear disableStepIndicators showFooter={false} transition="fade">
    <Step title="Enter items">
      <p id="quick-order-hint">Paste SKUs and quantities, one product per line. We’ll check your list before adding anything.</p><label className="field-label" htmlFor="sku-list">SKU, quantity</label><textarea ref={skuInputRef} id="sku-list" name="sku-list" spellCheck={false} aria-invalid={quickErrors.length > 0 || undefined} aria-describedby={quickErrors.length ? "quick-order-hint quick-order-errors" : "quick-order-hint"} value={quickText} onChange={e => { setQuickText(e.target.value); setQuickPreview([]); setQuickErrors([]) }} placeholder={'RCP-1001, 2\nRCP-2040, 1'} rows={5}/><div className="quick-tools"><button className="text-link" onClick={downloadTemplate}><DownloadSimple size={15}/>CSV template</button><label className="upload-label">Import CSV<input type="file" accept=".csv,text/csv" onChange={e => { const file = e.target.files?.[0]; if (file) file.text().then(text => { setQuickText(text.replace(/^sku,quantity\r?\n/i, '')); setQuickErrors([]); setQuickPreview([]) }).catch(() => setQuickErrors(['This file could not be read. Paste the contents instead.'])) }}/></label></div><div aria-live="polite">{quickErrors.length > 0 && <div className="error-message" id="quick-order-errors">{quickErrors.map(err => <p key={err}>{err}</p>)}</div>}</div>
      <div className="modal-actions"><Action onClick={onCancel}>Cancel</Action><Action variant="primary" onClick={validateQuick}>Review items<ArrowRight size={15}/></Action></div>
    </Step>
    <Step title="Review items">
      <p>Check quantities and account pricing for {locationName} before adding these items to your cart.</p>
      {quickPreview.length > 0 && <div className="preview-list"><strong>{quickPreview.length} products matched</strong>{quickPreview.map(l => { const p = products.find(p => p.id === l.id)!; return <Row key={l.id} title={p.name} subtitle={p.core ? 'Approved core item' : 'Requires approval on every purchase'}><span>{l.quantity} × {money(p.price)}</span></Row> })}</div>}
      <div className="cart-total"><span>Item subtotal</span><strong>{money(quickPreview.reduce((sum, line) => sum + products.find(p => p.id === line.id)!.price * line.quantity, 0))}</strong></div>
      <p className="muted">Tax and delivery are calculated at checkout. Items marked for approval still require approval.</p>
      <div className="modal-actions"><Action onClick={() => setStep(1)}>Edit list</Action><Action variant="primary" onClick={() => onAdd(quickPreview)}>Add matched items to cart</Action></div>
    </Step>
  </Stepper>
}

export default function App() {
  const route = usePortalRoute()
  const shopRouteRef = useRef('#/shop')
  if (route.screen === 'shop') shopRouteRef.current = shopHref({ ...route.filters,product:'',returnTo:'' })
  const previousScreen = useRef(route.screen)
  useEffect(() => {
    document.title = route.screen === 'shop' ? 'Shop · RCP America' : route.screen === 'lists' ? 'Lists & reorder · RCP America' : route.screen === 'orders' ? 'Orders & invoices · RCP America' : 'Home · RCP America'
    if (previousScreen.current === route.screen) return
    previousScreen.current = route.screen
    window.scrollTo(0,0)
    const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus())
    return () => cancelAnimationFrame(frame)
  }, [route.screen])
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = read<unknown>('rcp-v2-theme', null)
    return saved === 'dark' ? 'dark' : 'light'
  })
  useEffect(() => {
    localStorage.setItem('rcp-v2-theme', JSON.stringify(theme))
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#102b35' : '#eff9fc')
  }, [theme])
  const [locationId, setLocationId] = useState(() => read('rcp-v2-location', 'tampa'))
  const location = locations.find(l => l.id === locationId) || locations[0]
  const [carts, setCarts] = useState<Record<string, Line[]>>(() => read('rcp-v2-carts', {}))
  const cart = carts[location.id] || []
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [list, setList] = useState('frequent')
  const [query, setQuery] = useState('')
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const [modal, setModal] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order>(orders[0])
  const [notice, setNotice] = useState('')
  const [period, setPeriod] = useState('30')
  const [status, setStatus] = useState('All orders')
  const [readNotifications, setReadNotifications] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const locationTriggerRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!navOpen) return
    const sidebar = document.querySelector<HTMLElement>('.sidebar')
    const workspace = document.querySelector<HTMLElement>('.workspace')
    const trigger = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    const desktop = window.matchMedia('(min-width: 761px)')
    const closeOnDesktop = () => { if (desktop.matches) setNavOpen(false) }
    desktop.addEventListener('change', closeOnDesktop)
    const wasInert = workspace?.inert ?? false
    document.body.style.overflow = 'hidden'
    if (workspace) workspace.inert = true
    sidebar?.querySelector<HTMLButtonElement>('.drawer-close')?.focus()
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !sidebar) return
      const nodes = [...sidebar.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),[tabindex="0"]')].filter(el => el.getClientRects().length)
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    sidebar?.addEventListener('keydown', trap)
    return () => { desktop.removeEventListener('change', closeOnDesktop); sidebar?.removeEventListener('keydown', trap); if (workspace) workspace.inert = wasInert; document.body.style.overflow = overflow; if (trigger?.getClientRects().length) trigger.focus() }
  }, [navOpen])
  useEffect(() => { localStorage.setItem('rcp-v2-location', JSON.stringify(location.id)) }, [location.id])
  useEffect(() => { localStorage.setItem('rcp-v2-carts', JSON.stringify(carts)) }, [carts])
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timer) }, [notice])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && route.screen !== 'lists') { e.preventDefault(); if (route.screen === 'shop') document.getElementById('catalog-search')?.focus(); else if (route.screen === 'orders') document.getElementById('history-search')?.focus(); else searchRef.current?.focus() }
      if (e.key === 'Escape') { setModal(null); setLocationOpen(false); setLocationQuery(''); setNavOpen(false); setProfileOpen(false); if (locationOpen) locationTriggerRef.current?.focus() }
    }
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler)
  }, [locationOpen,route.screen])
  useEffect(() => {
    if (!modal) return
    previousFocus.current = document.activeElement as HTMLElement
    const timeout = setTimeout(() => modalRef.current?.querySelector<HTMLElement>('button, input, textarea, [tabindex="0"]')?.focus(), 20)
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { clearTimeout(timeout); document.body.style.overflow = previousOverflow; previousFocus.current?.focus() }
  }, [modal])
  const total = cart.reduce((sum, line) => sum + products.find(p => p.id === line.id)!.price * line.quantity, 0)
  const count = cart.reduce((sum, line) => sum + line.quantity, 0)
  const displayProducts = (list === 'saved' ? products.filter(p => p.core).slice(0, 3) : products.slice(0, 4)).filter(p => `${p.name} ${p.id}`.toLowerCase().includes(query.toLowerCase()))
  const filteredOrders = (period === '7' ? orders.slice(0, 3) : orders).filter(o => status === 'All orders' || o.status === status)
  const filteredLocations = locations.filter(l => `${l.name} ${l.code}`.toLowerCase().includes(locationQuery.toLowerCase()))
  const closeLocations = () => { setLocationOpen(false); setLocationQuery(''); locationTriggerRef.current?.focus() }
  const addLines = (lines: Line[]) => {
    const combined = new Map<string,number>()
    for (const line of lines) combined.set(line.id,(combined.get(line.id) || 0)+line.quantity)
    if (!lines.length || lines.some(line => !Number.isSafeInteger(line.quantity) || line.quantity < 1) || [...combined].some(([id,quantity]) => !orderable(products.find(p => p.id === id)) || quantity+(cart.find(line => line.id === id)?.quantity || 0) > 999)) {
      setNotice('No items added. Check product availability and the maximum of 999 purchasing units per product in your cart.')
      return false
    }
    setCarts(old => { const next = [...(old[location.id] || [])].map(l => ({ ...l })); lines.forEach(line => { const existing = next.find(l => l.id === line.id); if (existing) existing.quantity += line.quantity; else next.push({ ...line }) }); return { ...old, [location.id]: next } })
    setNotice(`${lines.reduce((s, l) => s + l.quantity, 0)} units added to your ${location.name} cart.`)
    return true
  }
  const changeCart = (id: string, amount: number) => {
    const current = cart.find(line => line.id === id)
    if (amount > 0 && (!orderable(products.find(product => product.id === id)) || (current?.quantity || 0)+amount > 999)) { setNotice('Quantity was not changed. Check availability and the maximum of 999 purchasing units.'); return }
    setCarts(old => ({ ...old, [location.id]: (old[location.id] || []).map(l => l.id === id ? { ...l, quantity: l.quantity + amount } : l).filter(l => l.quantity > 0) }))
  }
  const openOrder = (o: Order) => { setSelectedOrder(o); setModal('order') }
  const openScope = (name: string) => { if (name === 'Shop') window.location.hash = shopRouteRef.current.slice(1); else setModal(`scope:${name}`); setNavOpen(false) }


  return <LookContext.Provider value={{ theme, palette: 'accent', fidelity: 'realistic', layout: 'wide' }}><div className="portal" data-theme={theme} data-screen={route.screen} data-fidelity="realistic">
    <a className="skip-link" href="#main">Skip to dashboard</a>
    {navOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)}/>}
    <aside className={`sidebar ${navOpen ? 'is-open' : ''}`} aria-label="Main navigation">
      <IconButton label="Close navigation drawer" className="drawer-close" onClick={() => setNavOpen(false)}><X size={21}/></IconButton>
      <a className="brand" href="/" aria-label="RCP America home"><img className="brand-logo" src={theme === 'dark' ? '/assets/RCP Lettering  logo simplification white 1.png' : '/assets/RCP SIMPLE BLACK 1.png'} alt="RCP America"/></a>
      <div className="portal-label">CUSTOMER PORTAL</div>
      <nav><a className={`nav-item ${route.screen === 'home' ? 'active' : ''}`} aria-current={route.screen === 'home' ? 'page' : undefined} href="#/" onClick={() => { setNavOpen(false); window.scrollTo(0,0) }}><House weight="fill"/>Home</a>
        <a className={`nav-item ${route.screen === 'shop' ? 'active' : ''}`} aria-current={route.screen === 'shop' ? 'page' : undefined} href={shopRouteRef.current} onClick={() => setNavOpen(false)}><SquaresFour/>Shop</a>
        <a className={`nav-item ${route.screen === 'lists' ? 'active' : ''}`} aria-current={route.screen === 'lists' ? 'page' : undefined} href={listsHref('saved','essentials')} onClick={() => { setNavOpen(false); window.scrollTo(0,0) }}><ArrowsClockwise/>Lists &amp; reorder</a>
        <a className={`nav-item ${route.screen === 'orders' ? 'active' : ''}`} aria-current={route.screen === 'orders' ? 'page' : undefined} href={historyHref()} onClick={() => { setNavOpen(false); window.scrollTo(0,0) }}><Receipt/>Orders &amp; invoices</a>
        <button className="nav-item" onClick={() => openScope('Quotes')}><ChatCenteredText/>Quotes</button>
        <button className="nav-item" onClick={() => { setNavOpen(false); setModal('resources') }}><BookOpen/>Resources</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="help-note"><span className="help-icon"><Question size={20}/></span><strong>Here to help.</strong><button className="text-link" onClick={() => setModal('support')}>Contact your rep<ArrowUpRight size={14}/></button></div>
        <button className="nav-item" onClick={() => openScope('Account settings')}><GearSix/>Account settings</button>
        <button className="profile" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}><Avatar tone="accent" name="Alex Morgan" size={34}/><span><strong>Alex Morgan</strong><small>Location buyer</small></span><CaretDown size={15}/></button>
        {profileOpen && <div className="profile-menu"><strong>Alex Morgan</strong><span>Camping World · Demo account</span><button onClick={() => { setProfileOpen(false); openScope('Account settings') }}><GearSix size={16}/>Manage account</button><button onClick={() => { setProfileOpen(false); setNotice('This is a local preview. No live account is signed in.') }}><SignOut size={16}/>Sign out</button></div>}
      </div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <IconButton label="Open navigation" className="mobile-menu" onClick={() => setNavOpen(!navOpen)}><List size={23}/></IconButton>
        <div className="location-wrap"><button ref={locationTriggerRef} className="location-trigger" onClick={() => { setLocationQuery(''); setLocationOpen(!locationOpen) }} aria-expanded={locationOpen} aria-controls="locations"><span className="location-icon"><MapPin size={19}/></span><span><small>ORDERING FOR</small><strong>{location.name}<span className="location-code">{location.code}</span></strong></span><CaretDown size={14}/></button>
          {locationOpen && <><button className="popover-dismiss" aria-label="Dismiss location selector" onClick={closeLocations}/><Card className="location-popover" id="locations"><strong>Switch location</strong><label className="input-wrap"><MagnifyingGlass size={17}/><input autoFocus placeholder="Search your locations" aria-label="Search locations" aria-controls="location-options" aria-describedby="location-keyboard-hint" value={locationQuery} onChange={e => setLocationQuery(e.target.value)} onKeyDown={e => { if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && filteredLocations.length) { e.preventDefault(); document.querySelector<HTMLElement>('#locations [role="listbox"]')?.focus() } }}/></label>
            {filteredLocations.length ? <div id="location-options"><AnimatedList key={filteredLocations.map(l => l.id).join(',')} className="location-list" aria-label="Choose ordering location" theme={theme} frame={false} width="100%" maxHeight={240} radius={7} gap={4} animation="fade" animateOnce stagger={0.035} showGradients={false} accentColor="var(--brand)" initialSelectedIndex={Math.max(0, filteredLocations.findIndex(l => l.id === location.id))} selectOnHover={false} items={filteredLocations.map(l => ({ id: l.id, title: l.name, description: `${l.code} · Camping World`, icon: <MapPin size={18}/>, meta: l.id === location.id ? <Check size={18} aria-label="Current location"/> : undefined }))} onItemSelect={(_, index) => { const next = filteredLocations[index]; setLocationId(next.id); closeLocations(); setNotice(`Ordering for ${next.name}. Its location cart is ready.`) }}/></div> : <p className="muted" role="status">No matching locations.</p>}
            <p className="location-keyboard-hint" id="location-keyboard-hint">Use arrow keys to browse, Enter to switch.</p><p className="popover-foot">Each location keeps its own cart.</p></Card></>}
        </div>
        <label className="global-search"><MagnifyingGlass size={19}/><input ref={searchRef} value={query} onChange={e => { setQuery(e.target.value); if (e.target.value) document.getElementById('reorder')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }} placeholder="Search products or SKU…" aria-label="Search products or SKU"/><kbd>Ctrl K</kbd>{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={16}/></button>}</label>
        <div className="topbar-actions"><button className="icon-button theme-toggle" aria-label="Dark mode" aria-pressed={theme === 'dark'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={21}/> : <Moon size={21}/>}</button><IconButton label="Notifications" className="notification-button" onClick={() => { setModal('notifications'); setReadNotifications(true) }}><Bell size={21}/>{!readNotifications && <span className="notification-dot"/>}</IconButton><span className="utility-divider"/><button className="cart-trigger" onClick={() => setModal('cart')} aria-label={`Location cart, ${count} units, ${money(total)}`}><span className="cart-symbol"><ShoppingCart size={22}/><span>{count}</span></span><span className="cart-label"><strong>Location cart</strong><small>{money(total)}</small></span></button></div>
      </header>
      <main id="main" tabIndex={-1}>
        {route.screen === 'shop' ? <Suspense fallback={<div className="catalog-loading" role="status">Loading Shop…</div>}><Shop filters={route.filters} locationId={location.id} locationName={location.name} cart={cart} cartSubtotal={total} onAdd={addLines} onQuickOrder={() => setModal('quick')} onCart={() => setModal('cart')} onSupport={() => setModal('support')}/></Suspense> : route.screen === 'lists' ? <Suspense fallback={<div className="catalog-loading" role="status">Loading your lists...</div>}><Lists key={location.id} mode={route.lists.mode} sourceId={route.lists.id} locationId={location.id} locationName={location.name} cart={cart} onAdd={addLines} onCart={() => setModal('cart')} onSupport={() => setModal('support')}/></Suspense> : route.screen === 'orders' ? <Suspense fallback={<div className="catalog-loading" role="status">Loading order history...</div>}><OrderHistory key={location.id} filters={route.history} locationId={location.id} locationName={location.name} onSupport={() => setModal('support')}/></Suspense> : <>
        <div className="breadcrumb">Workspace<CaretRight size={12}/><span>Home</span><span className="demo-label">Demo workspace</span></div>
        <label className="mobile-search input-wrap"><MagnifyingGlass size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products or SKU…" aria-label="Search products for this location"/>{query && <button aria-label="Clear mobile search" onClick={() => setQuery('')}><X size={16}/></button>}</label>
        <div className="page-heading"><div><div className="eyebrow">YOUR DAY, AT A GLANCE</div><h1 tabIndex={-1}>Let’s keep things moving.</h1><p>Your essentials, orders, and account. All in one place.</p></div><Action variant="primary" size="large" icon={<Lightning size={18}/>} onClick={() => { setModal('quick') }}>Order by SKU</Action></div>
        <div className="summary-strip">
          <button className="summary-orders" onClick={() => { setStatus('All orders'); setModal('all-orders') }}><span className="stat-top"><Package size={18}/>Open orders<ArrowUpRight size={14}/></span><span className="stat-value">3<span>Track your orders</span></span></button>
          <button className="summary-approval" onClick={() => { setSelectedOrder(orders[2]); setModal('order') }}><span className="stat-top"><Clock size={18}/>Awaiting approval<ArrowUpRight size={14}/></span><span className="stat-value">1<span className="amber-text">Review approval status</span></span></button>
          <button className="summary-invoices" onClick={() => setModal('invoices')}><span className="stat-top"><FileText size={18}/>Open invoices<ArrowUpRight size={14}/></span><span className="stat-value">2<span>View invoice details</span></span></button>
          <button className="summary-saved" onClick={() => { window.location.hash = listsHref('saved','essentials').slice(1) }}><span className="stat-top"><Star size={18}/>Your saved list<ArrowUpRight size={14}/></span><span className="stat-value">3<span>Restock saved products</span></span></button>
        </div>

        <div className="dashboard-grid">
          <div className="primary-column">
            <Card className="reorder-card" id="reorder" pad="large" gap={0}>
              <div className="reorder-visual-heading"><SectionTitle title="Back to the essentials" sub="Less searching. More getting things done." action="View catalog" onClick={() => openScope('Shop')}/><img src="/images/wash-stock.jpg" alt="A car being foam-washed in a detailing bay" width="120" height="72"/></div>
              <div className="list-toolbar"><ReorderTabs value={list} onChange={setList}/><span className="list-location"><MapPin size={13}/>{location.name}</span></div>
              <div className="product-head"><span>PRODUCT</span><span>YOUR PRICE</span><span>QUANTITY</span><span/></div>
              <div className="product-list" id="reorder-panel" role="tabpanel" aria-labelledby={`reorder-tab-${list}`}>
                {displayProducts.map(p => <Row key={p.id} className="product-row" lead={<ProductIcon product={p}/>} title={<><span className="product-name">{p.name}</span>{!p.core && <span className="approval-label">Requires approval</span>}</>} subtitle={<>{p.detail}<span className="sku">{p.id}</span></>}><span className="product-price">{money(p.price)}<small>{p.detail.includes('Pack') ? '/ pack' : p.detail.includes('Pail') ? '/ pail' : '/ case'}</small></span><div className="quantity-control"><button aria-label={`Decrease ${p.name} quantity`} disabled={(quantities[p.id] || 1) <= 1} onClick={() => setQuantities(q => ({ ...q, [p.id]: Math.max(1, (q[p.id] || 1) - 1) }))}><Minus size={13}/></button><input aria-label={`${p.name} quantity`} inputMode="numeric" type="number" min="1" max="999" value={quantities[p.id] || 1} onChange={e => setQuantities(q => ({ ...q, [p.id]: Math.max(1, Math.min(999, Math.trunc(Number(e.target.value)) || 1)) }))}/><button aria-label={`Increase ${p.name} quantity`} disabled={quantities[p.id] === 999} onClick={() => setQuantities(q => ({ ...q, [p.id]: Math.min(999, (q[p.id] || 1) + 1) }))}><Plus size={13}/></button></div><Action className="add-button" icon={<Plus size={15}/>} aria-label={`Add ${p.name} to cart`} onClick={() => addLines([{ id: p.id, quantity: quantities[p.id] || 1 }])}>Add</Action></Row>)}
                {!displayProducts.length && <div className="empty-state"><MagnifyingGlass size={28}/><strong>No matching products</strong><p>Try a product name or an SKU such as RCP-1001.</p><button className="text-link" onClick={() => setQuery('')}>Clear search</button></div>}
              </div>
              <div className="reorder-footer"><span><CheckCircle size={15}/>Your account pricing, already applied.</span><button className="text-link" onClick={() => { setModal('quick') }}>Have a list of SKUs?<ArrowRight size={14}/></button></div>
            </Card>
            <Card className="orders-card" id="orders" pad="large" gap={0}>
              <SectionTitle title="Recent orders" action="View all orders" onClick={() => { window.location.hash = historyHref().slice(1) }}/>
              <div className="orders-toolbar"><span>Keep track of what’s on the way.</span><label className="select-wrap"><CalendarBlank size={15}/><select aria-label="Order date range" value={period} onChange={e => setPeriod(e.target.value)}><option value="30">Last 30 days</option><option value="7">Last 7 days</option></select><CaretDown size={12}/></label></div>
              <div className="table-scroll"><table><thead><tr><th>ORDER</th><th>DATE PLACED</th><th>STATUS</th><th className="number">TOTAL</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{filteredOrders.map(o => <tr key={o.id} onClick={() => openOrder(o)}><td><button className="order-id" onClick={e => { e.stopPropagation(); openOrder(o) }}>#{o.id}</button><small>{o.items} units</small></td><td>{o.date}</td><td><Badge tone={o.tone} dot>{o.status}</Badge></td><td className="number">{money(o.total)}</td><td><button className="table-arrow" aria-label={`View order ${o.id}`} onClick={e => { e.stopPropagation(); openOrder(o) }}><ArrowUpRight size={17}/></button></td></tr>)}</tbody></table></div>
              <div className="orders-foot"><span>Showing {filteredOrders.length} recent orders</span><span>Orders for {location.name}</span></div>
            </Card>
          </div>
        <SpendOverview key={location.id} locationId={location.id} locationName={location.name}>
          <Card className="location-focus-card" pad="large" gap={0}>
            <div className="v2-card-title"><div><h2>Your location</h2><p>A little closer to a well-stocked bay.</p></div><button className="round-link" aria-label="View location cart" onClick={() => setModal('cart')}><ArrowUpRight size={20}/></button></div>
            <div className="location-stack"><div className="stack-sheet sheet-back"/><div className="stack-sheet sheet-middle"/><div className="location-feature"><img src="/images/wash-stock.jpg" alt="Vehicle covered in foam in a professional wash bay" width="640" height="426"/><div className="feature-location"><span className="location-orb"><MapPin size={19}/></span><span className="location-live">Your ordering location</span></div><h3>{location.name}</h3><p>Camping World · {location.code}</p><div className="location-tags"><span><CheckCircle size={13}/>Account pricing</span><span><Package size={13}/>{count} in cart</span></div><button className="feature-cart-link" onClick={() => setModal('cart')}>Your location cart<strong>{money(total)}<ArrowUpRight size={16}/></strong></button></div></div>
          </Card>
          <Card className="restock-focus-card" pad="large" gap={0}>
            <div className="v2-card-title"><div><h2>Ready for a restock?</h2><p>Your everyday essentials.<br/>Already on your list.</p></div></div>
            <div className="supply-art" aria-hidden="true"><div className="supply-orbit orbit-one"/><div className="supply-orbit orbit-two"/><div className="supply-orbit orbit-three"/><div className="supply-can"><div className="can-cap"/><div className="can-handle"/><div className="can-label"><Drop size={25} weight="fill"/><strong>RCP</strong><span>WASH & WAX</span><small>PROFESSIONAL SERIES</small></div></div><span className="supply-tag tag-one"><Check size={12}/>Your core essentials</span><span className="supply-tag tag-two"><ArrowsClockwise size={12}/>Ready to reorder</span></div>
            <Action className="restock-action" variant="primary" icon={<ArrowUpRight size={19}/>} onClick={() => { setList('frequent'); document.getElementById('reorder')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}>Build your next order</Action><p className="restock-foot">Less searching. More getting things done.</p>
          </Card>
        </SpendOverview>
          <div className="secondary-column">
            <Card className="attention-card" pad="large" gap={0}>
              <SectionTitle title="On your radar"/><p className="section-description">A little attention goes a long way.</p>
              <button className="radar-item" onClick={() => { setSelectedOrder(orders[2]); setModal('order') }}><span className="radar-icon amber"><Clock size={19}/></span><span><strong>1 order awaiting approval</strong><small>We’ll let you know when it’s ready.</small></span><CaretRight size={15}/></button>
              <button className="radar-item" onClick={() => setModal('invoices')}><span className="radar-icon blue"><Receipt size={19}/></span><span><strong>2 invoices to review</strong><small>All your paperwork, in one place.</small></span><CaretRight size={15}/></button>
              <div className="radar-note"><Info size={15}/><span>Updates are for your selected location.</span></div>
            </Card>
            <Card className="rep-card" pad="large" gap={0}>
              <span className="eyebrow">YOUR PEOPLE AT RCP</span><div className="rep-heading"><Avatar tone="accent" name="Jordan Taylor" size={46}/><div><strong>Jordan Taylor</strong><span>Your account representative</span></div></div><p>Product questions or a hand with an order? I’m here to help.</p><Action className="contact-button" icon={<ChatCenteredText size={17}/>} onClick={() => setModal('support')}>Get in touch<ArrowUpRight size={14}/></Action><span className="rep-hours">Monday–Friday · 8 am–5 pm ET</span>
            </Card>
            <Card className="field-guide" pad="large" gap={0}><div className="field-guide-photo"><img src="/images/detailing-stock.jpg" alt="A detailing professional hand-washing a vehicle with a sponge" width="1000" height="667" loading="lazy"/><span>FROM THE WASH BAY</span></div><div className="field-guide-copy"><span className="eyebrow">A BETTER EVERYDAY</span><h2>Good work starts<br/>with the right essentials.</h2><p>Your products. Your people. A simpler way to keep every bay moving.</p><button className="text-link" onClick={() => setModal('resources')}>Explore your getting-started guide<ArrowRight size={15}/></button></div></Card>
          </div>
        </div>
        <footer className="page-footer"><span>Good products. Real people. <strong>RCP America.</strong></span><button onClick={() => setModal('support')}>Need a hand?<ArrowUpRight size={13}/></button></footer>
        </>}
      </main>
    </div>
    {notice && <div className="toast" role="status"><CheckCircle size={21} weight="fill"/><span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={17}/></button></div>}
    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null) }}><div ref={modalRef} className={`modal ${modal === 'cart' ? 'cart-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title" onKeyDown={e => { if (e.key !== 'Tab') return; const focusable = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, textarea, a[href], [tabindex="0"]')); const first = focusable[0]; const last = focusable[focusable.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() } }}>
      <div className="modal-header"><div><span className="eyebrow">{location.name} · {location.code}</span><h2 id="dialog-title">{modal === 'quick' ? 'Order by SKU' : modal === 'cart' ? 'Location cart' : modal === 'order' ? `Order #${selectedOrder.id}` : modal === 'all-orders' ? 'Orders for your location' : modal === 'invoices' ? 'Open invoices' : modal === 'support' ? 'Your RCP team' : modal === 'resources' ? 'A simpler way to order' : modal === 'notifications' ? 'Your updates' : modal.replace('scope:', '')}</h2></div><IconButton label="Close dialog" onClick={() => setModal(null)}><X size={21}/></IconButton></div>
      <div className="modal-body">
        {modal === 'quick' && <QuickOrder theme={theme} locationName={location.name} onCancel={() => setModal(null)} onAdd={lines => { if (addLines(lines)) setModal('cart') }}/>}
        {modal === 'cart' && <>{!cart.length ? <div className="empty-state"><ShoppingCart size={38}/><strong>Your cart is empty</strong><p>Add your essentials or paste a list of SKUs.</p><Action variant="primary" onClick={() => setModal('quick')}>Order by SKU</Action></div> : <>
          <div className="cart-intro"><strong>{cart.length} {cart.length === 1 ? 'product' : 'products'}<span aria-hidden="true"> &middot; </span>{count} purchasing {count === 1 ? 'unit' : 'units'}</strong><p>Saved for this location when you switch stores.</p></div>
          <div className="cart-column-labels" aria-hidden="true"><span>Product &amp; unit price</span><span>Quantity</span><span>Line total</span></div>
          <div className="cart-lines">{cart.map(line => { const p = products.find(p => p.id === line.id)!; return <article key={line.id} className="cart-item" aria-label={p.name}>
            <div className="cart-item-product"><ProductIcon product={p}/><div><h3>{p.name}</h3><p>{p.detail}</p><span className="cart-unit-price">{money(p.price)} / {p.unit}</span>{!p.core && <span className="approval-label">Requires approval</span>}<button className="cart-remove" onClick={() => changeCart(p.id,-line.quantity)} aria-label={`Remove ${p.name} from cart`}>Remove</button></div></div>
            <div className="cart-item-quantity"><div className="cart-quantity" role="group" aria-label={`${p.name} quantity`}><IconButton label={`Remove one ${p.name}`} onClick={() => changeCart(p.id,-1)}><Minus size={16}/></IconButton><span aria-live="polite">{line.quantity}</span><IconButton label={`Add one ${p.name}`} onClick={() => changeCart(p.id,1)}><Plus size={16}/></IconButton></div><small>{line.quantity === 1 ? p.unit : p.unit === 'each' ? 'units' : `${p.unit}s`}</small></div>
            <strong className="cart-item-total"><span>Line total</span>{money(p.price*line.quantity)}</strong>
          </article> })}</div>
          <div className="cart-summary"><div className="cart-total"><span>Item subtotal</span><strong>{money(total)}</strong></div><p>Tax and delivery calculated at checkout.</p>{cart.some(line => !products.find(p => p.id === line.id)!.core) && <p className="cart-approval-note"><Clock size={16}/>Marked items require manager approval on every purchase.</p>}</div>
          <div className="cart-footer"><p>Checkout is not available in this preview.</p><Action onClick={() => setModal(null)}>Continue browsing</Action></div>
        </>}</>}
        {modal === 'order' && <><div className="order-detail-top"><Badge tone={selectedOrder.tone} dot>{selectedOrder.status}</Badge><span>Placed {selectedOrder.date}</span></div>{selectedOrder.status === 'Awaiting approval' && <div className="inline-note amber"><Clock size={19}/><span>This request is with your account approver. Reordering these products will require a new approval.</span></div>}{selectedOrder.status === 'Shipped' && <div className="inline-note"><Truck size={20}/><span>Your order has shipped. Tracking and delivery dates will appear here when provided by the carrier.</span></div>}<div className="cart-lines">{selectedOrder.lines.map(l => { const p = products.find(p => p.id === l.id)!; return <Row key={l.id} lead={<ProductIcon product={p}/>} title={p.name} subtitle={`${l.quantity} ${p.detail.includes('Pail') ? 'pail(s)' : p.detail.includes('Pack') ? 'pack(s)' : 'case(s)'}`}><strong>{money(l.quantity * l.unitPrice)}</strong></Row> })}</div><div className="cart-total"><span>Item subtotal</span><strong>{money(selectedOrder.total)}</strong></div><p className="muted">Reorders use today’s account prices and catalog eligibility. Delivery and tax are calculated at checkout.</p><div className="modal-actions"><Action onClick={() => setModal(null)}>Close</Action><Action variant="primary" icon={<ArrowsClockwise size={16}/>} onClick={() => { setModal(null); window.location.hash = listsHref('orders',selectedOrder.id).slice(1) }}>Reorder items</Action></div></>}
        {modal === 'all-orders' && <><div className="filter-row"><Funnel size={17}/><label>Status<select aria-label="Filter orders by status" value={status} onChange={e => setStatus(e.target.value)}>{['All orders', 'Shipped', 'Processing', 'Awaiting approval', 'Delivered'].map(s => <option key={s}>{s}</option>)}</select></label></div>{filteredOrders.length ? filteredOrders.map(o => <button key={o.id} className="order-list-button" onClick={() => openOrder(o)}><Row title={`#${o.id} · ${o.date}`} subtitle={`${o.items} units · ${money(o.total)}`}><Badge tone={o.tone} dot>{o.status}</Badge></Row></button>) : <div className="empty-state"><Package size={30}/><strong>No orders in this view</strong><p>Change your status or date filter to see more.</p></div>}</>}
        {modal === 'invoices' && <><p>Two invoices are open for {location.name}. These are demonstration records.</p>{[{ id: 'INV-10482', date: 'Nov 5, 2026', total: 420.5 }, { id: 'INV-10461', date: 'Nov 3, 2026', total: 192 }].map(i => <Row key={i.id} lead={<FileText size={22}/>} title={i.id} subtitle={`Issued ${i.date}`}><strong>{money(i.total)}</strong></Row>)}<div className="inline-note"><Info size={19}/><span>Live invoice documents, payment terms, and reconciled balances will come from your account records.</span></div><div className="modal-actions"><Action onClick={() => { setModal(null); window.location.hash = historyHref({ view:'invoices' }).slice(1) }}>View all invoices<ArrowRight size={15}/></Action></div></>}
        {modal === 'notifications' && <><Row lead={<span className="radar-icon blue"><Truck size={19}/></span>} title="Your order is on its way" subtitle="Order #10482 has shipped."/><Row lead={<span className="radar-icon amber"><Clock size={19}/></span>} title="Approval requested" subtitle="Order #10435 is with your account approver."/><p className="muted">You’re all caught up. These updates are sample data.</p></>}
        {modal === 'support' && <><div className="support-person"><Avatar tone="accent" name="Jordan Taylor" size={54}/><div><strong>Jordan Taylor</strong><span>Your account representative</span></div></div><p>Get help with product selection, account questions, or your next order.</p><div className="support-method"><EnvelopeSimple size={21}/><span><strong>Email your representative</strong><small>Contact details will be provided by RCP.</small></span></div><div className="support-method"><Phone size={21}/><span><strong>Talk to the RCP team</strong><small>Monday–Friday · 8 am–5 pm ET</small></span></div><div className="inline-note"><Info size={19}/><span>Representative name and availability are illustrative. Live contact details will be connected with your account.</span></div></>}
        {modal === 'resources' && <><p>From everyday essentials to your next delivery, here’s how to get started.</p>{[{ title: 'Choose your location', text: 'Use the location selector at the top. Every location has its own catalog, pricing, and shared cart.' }, { title: 'Build your order', text: 'Add frequently ordered products, choose your saved list, or use Order by SKU to paste SKUs and quantities.' }, { title: 'Review your cart', text: 'Check packaging and quantities. Off-list items are marked Requires approval and need approval every time.' }, { title: 'Keep things moving', text: 'Follow recent orders, check invoices, and reach out to your RCP representative for help.' }].map((step, i) => <div className="guide-step" key={step.title}><span>{i + 1}</span><div><strong>{step.title}</strong><p>{step.text}</p></div></div>)}<Action variant="primary" onClick={() => { setModal('quick'); setNavOpen(false) }}>Try ordering by SKU<ArrowRight size={15}/></Action></>}
        {modal.startsWith('scope:') && <div className="empty-state"><ArrowSquareOut size={35}/><strong>A first look at your new workspace.</strong><p>{modal.replace('scope:', '')} is planned for a future page. This preview focuses on Home, with working reorder lists, ordering by SKU, location carts, and order details.</p><Action variant="primary" onClick={() => setModal(null)}>Back to Home</Action></div>}
      </div><div className="modal-demo-note">RCP America · Dashboard preview · Sample data</div>
    </div></div>}
  </div></LookContext.Provider>
}
