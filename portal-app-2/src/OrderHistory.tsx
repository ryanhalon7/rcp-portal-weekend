import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, ArrowsClockwise, CheckCircle, Clock, FileText, Info, MagnifyingGlass, Package, Receipt, Truck, X } from '@phosphor-icons/react'
import { Button } from './vendor/stageshow/controls/Button'
import { Card } from './vendor/stageshow/parts/Card'
import { Badge } from './vendor/stageshow/controls/Badge'
import { products, money } from './catalog'
import { type Order } from './orders'
import { HistoryError, historyAsOf, loadHistory, type HistoryData } from './order-history'
import { historyDefaults, historyHref, orderStatuses, type HistoryFilters } from './history-route'
import { defaultFilters, listsHref, shopHref } from './shop-route'
import ProductArt from './components/ProductArt'
import './shop.css'
import './order-history.css'

type Props = { filters: HistoryFilters; locationId: string; locationName: string; onSupport: () => void }
const statusCopy: Record<string,string> = {
  'Shipped':'Shipment is recorded. Carrier tracking and delivery estimates have not been supplied.',
  'Delivered':'Delivery is recorded. Delivery confirmation details have not been supplied.',
  'Processing':'RCP is processing this order. Shipment details are not available yet.',
  'Awaiting approval':'With your account approver. Approval is needed before this order can be processed.',
}
function RecordedItems({ order,filters }: { order: Order; filters: HistoryFilters }) {
  return <Card className="history-items" pad="large" gap={0}><div className="history-card-heading"><h2>Items ordered</h2><span>Recorded order prices</span></div>{order.lines.map(line => {
    const product = products.find(item => item.id === line.id)
    const identity = <><div className="history-product-art">{product ? <ProductArt product={product}/> : <Package size={28}/>}</div><div><h3>{product?.name || line.id}{product && <ArrowUpRight size={14} aria-hidden="true"/>}</h3><p>{product?.detail || 'Packaging information unavailable'}</p><small>{line.id}</small><span>{money(line.unitPrice)} / {product?.unit || 'unit'}</span>{product && !product.core && <span className="history-item-approval"><Clock size={13}/>Approval required when reordered</span>}</div></>
    return <article className="history-item" key={line.id}>{product ? <a className="history-product" aria-label={`View ${product.name} details`} href={shopHref({ ...defaultFilters,product:product.id,tab:product.core ? 'core' : 'approval',returnTo:historyHref(filters) })}>{identity}</a> : <div className="history-product">{identity}</div>}<span className="history-item-quantity">{line.quantity} {product?.unit === 'each' ? 'units' : product ? line.quantity === 1 ? product.unit : `${product.unit}s` : 'units'}</span><strong>{money(line.quantity*line.unitPrice)}</strong></article>
  })}<div className="history-recorded-total"><span>Recorded item subtotal</span><strong>{money(order.total)}</strong></div><p className="history-price-note">Sample order prices are shown here. Reorders use current account prices and eligibility.</p></Card>
}

