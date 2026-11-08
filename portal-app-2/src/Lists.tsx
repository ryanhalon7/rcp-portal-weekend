import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, ArrowsClockwise, CheckCircle, Clock, Heart, Info, Package, Plus, ShoppingCart, Star, WarningCircle } from '@phosphor-icons/react'
import { Button } from './vendor/stageshow/controls/Button'
import { Card } from './vendor/stageshow/parts/Card'
import { CatalogError, loadCatalog, money, products, type Line, type Product } from './catalog'
import { orders } from './orders'
import { defaultFilters, listsHref, shopHref } from './shop-route'
import { listStorageKey, readFavoriteLines, readLists, type SavedList } from './saved-lists'
import ProductArt from './components/ProductArt'
import OrderQuantity from './components/OrderQuantity'
import './shop.css'
import './lists.css'

type Props = { mode: 'saved' | 'orders'; sourceId: string; locationId: string; locationName: string; cart: Line[]; onAdd: (lines: Line[]) => boolean; onCart: () => void; onSupport: () => void }
type Source = SavedList & { kind: 'saved' | 'favorites' | 'order'; note: string }
type Draft = { quantities: Record<string,number>; selected: string[] }
const validQuantity = (value: number) => Number.isSafeInteger(value) && value >= 1 && value <= 999
function initialDraft(key: string, source: Source, catalog: Product[]): Draft {
  const allowed = source.lines.filter(line => catalog.some(product => product.id === line.id && product.available)).map(line => line.id)
  const quantities = Object.fromEntries(source.lines.map(line => [line.id,line.quantity]))
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(key) || 'null')
    if (value && typeof value === 'object' && 'quantities' in value && value.quantities && typeof value.quantities === 'object' && 'selected' in value && Array.isArray(value.selected)) {
      for (const id of Object.keys(quantities)) { const qty = (value.quantities as Record<string,unknown>)[id]; if (typeof qty === 'number' && Number.isFinite(qty)) quantities[id] = qty }
      return { quantities,selected:value.selected.filter((id): id is string => typeof id === 'string' && allowed.includes(id)) }
    }
  } catch { /* Drafts are optional; the saved source remains intact. */ }
  return { quantities,selected:allowed }
}

