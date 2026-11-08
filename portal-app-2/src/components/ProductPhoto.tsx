import { useState, type ReactNode } from 'react'
import type { Product } from '../catalog'
import './product-photo.css'

/** Shared catalog photography with the existing artwork as a loading-error fallback. */
export default function ProductPhoto({ product, fallback }: { product: Product; fallback: ReactNode }) {
  const [failedSource,setFailedSource] = useState<string>()
  return product.photo && failedSource !== product.photo
    ? <img className="product-photo" src={product.photo} alt={product.name} loading="lazy" decoding="async" onError={() => setFailedSource(product.photo)}/>
    : <>{fallback}</>
}
