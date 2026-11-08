import type { Line } from './catalog'

export type Order = { id: string; date: string; placedAt: string; items: number; total: number; status: string; tone: 'accent' | 'success' | 'warning'; lines: (Line & { unitPrice: number })[] }
export const orders: Order[] = [
  { id: '10482', date: 'Nov 5, 2026', placedAt: '2026-11-05', items: 6, total: 420.5, status: 'Shipped', tone: 'accent', lines: [{ id: 'RCP-1001', quantity: 2, unitPrice: 64 }, { id: 'RCP-2040', quantity: 3, unitPrice: 89.5 }, { id: 'RCP-3102', quantity: 1, unitPrice: 24 }] },
  { id: '10461', date: 'Nov 3, 2026', placedAt: '2026-11-03', items: 3, total: 192, status: 'Processing', tone: 'accent', lines: [{ id: 'RCP-1001', quantity: 3, unitPrice: 64 }] },
  { id: '10435', date: 'Nov 1, 2026', placedAt: '2026-11-01', items: 2, total: 144, status: 'Awaiting approval', tone: 'warning', lines: [{ id: 'RCP-4025', quantity: 2, unitPrice: 72 }] },
  { id: '10398', date: 'Oct 28, 2026', placedAt: '2026-10-28', items: 5, total: 233.5, status: 'Delivered', tone: 'success', lines: [{ id: 'RCP-2040', quantity: 1, unitPrice: 89.5 }, { id: 'RCP-3102', quantity: 2, unitPrice: 24 }, { id: 'RCP-1050', quantity: 2, unitPrice: 48 }] },
]
