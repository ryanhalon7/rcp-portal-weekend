export type HistoryFilters = { view: 'orders' | 'invoices'; q: string; status: string; period: 'all' | '30' | '7'; order: string; invoice: string }
export const historyDefaults: HistoryFilters = { view:'orders',q:'',status:'all',period:'all',order:'',invoice:'' }
export const orderStatuses = ['all','open','Shipped','Processing','Awaiting approval','Delivered']
export function parseHistoryFilters(params: URLSearchParams): HistoryFilters {
  return { view:params.get('view') === 'invoices' ? 'invoices' : 'orders',q:params.get('q') || '',status:orderStatuses.includes(params.get('status') || '') ? params.get('status')! : 'all',period:params.get('period') === '7' ? '7' : params.get('period') === '30' ? '30' : 'all',order:params.get('order') || '',invoice:params.get('invoice') || '' }
}
export function historyHref(patch: Partial<HistoryFilters> = {}) {
  const filters = { ...historyDefaults,...patch }
  const params = new URLSearchParams()
  for (const [key,value] of Object.entries(filters)) if (value !== historyDefaults[key as keyof HistoryFilters]) params.set(key,value)
  return '#/orders' + (params.size ? '?' + params : '')
}