function Review({ source,catalog,locationId,cart,onAdd,onCart,onSave }: { source: Source; catalog: Product[]; locationId: string; locationName: string; cart: Line[]; onAdd: Props['onAdd']; onCart: () => void; onSave: (list: SavedList) => boolean }) {
  const draftKey = `rcp-v2-list-draft-${locationId}-${source.kind}-${source.id}`
  const [draft,setDraft] = useState(() => initialDraft(draftKey,source,catalog))
  const [message,setMessage] = useState('')
  const [creating,setCreating] = useState(false)
  const [name,setName] = useState('')
  const nameInput = useRef<HTMLInputElement>(null)
  const selectAll = useRef<HTMLInputElement>(null)
  useEffect(() => { try { sessionStorage.setItem(draftKey,JSON.stringify(draft)) } catch { /* Saving a named list remains a separate action. */ } },[draft,draftKey])
  useEffect(() => { if (creating) nameInput.current?.focus() },[creating])
  const eligible = source.lines.filter(line => catalog.some(product => product.id === line.id && product.available))
  const selected = source.lines.filter(line => draft.selected.includes(line.id) && eligible.some(item => item.id === line.id))
  const selectedAll = eligible.length > 0 && selected.length === eligible.length
  useEffect(() => { if (selectAll.current) selectAll.current.indeterminate = selected.length > 0 && !selectedAll },[selected.length,selectedAll])
  const invalid = selected.some(line => !validQuantity(draft.quantities[line.id]) || draft.quantities[line.id]+(cart.find(item => item.id === line.id)?.quantity || 0) > 999)
  const subtotal = selected.reduce((sum,line) => sum+catalog.find(product => product.id === line.id)!.price*(validQuantity(draft.quantities[line.id]) ? draft.quantities[line.id] : 0),0)
  const approvalCount = selected.filter(line => !catalog.find(product => product.id === line.id)!.core).length
  const edited = source.lines.some(line => draft.quantities[line.id] !== line.quantity)
  const canSave = source.lines.every(line => validQuantity(draft.quantities[line.id]))
  const selectedLines = () => selected.map(line => ({ id:line.id,quantity:draft.quantities[line.id] }))
  const createList = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !selected.length || invalid) return
    if (onSave({ id:crypto.randomUUID(),name:name.trim(),lines:selectedLines() })) { setCreating(false); setName(''); setMessage('New list saved for this location. Your cart has not changed.') }
  }
  return <Card className="lists-review" pad="large" gap={0}>
    <div className="lists-review-heading"><div><span className="lists-source-kind">{source.kind === 'order' ? 'PAST PURCHASE' : source.kind === 'favorites' ? 'PERSONAL FAVORITES' : 'LOCATION LIST'}</span><h2>{source.name}</h2><p>{source.note}</p></div><span className="lists-item-count">{source.lines.length} {source.lines.length === 1 ? 'product' : 'products'}</span></div>
    {source.lines.length ? <>
      <div className="lists-review-tools"><div className="lists-inclusion"><label className="lists-select-all"><input ref={selectAll} type="checkbox" checked={selectedAll} disabled={!eligible.length} onChange={() => setDraft(old => ({ ...old,selected:selectedAll ? [] : eligible.map(line => line.id) }))}/>Include all available</label><p id="lists-inclusion-hint">{!eligible.length ? 'Unavailable products cannot be added.' : selected.length ? 'Uncheck any products you do not need for this order.' : 'Check a product below to include it in your order.'}</p></div><div className="lists-review-actions">{source.kind === 'saved' && <Button disabled={!edited || !canSave} onClick={() => { if (onSave({ id:source.id,name:source.name,lines:source.lines.map(line => ({ id:line.id,quantity:draft.quantities[line.id] })) })) setMessage('List quantities saved for this location. Your cart has not changed.') }}>Save quantities</Button>}<Button icon={<Plus size={15}/>} disabled={!selected.length || invalid} onClick={() => { setCreating(value => !value); setMessage('') }}>Save as new list</Button></div></div>
      {creating && <form className="lists-name-form" onSubmit={createList}><label htmlFor="new-list-name">New list name<input id="new-list-name" ref={nameInput} value={name} maxLength={60} autoComplete="off" required onChange={event => setName(event.target.value)}/></label><div><Button type="button" onClick={() => setCreating(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={!name.trim() || !selected.length || invalid}>Save list</Button></div></form>}
      {message && <p className="lists-local-notice" role="status"><CheckCircle size={16}/>{message}</p>}
      <div className="lists-column-labels" aria-hidden="true"><span>Include in order / Product</span><span>Quantity</span><span>Line total</span></div>
      <div className="lists-items">{source.lines.map(line => {
        const product = catalog.find(item => item.id === line.id)
        const known = product || products.find(item => item.id === line.id)
        const available = Boolean(product?.available)
        const quantity = draft.quantities[line.id]
        const inCart = cart.find(item => item.id === line.id)?.quantity || 0
        const exceeds = draft.selected.includes(line.id) && available && quantity+inCart > 999
        const included = available && draft.selected.includes(line.id)
        const href = product ? shopHref({ ...defaultFilters,tab:product.core ? 'core' : 'approval',product:product.id,returnTo:listsHref(source.kind === 'order' ? 'orders' : 'saved',source.id) }) : ''
        const identity = <><div className="lists-item-art">{known ? <ProductArt product={known}/> : <Package size={28}/>}</div><div className="lists-item-copy"><h3>{known?.name || line.id}{product && <ArrowUpRight size={14} aria-hidden="true"/>}</h3><p>{known?.detail || 'Packaging details unavailable'}</p><span className="lists-sku">{line.id}</span>{product && <span className="lists-unit-price">{money(product.price)} / {product.unit}</span>}{product && !product.core && <span className="catalog-policy approval"><Clock size={14}/>Requires approval</span>}{!available && <span className="lists-unavailable-label"><WarningCircle size={14}/>{product ? 'Currently unavailable' : 'Not in your current catalog'}</span>}</div></>
        return <article className={`lists-item ${available ? '' : 'is-unavailable'}`} data-included={included} key={line.id} aria-label={known?.name || line.id}>
          <div className="lists-item-main"><label className="lists-item-check"><input type="checkbox" aria-label={`Select ${known?.name || line.id}`} aria-describedby="lists-inclusion-hint" checked={included} disabled={!available} onChange={() => setDraft(old => ({ ...old,selected:old.selected.includes(line.id) ? old.selected.filter(id => id !== line.id) : [...old.selected,line.id] }))}/><span aria-hidden="true">{available ? included ? 'Included' : 'Include' : ''}</span></label>{product ? <a className="lists-product-link" href={href} aria-label={`View ${product.name} details`}>{identity}</a> : <div className="lists-product-identity">{identity}</div>}</div>
          <div className="lists-item-quantity"><OrderQuantity name={known?.name || line.id} value={quantity} disabled={!available} onChange={value => { setDraft(old => ({ ...old,quantities:{ ...old.quantities,[line.id]:value } })); setMessage('') }}/><small>{known?.unit || 'units'}</small>{exceeds && <span className="lists-cart-limit" role="alert">Already {inCart} in cart. You can add {Math.max(0,999-inCart)} more.</span>}</div>
          <strong className="lists-line-total"><span>Line total</span>{product && validQuantity(quantity) ? money(product.price*quantity) : '—'}</strong>
        </article>
      })}</div>
      <div className="lists-selection-summary"><div><strong role="status">{selected.length} {selected.length === 1 ? 'product included' : 'products included'}</strong><span>{invalid ? 'Check selected quantities' : `${money(subtotal)} item subtotal`}</span>{approvalCount > 0 && <small><Clock size={14}/>{approvalCount} {approvalCount === 1 ? 'item requires' : 'items require'} manager approval on every purchase.</small>}</div><Button variant="primary" icon={<ShoppingCart size={18}/>} disabled={!selected.length || invalid} onClick={() => { if (onAdd(selectedLines())) onCart(); else setMessage('Nothing added. Check availability and quantities in your location cart.') }}>{!eligible.length ? 'No products available' : !selected.length ? 'Choose products to add' : `Add ${selected.length} ${selected.length === 1 ? 'product' : 'products'} to cart`}</Button></div>
      <div className="lists-review-foot"><span><Info size={15}/>Current sample account prices. Tax and delivery excluded.</span><Button onClick={onCart}>Review location cart<ArrowRight size={15}/></Button></div>
    </> : <div className="lists-empty"><Heart size={32}/><h3>No products saved here yet</h3><p>Favorite products in Shop, then return to build a repeat order.</p><a href="#/shop">Browse Shop<ArrowRight size={15}/></a></div>}
  </Card>
}

export default function Lists({ mode,sourceId,locationId,locationName,cart,onAdd,onCart,onSupport }: Props) {
  const [saved,setSaved] = useState(() => readLists(locationId))
  const [favoriteLines] = useState(readFavoriteLines)
  const [catalog,setCatalog] = useState<Product[]>([])
  const [state,setState] = useState<'loading' | 'ready' | 'error' | 'denied' | 'unavailable'>('loading')
  const [retry,setRetry] = useState(0)
  const [saveError,setSaveError] = useState('')
  const [pickerOpen,setPickerOpen] = useState(() => window.matchMedia('(min-width: 1101px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1101px)')
    const change = () => setPickerOpen(media.matches)
    media.addEventListener('change',change)
    return () => media.removeEventListener('change',change)
  },[])
  useEffect(() => {
    const controller = new AbortController()
    setState('loading')
    loadCatalog(controller.signal).then(value => { if (!controller.signal.aborted) { setCatalog(value); setState('ready') } }).catch(error => { if (!controller.signal.aborted) setState(error instanceof CatalogError ? error.kind : 'error') })
    return () => controller.abort()
  },[locationId,retry])
  const sources: Source[] = mode === 'orders' ? orders.map(order => ({ id:order.id,name:`Order #${order.id}`,lines:order.lines,kind:'order',note:`${order.date} - ${order.status}. Review current prices before reordering.` })) : [{ id:'favorites',name:'Your favorites',lines:favoriteLines,kind:'favorites',note:'Products you saved in Shop. Choose what you need today.' },...saved.map(list => ({ ...list,kind:'saved' as const,note:'Adjust this order, or save quantities for your next restock.' }))]
  const source = sources.find(item => item.id === sourceId)
  const persist = (list: SavedList) => {
    if (saved.some(item => item.id !== list.id && item.name.toLowerCase() === list.name.toLowerCase())) { setSaveError('A list with that name already exists for this location. Choose another name.'); return false }
    const next = saved.some(item => item.id === list.id) ? saved.map(item => item.id === list.id ? list : item) : [...saved,list]
    try { localStorage.setItem(listStorageKey(locationId),JSON.stringify(next)); setSaved(next); setSaveError(''); return true } catch { setSaveError('We could not save this list on this device. Your edits are still here; try again.'); return false }
  }
  const navigate = (nextMode: 'saved' | 'orders',id: string) => { window.location.hash = listsHref(nextMode,id).slice(1); if (window.matchMedia('(max-width: 1100px)').matches) setPickerOpen(false); setSaveError('') }
  return <section className="lists-page" aria-label="Lists and reorder">
    <div className="breadcrumb"><a href="#/">Workspace</a><ArrowRight size={12}/><span>Lists &amp; reorder</span><span className="demo-label">Sample workspace</span></div>
    <div className="page-heading lists-heading"><div><h1 tabIndex={-1}>Lists &amp; reorder</h1><p>Your regular supplies, ready to order again.</p></div></div>
    <div className="lists-tabs" role="tablist" aria-label="Reorder sources" onKeyDown={event => { if (event.altKey || event.ctrlKey || event.metaKey) return; if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 'saved' : event.key === 'End' ? 'orders' : mode === 'saved' ? 'orders' : 'saved'; navigate(next,next === 'saved' ? 'essentials' : orders[0].id); event.currentTarget.querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)?.focus() }}>
      <button id="lists-tab-saved" data-mode="saved" role="tab" aria-selected={mode === 'saved'} aria-controls="lists-source-panel" tabIndex={mode === 'saved' ? 0 : -1} onClick={() => navigate('saved','essentials')}><Star size={18}/>Saved lists</button><button id="lists-tab-orders" data-mode="orders" role="tab" aria-selected={mode === 'orders'} aria-controls="lists-source-panel" tabIndex={mode === 'orders' ? 0 : -1} onClick={() => navigate('orders',orders[0].id)}><ArrowsClockwise size={18}/>Past orders</button>
    </div>
    {saveError && <p className="lists-save-error" role="alert">{saveError}</p>}
    {state !== 'ready' ? <Card className="lists-request-state" pad="large" aria-busy={state === 'loading'}><Package size={32}/><h2>{state === 'loading' ? 'Checking your current catalog...' : state === 'denied' ? 'Catalog access is restricted' : state === 'unavailable' ? 'Catalog temporarily unavailable' : 'We could not check your catalog'}</h2><p>{state === 'loading' ? 'Checking prices, purchasing eligibility, and availability.' : 'Your saved lists and location cart are safe. Products cannot be added until your catalog is available.'}</p><div>{state !== 'loading' && state !== 'denied' && <Button variant="primary" onClick={() => setRetry(value => value+1)}>Try again</Button>}{state !== 'loading' && <Button onClick={onSupport}>Contact your representative</Button>}</div></Card> : <div className="lists-layout" id="lists-source-panel" role="tabpanel" aria-labelledby={`lists-tab-${mode}`}>
      <aside className="lists-source-picker" aria-label={mode === 'saved' ? 'Saved lists' : 'Past orders'}><details open={pickerOpen} onToggle={event => setPickerOpen(event.currentTarget.open)}><summary><strong>{source?.name || 'Choose a list'}</strong><span>Change</span></summary><nav aria-label="Choose reorder source">{sources.map(item => <a href={listsHref(mode,item.id)} key={item.id} aria-current={item.id === sourceId ? 'true' : undefined} onClick={event => { event.preventDefault(); navigate(mode,item.id) }}>{item.kind === 'favorites' ? <Heart size={18}/> : item.kind === 'order' ? <ArrowsClockwise size={18}/> : <Star size={18}/>}<span><strong>{item.name}</strong><small>{item.kind === 'order' ? orders.find(order => order.id === item.id)?.date : `${item.lines.length} products`}</small></span><ArrowRight size={14}/></a>)}</nav></details><p className="lists-location-note">Lists and carts belong to <strong>{locationName}</strong>. Favorites are personal.</p></aside>
      {source ? <Review key={`${locationId}-${source.kind}-${source.id}`} source={source} catalog={catalog} locationId={locationId} locationName={locationName} cart={cart} onAdd={onAdd} onCart={onCart} onSave={persist}/> : <Card className="lists-empty" pad="large"><Package size={32}/><h2>List or order not found</h2><p>Choose another source to continue.</p><Button onClick={() => navigate('saved','essentials')}>Open saved lists</Button></Card>}
    </div>}
    <p className="lists-sample-note">Sample lists, order history, prices, and availability. Named lists are saved on this device for the selected location.</p>
  </section>
}
