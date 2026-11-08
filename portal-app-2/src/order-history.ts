import { orders, type Order } from './orders'

export type Invoice = { id: string; orderId: string; date: string; issuedAt: string; total: number; status: 'Open' }
export const invoices: Invoice[] = [
  { id:'INV-10482',orderId:'10482',date:'Nov 5, 2026',issuedAt:'2026-11-05',total:420.5,status:'Open' },
  { id:'INV-10461',orderId:'10461',date:'Nov 3, 2026',issuedAt:'2026-11-03',total:192,status:'Open' },
]
export const historyAsOf = '2026-11-07'
export type HistoryData = { orders: Order[]; invoices: Invoice[] }
export class HistoryError extends Error {
  constructor(public kind: 'error' | 'denied' | 'unavailable') { super('Order history could not be verified.') }
}
export async function loadHistory(locationId: string,signal: AbortSignal): Promise<HistoryData> {
  const response = await fetch('/data/order-history.json',{ signal,cache:'no-store' })
  if (response.status === 403) throw new HistoryError('denied')
  if (response.status === 404) throw new HistoryError('unavailable')
  if (!response.ok) throw new HistoryError('error')
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || !('locations' in data) || !Array.isArray(data.locations)) throw new HistoryError('error')
  if (!data.locations.includes(locationId)) throw new HistoryError('denied')
  if (!('orderIds' in data) || !Array.isArray(data.orderIds) || !('invoiceIds' in data) || !Array.isArray(data.invoiceIds)) throw new HistoryError('error')
  const orderIds = data.orderIds,invoiceIds = data.invoiceIds
  if (new Set(orderIds).size !== orderIds.length || new Set(invoiceIds).size !== invoiceIds.length || orderIds.some(id => typeof id !== 'string' || !orders.some(order => order.id === id)) || invoiceIds.some(id => typeof id !== 'string' || !invoices.some(invoice => invoice.id === id && orderIds.includes(invoice.orderId)))) throw new HistoryError('error')
  return { orders:orders.filter(order => orderIds.includes(order.id)),invoices:invoices.filter(invoice => invoiceIds.includes(invoice.id)) }
}
