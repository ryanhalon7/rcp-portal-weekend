import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight, ChartLineUp } from '@phosphor-icons/react'
import { Card } from './vendor/stageshow/parts/Card'
import { Chart, chartPoints } from './vendor/stageshow/chart'
import './visuals.css'
import RubberSegment from './components/react-bits/RubberSegment'

const formatMoney = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
const TOTALS = [3420, 3960, 3650, 4480, 4110, 4720]
const EQUIPMENT = [480, 860, 420, 1100, 670, 780]
const UNCLASSIFIED = [100, 140, 180, 120, 140, 220]
const CATEGORIES = ['Chemicals & supplies', 'Equipment', 'Unclassified']

export default function SpendOverview({ locationId, locationName, children }: { locationId: string; locationName: string; children?: ReactNode }) {
  const [months, setMonths] = useState(6)
  const [selected, setSelected] = useState<number | null>(null)
  const [width, setWidth] = useState(540)
  const plot = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new ResizeObserver(entries => setWidth(Math.max(1, Math.floor(entries[0].contentRect.width))))
    if (plot.current) observer.observe(plot.current)
    return () => observer.disconnect()
  }, [])
  const scale = locationId === 'orlando' ? .76 : locationId === 'jacksonville' ? 1.18 : 1
  const records = MONTHS.map((month, i) => {
    const total = Math.round(TOTALS[i] * scale)
    const equipment = Math.round(EQUIPMENT[i] * scale)
    const unclassified = Math.round(UNCLASSIFIED[i] * scale)
    return { month, total, categories: [total - equipment - unclassified, equipment, unclassified] }
  }).slice(-months)
  const data = records.map(record => record.total)
  const total = data.reduce((sum, amount) => sum + amount, 0)
  const categoryTotals = CATEGORIES.map((_, i) => records.reduce((sum, record) => sum + record.categories[i], 0))
  const maximum = Math.ceil(Math.max(...data) / 2000) * 2000
  const points = chartPoints({ data, width, height: 130, max: maximum, dot: false })
  const percentages = categoryTotals.map(value => value / total * 100)
  const growth = (data[data.length - 1] / data[data.length - 2] - 1) * 100
  const active = selected !== null && selected < records.length ? selected : null
  const activeRecord = active === null ? null : records[active]

  return <section className="visual-overview" aria-label={`Sample purchasing insights for ${locationName}`}>
    {children}
    <Card className="spend-card" pad="large" gap={0}>
      <div className="insight-header"><div><span className="insight-kicker"><ChartLineUp size={15}/>ITEM SPEND</span><h2>Purchasing overview</h2></div><RubberSegment className="spend-period" aria-label="Spend chart period" items={[{ value: "3", label: "3 months" }, { value: "6", label: "6 months" }]} value={String(months)} onChange={value => { setMonths(Number(value)); setSelected(null) }} size="sm" draggable={false} stretch={25} squash={0} trackColor="var(--period-track)" thumbColor="var(--period-thumb)" textColor="var(--period-ink)" activeTextColor="var(--period-active)"/></div>
      <div className="spend-readout"><strong>{formatMoney(activeRecord?.total ?? total)}</strong><span>{activeRecord ? `${activeRecord.month} 2026 · item spend` : `${records[0].month}–Oct 2026 · item spend`}<small><ArrowUpRight size={12}/>{growth.toFixed(1)}% in Oct vs. Sep</small></span></div>
      <div className="spend-graph" onMouseLeave={() => setSelected(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSelected(null) }}>
        <div className="chart-y-axis" aria-hidden="true"><span>{formatMoney(maximum)}</span><span>{formatMoney(maximum / 2)}</span><span>$0</span></div>
        <div className="chart-plot" ref={plot}>
          <div className="chart-grid" aria-hidden="true"><span/><span/><span/></div>
          <Chart data={data} width={width} height={130} max={maximum} dot={false}/>
          {active !== null && <svg className="chart-marker" width={width} height={130} aria-hidden="true"><line x1={points[active].x} x2={points[active].x} y1={0} y2={130}/><circle cx={points[active].x} cy={points[active].y} r={4}/></svg>}
          <div className="chart-hit-areas">{records.map((record, i) => <button key={record.month} aria-label={`${record.month} 2026 item spend: ${formatMoney(record.total)}`} onMouseEnter={() => setSelected(i)} onFocus={() => setSelected(i)} onClick={() => setSelected(i)} style={{ left: `${Math.max(0, (i - .5) / (records.length - 1) * 100)}%`, width: `${(i === 0 || i === records.length - 1 ? .5 : 1) / (records.length - 1) * 100}%` }}/>)}</div>
          <div className="chart-x-axis" aria-hidden="true">{records.map(record => <span key={record.month}>{record.month}</span>)}</div>
        </div>
      </div>
      <section className="spend-categories" aria-labelledby="spend-categories-heading"><div className="spend-categories-title"><h3 id="spend-categories-heading">Spend by category</h3><span>{records[0].month}&ndash;Oct 2026</span></div><dl className="spend-category-list">{CATEGORIES.map((category,i) => <div key={category}><dt><span className={`category-dot category-dot-${i}`} aria-hidden="true"/>{category}</dt><dd><strong>{formatMoney(categoryTotals[i])}</strong><span>{percentages[i].toFixed(1)}%</span></dd></div>)}</dl></section>
      <div className="chart-foot"><span className="sample-data-label">Sample data</span><span>{locationName} · Excludes tax & delivery</span><details><summary>View data</summary><table><caption>Illustrative invoiced item spend · 2026</caption><thead><tr><th scope="col">Month</th><th scope="col">Items</th></tr></thead><tbody>{records.map(record => <tr key={record.month}><th scope="row">{record.month}</th><td>{formatMoney(record.total)}</td></tr>)}</tbody></table></details></div>
    </Card>
  </section>
}
