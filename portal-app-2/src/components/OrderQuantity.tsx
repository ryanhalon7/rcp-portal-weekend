import { Minus, Plus } from '@phosphor-icons/react'
export default function OrderQuantity({ name,value,onChange,disabled = false }: { name: string; value: number; onChange: (value: number) => void; disabled?: boolean }) {
  const invalid = !Number.isSafeInteger(value) || value < 1 || value > 999
  const errorId = `quantity-error-${name.replace(/[^a-z0-9]/gi,'-')}`
  return <div className="catalog-quantity-field"><div className="catalog-quantity"><button type="button" aria-label={`Decrease ${name} quantity`} disabled={disabled || value <= 1} onClick={() => onChange(Math.max(1,Math.ceil(value)-1))}><Minus size={14}/></button><input type="number" min={1} max={999} step={1} inputMode="numeric" aria-label={`${name} quantity`} aria-invalid={invalid || undefined} aria-describedby={invalid ? errorId : undefined} disabled={disabled} value={value} onChange={e => onChange(Number(e.target.value))}/><button type="button" aria-label={`Increase ${name} quantity`} disabled={disabled || value >= 999} onClick={() => onChange(Math.min(999,Math.floor(value)+1))}><Plus size={14}/></button></div>{invalid && <span className="catalog-quantity-error" id={errorId}>Enter 1–999 whole units.</span>}</div>
}
