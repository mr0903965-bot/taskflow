import { getDaysLeft } from '../utils/helpers'

export default function DueBadge({ due, done, t }) {
  if (!due) return null
  const d = getDaysLeft(due)
  let label, bg, color

  if (done)      { label = t.done;                           bg = 'rgba(100,120,100,0.12)'; color = '#888' }
  else if (d < 0){ label = `${Math.abs(d)}d ${t.overdue}`;  bg = 'rgba(239,68,68,0.15)';   color = '#EF4444' }
  else if (d === 0){ label = t.today;                        bg = 'rgba(249,115,22,0.18)';  color = '#F97316' }
  else if (d === 1){ label = t.tomorrow;                     bg = 'rgba(234,179,8,0.15)';   color = '#CA8A04' }
  else if (d <= 3) { label = `${d}d`;                        bg = 'rgba(234,179,8,0.1)';    color = '#CA8A04' }
  else             { label = `${d}d`;                        bg = 'rgba(100,116,139,0.1)';  color = '#94A3B8' }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px', borderRadius: 5,
      background: bg, color,
      fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
      fontFamily: "'Space Mono', monospace",
      border: `1px solid ${color}22`,
    }}>
      {label.toUpperCase()}
    </span>
  )
}
