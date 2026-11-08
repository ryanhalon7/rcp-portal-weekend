import { Broom, Drop, Flask, SquaresFour, Package, Wrench } from '@phosphor-icons/react'

export type Line = { id: string; quantity: number }
export type Product = {
  id: string; name: string; detail: string; price: number; icon: typeof Drop; color: string; core: boolean;
  category: 'Chemicals & supplies' | 'Equipment'; group: string; unit: 'case' | 'pail' | 'pack' | 'each';
  available: boolean; description: string; photo?: string; family?: string; image: 'jug' | 'pail' | 'towels' | 'brush' | 'extractor';
}
export const products: Product[] = [
  { id: 'RCP-1001', photo: '/images/apc-1.avif', name: 'All-purpose cleaner', detail: '1 gallon · Case of 4', price: 64, icon: Flask, color: 'sage', core: true, category: 'Chemicals & supplies', group: 'Cleaners', unit: 'case', available: true, description: 'An everyday cleaning essential for the detailing bay. Review the approved product label before use.', family: 'all-purpose', image: 'jug' },
  { id: 'RCP-2040', photo: '/images/wash-n-wax-1.avif', name: 'Wash & wax concentrate', detail: '5 gallon · Pail', price: 89.5, icon: Drop, color: 'blue', core: true, category: 'Chemicals & supplies', group: 'Wash & wax', unit: 'pail', available: true, description: 'Concentrated wash and wax in a bulk pail for your regular replenishment list.', image: 'pail' },
  { id: 'RCP-3102', photo: '/images/microfiber-towels.avif', name: 'Microfiber detailing towels', detail: '16 × 16 in · Pack of 12', price: 24, icon: SquaresFour, color: 'sand', core: true, category: 'Chemicals & supplies', group: 'Tools & towels', unit: 'pack', available: true, description: 'A pack of reusable microfiber towels for everyday detailing tasks.', image: 'towels' },
  { id: 'RCP-4025', name: 'Non-acid wheel cleaner', detail: '1 gallon · Case of 4', price: 72, icon: Broom, color: 'rose', core: false, category: 'Chemicals & supplies', group: 'Cleaners', unit: 'case', available: true, description: 'A wheel-cleaning product outside the Camping World core assortment. Each purchase requires manager approval.', image: 'jug' },
  { id: 'RCP-1050', photo: '/images/glass-cleaner.avif', name: 'Streak-free glass cleaner', detail: '1 gallon · Case of 4', price: 48, icon: Drop, color: 'blue', core: true, category: 'Chemicals & supplies', group: 'Cleaners', unit: 'case', available: true, description: 'A glass-cleaning essential supplied in a four-container case.', image: 'jug' },
  { id: 'RCP-1002', photo: '/images/apc-bulk.avif', name: 'All-purpose cleaner — bulk', detail: '5 gallon · Pail', price: 74, icon: Flask, color: 'sage', core: true, category: 'Chemicals & supplies', group: 'Cleaners', unit: 'pail', available: true, description: 'The bulk-pail option for your all-purpose cleaning supply.', family: 'all-purpose', image: 'pail' },
  { id: 'RCP-3120', photo: '/images/brush.avif', name: 'Soft-bristle wash brush', detail: '10 in head · Each', price: 32, icon: Broom, color: 'sand', core: true, category: 'Chemicals & supplies', group: 'Tools & towels', unit: 'each', available: true, description: 'A soft-bristle wash-brush head. Confirm compatibility with your existing handle before ordering.', image: 'brush' },
  { id: 'RCP-2055', photo: '/images/vehicle-wash.avif', name: 'Vehicle wash concentrate', detail: '1 gallon · Case of 4', price: 58, icon: Drop, color: 'blue', core: true, category: 'Chemicals & supplies', group: 'Wash & wax', unit: 'case', available: false, description: 'A core vehicle-wash supply. Ordering is temporarily unavailable in this sample catalog; choose another eligible wash product.', image: 'jug' },
  { id: 'RCP-4070', name: 'Power Clean', detail: '5 gallon · Pail', price: 96, icon: Flask, color: 'rose', core: false, category: 'Chemicals & supplies', group: 'Cleaners', unit: 'pail', available: true, description: 'An off-list cleaning product. Tampa and every other Camping World location require manager approval on every purchase.', image: 'pail' },
  { id: 'RCP-6010', name: 'Portable carpet extractor', detail: 'Portable unit · Each', price: 795, icon: Wrench, color: 'blue', core: false, category: 'Equipment', group: 'Equipment', unit: 'each', available: true, description: 'A portable extraction unit for equipment purchases. Equipment remains separate from routine chemical and supply spend.', image: 'extractor' },
  { id: 'RCP-6040', name: 'Extractor accessory kit', detail: 'Hose & hand tool · Kit', price: 118, icon: Package, color: 'sand', core: false, category: 'Equipment', group: 'Equipment', unit: 'each', available: true, description: 'Equipment accessories supplied as one catalog SKU. Confirm compatibility with your unit through your representative.', image: 'extractor' },
]
export const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
export const accountPolicy = { id: 'camping-world', name: 'Camping World', approvalTabs: true, requiresApproval: (product: Product) => !product.core }
export const orderable = (product: Product | undefined): product is Product => Boolean(product?.available)
export class CatalogError extends Error {
  constructor(public kind: 'error' | 'denied' | 'unavailable', message: string) { super(message) }
}
export async function loadCatalog(signal: AbortSignal): Promise<Product[]> {
  const response = await fetch('/data/catalog.json', { signal, cache: 'no-store' })
  if (response.status === 403) throw new CatalogError('denied', 'You do not have access to this account catalog.')
  if (response.status === 404) throw new CatalogError('unavailable', 'The catalog is temporarily unavailable.')
  if (!response.ok) throw new CatalogError('error', 'We could not load the catalog. Please try again.')
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || !('accountId' in data) || data.accountId !== accountPolicy.id || !('productIds' in data) || !Array.isArray(data.productIds) || data.productIds.some(id => typeof id !== 'string' || !products.some(p => p.id === id)) || new Set(data.productIds).size !== data.productIds.length) throw new CatalogError('error', 'The catalog could not be verified. Please try again.')
  return products.filter(product => (data.productIds as string[]).includes(product.id))
}
