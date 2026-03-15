import { TODAY } from '../data/constants'

export default function StatsView({ tasks, t, dark, PRIORITIES, TAGS }) {
  const textC = dark ? '#F0F0F0' : '#1C1C1E'
  const muted = dark ? 'rgba(255,255,255,0.35)' : '#9CA3AF'
  const surf  = dark ? '#1C1C1E' : '#fff'
  const bord  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'

  const total   = tasks.length
  const done    = tasks.filter((x) => x.done).length
  const pending = tasks.filter((x) => !x.done).length
  const overdue = tasks.filter((x) => {
    if (!x.done && x.due) {
      const d = new Date(x.due + 'T00:00:00')
      return Math.ceil((d - TODAY) / 86400000) < 0
    }
    return false
  }).length
  const pct = total ? Math.round((done / total) * 100) : 0

  const byPri = PRIORITIES.map((p) => ({
    ...p,
    total: tasks.filter((x) => x.priority === p.label).length,
    done:  tasks.filter((x) => x.priority === p.label && x.done).length,
  }))

  const byTag = TAGS
    .map((tg) => ({ ...tg, count: tasks.filter((x) => x.tags.includes(tg.label)).length }))
    .filter((x) => x.count > 0)

  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(TODAY)
    d.setDate(d.getDate() - 6 + i)
    const ds = d.toISOString().split('T')[0]
    return {
      day:   t.weekDaysFull[(d.getDay() + 6) % 7],
      count: tasks.filter((x) => x.due === ds).length,
      done:  tasks.filter((x) => x.due === ds && x.done).length,
    }
  })
  const maxWeek = Math.max(1, ...weekData.map((x) => x.count))

  const Card = ({ label, value, color, sub }) => (
    <div style={{ background: surf, border: `1px solid ${bord}`, borderRadius: 11, padding: '14px 16px', flex: 1, minWidth: 80 }}>
      <div style={{ fontSize: 8, letterSpacing: '0.1em', color: muted, marginBottom: 5, fontFamily: "'Space Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: color || textC, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: muted, marginTop: 3 }}>{sub}</div>}
    </div>
  )

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <Card label={t.totalTasks} value={total} />
        <Card label={t.doneTasks}  value={done}    color="#34D399" sub={`${pct}%`} />
        <Card label={t.pendingTasks} value={pending} color="#6366F1" />
        <Card label={t.overdueLabel} value={overdue} color={overdue > 0 ? '#EF4444' : textC} />
      </div>

      {/* Progress ring */}
      <div style={{ background: surf, border: `1px solid ${bord}`, borderRadius: 11, padding: '18px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 20 }}>
        <svg width={80} height={80} viewBox="0 0 80 80">
          <circle cx={40} cy={40} r={32} fill="none" stroke={dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'} strokeWidth={7} />
          <circle cx={40} cy={40} r={32} fill="none" stroke="#34D399" strokeWidth={7}
            strokeDasharray={`${2 * Math.PI * 32}`}
            strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
            strokeLinecap="round" transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
          <text x={40} y={44} textAnchor="middle" fontSize={14} fontWeight={700} fill={textC} fontFamily="Space Mono,monospace">{pct}%</text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: textC, marginBottom: 3 }}>{done} / {total}</div>
          <div style={{ fontSize: 10, color: muted }}>{t.doneTasks.toLowerCase()}</div>
          {total > 0 && (
            <div style={{ marginTop: 8, height: 4, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#6366F1,#34D399)', borderRadius: 99, transition: 'width 0.5s' }} />
            </div>
          )}
        </div>
      </div>

      {/* By priority */}
      <div style={{ background: surf, border: `1px solid ${bord}`, borderRadius: 11, padding: '16px', marginBottom: 12 }}>
        <div style={{ fontSize: 8, letterSpacing: '0.1em', color: muted, marginBottom: 12, fontFamily: "'Space Mono', monospace" }}>{t.byPriority.toUpperCase()}</div>
        {byPri.map((p) => (
          <div key={p.label} style={{ marginBottom: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: textC, fontWeight: 600 }}>{p.label}</span>
              <span style={{ fontSize: 9, color: muted, fontFamily: "'Space Mono', monospace" }}>{p.done}/{p.total}</span>
            </div>
            <div style={{ height: 4, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${p.total ? Math.round(p.done / p.total * 100) : 0}%`, height: '100%', background: p.color, borderRadius: 99, transition: 'width 0.5s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Weekly activity */}
      <div style={{ background: surf, border: `1px solid ${bord}`, borderRadius: 11, padding: '16px', marginBottom: 12 }}>
        <div style={{ fontSize: 8, letterSpacing: '0.1em', color: muted, marginBottom: 14, fontFamily: "'Space Mono', monospace" }}>{t.weekActivity.toUpperCase()}</div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 64 }}>
          {weekData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 48 }}>
                {d.count > 0
                  ? <div style={{ width: '100%', borderRadius: 4, background: d.done === d.count ? '#34D399' : '#6366F1', height: `${Math.max(5, d.count / maxWeek * 44)}px`, transition: 'height 0.5s', opacity: 0.85 }} />
                  : <div style={{ width: '100%', height: 3, borderRadius: 4, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                }
              </div>
              <span style={{ fontSize: 7, color: muted, fontFamily: "'Space Mono', monospace" }}>{d.day.slice(0, 2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* By tag */}
      {byTag.length > 0 && (
        <div style={{ background: surf, border: `1px solid ${bord}`, borderRadius: 11, padding: '16px' }}>
          <div style={{ fontSize: 8, letterSpacing: '0.1em', color: muted, marginBottom: 10, fontFamily: "'Space Mono', monospace" }}>{t.byTag.toUpperCase()}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {byTag.map((tg) => (
              <div key={tg.label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, background: `${tg.color}12`, border: `1px solid ${tg.color}30` }}>
                <span style={{ fontSize: 10, color: tg.color, fontWeight: 700 }}>#{tg.label}</span>
                <span style={{ fontSize: 9, color: tg.color, fontFamily: "'Space Mono', monospace", opacity: 0.8 }}>{tg.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