export default function OrderHistory({ filters,locationId,locationName,onSupport }: Props) {
  const [data,setData] = useState<HistoryData>({ orders:[],invoices:[] })
  const [state,setState] = useState<'loading' | 'ready' | 'error' | 'denied' | 'unavailable'>('loading')
  const [retry,setRetry] = useState(0)
  const [keyboard,setKeyboard] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const priorDetail = useRef('')
  useEffect(() => {
    const controller = new AbortController()
    setState('loading')
    loadHistory(locationId,controller.signal).then(value => { if (!controller.signal.aborted) { setData(value); setState('ready') } }).catch(error => { if (!controller.signal.aborted) setState(error instanceof HistoryError ? error.kind : 'error') })
    return () => controller.abort()
  },[locationId,retry])
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Tab') setKeyboard(true) }
    const pointer = () => setKeyboard(false)
    document.addEventListener('keydown',key,true); document.addEventListener('pointerdown',pointer,true)
    return () => { document.removeEventListener('keydown',key,true); document.removeEventListener('pointerdown',pointer,true) }
  },[])
  useEffect(() => {
    const key = filters.invoice || filters.order
    if (state !== 'ready' || priorDetail.current === key) return
    priorDetail.current = key; window.scrollTo(0,0); heading.current?.focus()
  },[filters.invoice,filters.order,state])
  const update = (patch: Partial<HistoryFilters>,replace = false) => {
    const url = historyHref({ ...filters,...patch })
    if (replace) { window.history.replaceState(null,'',url); window.dispatchEvent(new Event('hashchange')) }
    else window.location.hash = url.slice(1)
  }
  const changeView = (view: 'orders' | 'invoices') => { if (filters.view !== view) update({ view,q:'',status:'all',order:'',invoice:'' }) }
  const inPeriod = (date: string) => {
    const days = (Date.parse(historyAsOf)-Date.parse(date))/86400000
    return filters.period === 'all' || days >= 0 && days < Number(filters.period)
  }
  const terms = (order: Order) => `${order.id} ${order.lines.map(line => `${line.id} ${products.find(product => product.id === line.id)?.name || ''}`).join(' ')}`
  const query = filters.q.trim().toLowerCase().replace(/^#/,'')
  const visibleOrders = data.orders.filter(order => terms(order).toLowerCase().includes(query) && inPeriod(order.placedAt) && (filters.status === 'all' || filters.status === 'open' && order.status !== 'Delivered' || order.status === filters.status))
  const visibleInvoices = data.invoices.filter(invoice => `${invoice.id} ${terms(data.orders.find(order => order.id === invoice.orderId)!)}`.toLowerCase().includes(query) && inPeriod(invoice.issuedAt))
  const invoice = data.invoices.find(item => item.id === filters.invoice)
  const order = data.orders.find(item => item.id === (invoice?.orderId || filters.order))
  const detail = Boolean(filters.order || filters.invoice)
  const invoiceView = filters.view === 'invoices'
  const invoiceDetail = Boolean(filters.invoice)
  const found = invoiceDetail ? Boolean(invoice && order) : Boolean(order)
  const title = detail && state === 'ready' && found ? invoiceDetail ? `Invoice ${invoice!.id}` : `Order #${order!.id}` : 'Orders & invoices'
  const listHref = historyHref({ ...filters,order:'',invoice:'' })
  const hasFilters = Boolean(filters.q || filters.period !== 'all' || !invoiceView && filters.status !== 'all')
  const clear = () => update({ q:'',status:'all',period:'all' })
  return <section className="history-page" aria-label="Orders and invoices">
    <div className="breadcrumb"><a href="#/">Workspace</a><ArrowRight size={12}/>{detail ? <><a href={listHref}>Orders &amp; invoices</a><ArrowRight size={12}/><span>Details</span></> : <span>Orders &amp; invoices</span>}<span className="demo-label">Sample records</span></div>
    <div className="page-heading history-heading"><div><h1 tabIndex={-1} ref={heading}>{title}</h1>{detail && found && !invoiceDetail && order ? <div className="history-heading-meta"><Badge tone={order.tone}>{order.status}</Badge><p>Placed {order.date}</p></div> : <p>{detail && found ? `${invoiceDetail ? 'Issued' : 'Placed'} ${invoiceDetail ? invoice!.date : order!.date}` : 'Track your purchases and find your paperwork.'}</p>}</div>{detail && found && order && <a className="history-reorder-action" href={listsHref('orders',order.id)}><ArrowsClockwise size={18}/>Review reorder</a>}</div>
    {detail && <a className="history-back" href={listHref}><ArrowLeft size={16}/>Back to {invoiceView ? 'invoices' : 'orders'}</a>}
    {!detail && <div className="history-tabs" role="tablist" aria-label="History records" onKeyDown={event => { if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 'orders' : event.key === 'End' ? 'invoices' : invoiceView ? 'orders' : 'invoices'; changeView(next); event.currentTarget.querySelector<HTMLButtonElement>(`[data-view="${next}"]`)?.focus() }}>
      {(['orders','invoices'] as const).map(view => <button key={view} data-view={view} id={`history-tab-${view}`} role="tab" aria-selected={filters.view === view} aria-controls="history-panel" tabIndex={filters.view === view ? 0 : -1} onClick={() => changeView(view)}>{view === 'orders' ? <Package size={18}/> : <Receipt size={18}/>}<span>{view === 'orders' ? 'Orders' : 'Invoices'}</span>{state === 'ready' && <small>{data[view].length}</small>}</button>)}
    </div>}
    {state !== 'ready' ? <Card className="history-state" pad="large" aria-busy={state === 'loading'}><Package size={32}/><h2>{state === 'loading' ? 'Loading your order history...' : state === 'denied' ? 'History access is restricted' : state === 'unavailable' ? 'History temporarily unavailable' : 'We could not load your history'}</h2><p>{state === 'loading' ? 'Finding orders and linked invoices for your location.' : 'Try again, or contact your representative to confirm access to your location records.'}</p><div>{state !== 'loading' && state !== 'denied' && <Button variant="primary" onClick={() => setRetry(value => value+1)}>Try again</Button>}{state !== 'loading' && <Button onClick={onSupport}>Contact your representative</Button>}</div></Card> : detail ? found && order ? <div className="history-detail-layout">
      <div className="history-detail-main">{invoiceDetail && invoice && <Card className="history-invoice-summary" pad="large" gap={0}><div className="history-card-heading"><h2>Invoice information</h2><Badge tone="warning">Open</Badge></div><dl><div><dt>Invoice number</dt><dd>{invoice.id}</dd></div><div><dt>Issued</dt><dd>{invoice.date}</dd></div><div><dt>Linked order</dt><dd><a href={historyHref({ ...filters,order:order.id,invoice:'' })}>Order #{order.id}<ArrowUpRight size={14}/></a></dd></div><div><dt>Recorded invoice amount</dt><dd className="history-invoice-amount">{money(invoice.total)}</dd></div></dl><p>Payment terms and reconciled balances have not been connected.</p></Card>}
      {!invoiceDetail && <RecordedItems order={order} filters={filters}/>}</div>
      <aside className="history-detail-aside" aria-label={invoiceDetail ? 'Invoice document' : 'Order status and documents'}>{!invoiceDetail && <Card className="history-status-card" pad="large" gap={0}><div className="history-card-heading"><h2>Order status</h2><Badge tone={order.tone}>{order.status}</Badge></div><ol className="history-timeline"><li><CheckCircle size={20}/><div><strong>Order placed</strong><span>{order.date}</span></div></li><li>{order.status === 'Shipped' || order.status === 'Delivered' ? <Truck size={20}/> : <Clock size={20}/>}<div><strong>{order.status}</strong><p>{statusCopy[order.status]}</p></div></li></ol></Card>}
      <Card className="history-document-card" pad="large" gap={0}><FileText size={24}/><h2>{invoiceDetail ? 'Invoice document' : 'Linked invoices'}</h2>{invoiceDetail ? <><p>The invoice PDF has not been supplied for this sample record.</p><Button onClick={onSupport}>Contact your representative<ArrowUpRight size={14}/></Button></> : data.invoices.some(item => item.orderId === order.id) ? data.invoices.filter(item => item.orderId === order.id).map(item => <a className="history-invoice-link" key={item.id} href={historyHref({ ...filters,invoice:item.id,order:'' })}><span><strong>{item.id}</strong><small>{money(item.total)}<span aria-hidden="true"> - </span>{item.status}</small></span><ArrowRight size={16}/></a>) : <><p>No invoice is linked to this order in the sample records.</p><Button onClick={onSupport}>Ask about this order<ArrowUpRight size={14}/></Button></>}</Card></aside>
      {invoiceDetail && <div className="history-invoice-items"><RecordedItems order={order} filters={filters}/></div>}
    </div> : <Card className="history-state" pad="large"><Package size={32}/><h2>Record not available</h2><p>This order or invoice is not in your selected location history.</p><a className="history-back" href={listHref}>Back to history<ArrowRight size={15}/></a></Card> : <Card className="history-workspace" pad="large" gap={0} id="history-panel" role="tabpanel" aria-labelledby={`history-tab-${filters.view}`}>
      <div className="history-toolbar"><label className={`history-search ${keyboard ? 'keyboard-navigation' : ''}`} htmlFor="history-search"><MagnifyingGlass size={19}/><input id="history-search" type="search" autoComplete="off" value={filters.q} aria-label={invoiceView ? 'Search invoices' : 'Search orders'} placeholder={invoiceView ? 'Search invoice or order number...' : 'Search order number, product or SKU...'} onChange={event => update({ q:event.target.value },true)}/></label><div>{!invoiceView && <label>Status<select aria-label="Filter order status" value={filters.status} onChange={event => update({ status:event.target.value })}>{orderStatuses.map(status => <option key={status} value={status}>{status === 'all' ? 'All statuses' : status === 'open' ? 'Open orders' : status}</option>)}</select></label>}<label>Date<select aria-label="History date range" value={filters.period} onChange={event => update({ period:event.target.value as HistoryFilters['period'] })}><option value="all">All dates</option><option value="30">Last 30 days</option><option value="7">Last 7 days</option></select></label></div></div>
      <div className="history-results"><span role="status">{invoiceView ? visibleInvoices.length : visibleOrders.length} {invoiceView ? 'invoices' : 'orders'}<span aria-hidden="true"> - </span>{locationName}</span>{hasFilters && <button onClick={clear}>Clear filters<X size={14}/></button>}</div>
      {(invoiceView ? visibleInvoices.length : visibleOrders.length) ? <><div className="history-column-labels" aria-hidden="true"><span>{invoiceView ? 'Invoice / linked order' : 'Order'}</span><span>{invoiceView ? 'Issued' : 'Placed'}</span><span>Status</span><span>{invoiceView ? 'Invoice amount' : 'Item subtotal'}</span><span/></div><ol className="history-records">{invoiceView ? visibleInvoices.map(item => <li key={item.id}><a className="history-record-link" href={historyHref({ ...filters,invoice:item.id,order:'' })}><span className="history-record-name"><strong>{item.id}</strong><small>Order #{item.orderId}</small></span><time dateTime={item.issuedAt}>{item.date}</time><span className="history-record-status"><Badge tone="warning">{item.status}</Badge></span><strong className="history-record-total">{money(item.total)}</strong><ArrowUpRight size={17}/></a></li>) : visibleOrders.map(item => <li key={item.id}><a className="history-record-link" href={historyHref({ ...filters,order:item.id,invoice:'' })}><span className="history-record-name"><strong>Order #{item.id}</strong><small>{item.items} purchasing units</small></span><time dateTime={item.placedAt}>{item.date}</time><span className="history-record-status"><Badge tone={item.tone}>{item.status}</Badge></span><strong className="history-record-total">{money(item.total)}</strong><ArrowUpRight size={17}/></a></li>)}</ol></> : <div className="history-empty"><MagnifyingGlass size={30}/><h2>{hasFilters ? `No ${invoiceView ? 'invoices' : 'orders'} match these filters` : invoiceView ? 'No invoices available yet' : 'No orders available yet'}</h2><p>{hasFilters ? 'Try another number or clear your filters.' : 'Records will appear here when they are connected to your location.'}</p>{hasFilters ? <Button onClick={clear}>Show all {invoiceView ? 'invoices' : 'orders'}</Button> : <Button onClick={onSupport}>Contact your representative</Button>}</div>}
    </Card>}
    <p className="history-sample-note"><Info size={14}/>Sample records through Nov 7, 2026, shown for {locationName}. Tax, delivery, tracking, payment terms, and invoice PDFs are not connected.</p>
  </section>
}
