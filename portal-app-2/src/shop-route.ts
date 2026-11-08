import { useEffect, useState } from 'react'
import { historyHref, parseHistoryFilters } from './history-route'

export type ShopFilters = { tab: string; q: string; category: string; favorites: boolean; view: string; sort: string; product: string; returnTo: string }
export const defaultFilters: ShopFilters = { tab: 'core', q: '', category: 'all', favorites: false, view: 'list', sort: 'recommended', product: '', returnTo: '' }
export function parseRoute() {
  const hash = window.location.hash.slice(1)
  const [path, query] = hash.split('?')
  const params = new URLSearchParams(query)
  return { screen: path === '/shop' ? 'shop' : path === '/lists' ? 'lists' : path === '/orders' ? 'orders' : 'home', history:parseHistoryFilters(params), lists: { mode: params.get('mode') === 'orders' ? 'orders' as const : 'saved' as const, id: params.get('id') || (params.get('mode') === 'orders' ? '10482' : 'essentials') }, filters: {
    tab: params.get('tab') === 'approval' ? 'approval' : 'core', q: params.get('q') || '', category: params.get('category') || 'all', favorites: params.get('favorites') === '1', view: params.get('view') === 'grid' ? 'grid' : 'list', sort: ['name','price-low','price-high'].includes(params.get('sort') || '') ? params.get('sort')! : 'recommended', product: params.get('product') || '', returnTo: listReturnHref(params.get('returnTo'))
  } }
}
export function shopHref(filters: ShopFilters) {
  const params = new URLSearchParams()
  for (const [key,value] of Object.entries(filters)) if (value !== defaultFilters[key as keyof ShopFilters]) params.set(key, typeof value === 'boolean' ? '1' : value)
  return '#/shop' + (params.size ? '?' + params : '')
}
export function usePortalRoute() {
  const [route,setRoute] = useState(parseRoute)
  useEffect(() => { const update = () => setRoute(parseRoute()); window.addEventListener('hashchange',update); return () => window.removeEventListener('hashchange',update) }, [])
  return route
}

export function listsHref(mode: 'saved' | 'orders', id: string) {
  return '#/lists?' + new URLSearchParams({ mode,id }).toString()
}

function listReturnHref(value: string | null) {
  if (!value) return ''
  const [path,query] = value.split('?')
  if (path === '#/orders') return historyHref(parseHistoryFilters(new URLSearchParams(query)))
  if (path !== '#/lists') return ''
  const params = new URLSearchParams(query)
  const mode = params.get('mode'),id = params.get('id')
  return (mode === 'saved' || mode === 'orders') && id && id.length <= 128 ? listsHref(mode,id) : ''
}
