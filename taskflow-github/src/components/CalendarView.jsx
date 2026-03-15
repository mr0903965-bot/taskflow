import { useState, useMemo } from 'react'
import { TODAY } from '../data/constants'

export default function CalendarView({ tasks, t, dark }) {
  const [cal, setCal]  = useState({ year: TODAY.getFullYear(), month: TODAY.getMonth() })
  const [sel, setSel]  = useState(null)

  const firstDay  = new Date(cal.year, cal.month, 1)
  const lastDay   = new Date(cal.year, cal.month + 1, 0)
  const startDow  = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7

  const taskMap = useMemo(() => {
    const m = {}
    tasks.forEach((tk) => { if (tk.due) { if (!m[tk.due]) m[tk.due] = []; m[tk.due].push(tk) } })
    return m
  }, [tasks])

  const surf  = dark ? '#1C1C1E' : '#fff'
  const bord  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textC = dark ? '#F0F0F0' : '#1C1C1E'
  const muted = dark ? 'rgba(255,255,255,0.3)' : '#aaa'
  const todayStr = TODAY.toISOString().split('T')[0]

  const prev = () => setCal((c) => { const d = new Date(c.year, c.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() } })
  const next = () => setCal((c) => { const d = new Date(c.year, c.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() } })

  return (
    <div>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <button onClick={prev} style={{ background: 'none', border: `1px solid ${bord}`, borderRadius: 6, width: 26, height: 26, cursor: 'pointer', color: textC, fontSize: 13 }}>‹</button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 14, color: textC }}>{t.months[cal.month]} {cal.year}</span>
        <button onClick={next} style={{ background: 'none', border: `1px solid ${bord}`, borderRadius: 6, width: 26, height: 26, cursor: 'pointer', color: textC, fontSize: 13 }}>›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 2 }}>
        {t.weekDays.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 8, fontFamily: "'Space Mono', monospace", color: muted, padding: '3px 0' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {Array.from({ length: totalCells }).map((_, i) => {
          const dn = i - startDow + 1
          if (dn < 1 || dn > lastDay.getDate()) return <div key={i} />
          const ds = `${cal.year}-${String(cal.month + 1).padStart(2, '0')}-${String(dn).padStart(2, '0')}`
          const dt  = taskMap[ds] || []
          const isT = ds === todayStr
          const isSel = ds === sel
          return (
            <button key={i} onClick={() => setSel(isSel ? null : ds)} style={{
              background: isSel ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : isT ? (dark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.07)') : 'transparent',
              border: `1px solid ${isT ? 'rgba(99,102,241,0.4)' : isSel ? bord : 'transparent'}`,
              borderRadius: 6, padding: '3px 1px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 33,
            }}>
              <span style={{ fontSize: 9, fontWeight: isT ? 700 : 400, color: isT ? '#6366F1' : textC, fontFamily: "'Space Mono', monospace" }}>{dn}</span>
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                {dt.slice(0, 3).map((tk, ti) => (
                  <span key={ti} style={{ width: 4, height: 4, borderRadius: '50%', background: tk.done ? '#34D399' : '#6366F1' }} />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected day */}
      {sel && (
        <div style={{ marginTop: 11, padding: '11px 13px', background: surf, border: `1px solid ${bord}`, borderRadius: 9 }}>
          <div style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: muted, marginBottom: 7 }}>{sel}</div>
          {!(taskMap[sel] || []).length
            ? <div style={{ fontSize: 10, color: muted }}>{t.noTasksDay}</div>
            : (taskMap[sel] || []).map((tk) => (
              <div key={tk.id} style={{ fontSize: 11, color: tk.done ? muted : textC, textDecoration: tk.done ? 'line-through' : 'none', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: tk.done ? '#34D399' : '#6366F1', flexShrink: 0 }} />
                {tk.text}
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
