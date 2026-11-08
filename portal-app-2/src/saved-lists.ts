import type { Line } from './catalog'

export type SavedList = { id: string; name: string; lines: Line[] }
export const listStorageKey = (locationId: string) => `rcp-v2-lists-${locationId}`
export function readLists(locationId: string): SavedList[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(listStorageKey(locationId)) || 'null')
    if (Array.isArray(value) && value.every(list => list && typeof list.id === 'string' && typeof list.name === 'string' && list.name.trim() && Array.isArray(list.lines) && list.lines.every((line: Line) => line && typeof line.id === 'string' && Number.isSafeInteger(line.quantity) && line.quantity >= 1 && line.quantity <= 999) && new Set(list.lines.map((line: Line) => line.id)).size === list.lines.length) && new Set(value.map(list => list.id)).size === value.length) return value
  } catch { /* A missing or invalid local record uses the sample starting lists. */ }
  return [
    { id:'essentials',name:'Everyday essentials',lines:[{ id:'RCP-1001',quantity:1 },{ id:'RCP-2040',quantity:1 },{ id:'RCP-3102',quantity:1 }] },
    { id:'wash-bay',name:'Wash bay supplies',lines:[{ id:'RCP-3120',quantity:1 },{ id:'RCP-2055',quantity:1 },{ id:'RCP-4025',quantity:1 }] },
  ]
}
export function readFavoriteLines(): Line[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('rcp-v2-favorites') || '["RCP-1001","RCP-2040","RCP-3102"]')
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string'))].map(id => ({ id,quantity:1 })) : []
  } catch { return [] }
}
