import DueBadge from './DueBadge'
import { getDaysLeft } from '../utils/helpers'

export default function TaskItem({ task, PRIORITIES, TAGS, dark, t, onToggle, onToggleSubtask, onEdit, onRemove }) {
  const pri    = PRIORITIES.find((p) => p.label === task.priority) || PRIORITIES[2]
  const days   = getDaysLeft(task.due)
  const urgent = !task.done && days !== null && days <= 1
  const subs      = task.subtasks || []
  const subsDone  = subs.filter((s) => s.done).length
  const hasSubs   = subs.length > 0

  const surf  = dark ? '#1A1A1E' : '#FFFFFF'
  const bord  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textC = dark ? '#EFEFEF' : '#18181B'
  const muted = dark ? 'rgba(255,255,255,0.33)' : '#9CA3AF'

  return (
    <div style={{
      background: surf,
      border: `1px solid ${urgent && !task.done ? 'rgba(239,68,68,0.25)' : bord}`,
      borderRadius: 10, overflow: 'hidden',
      transition: 'all 0.2s', opacity: task.done ? 0.48 : 1,
      boxShadow: task.done ? 'none' : dark ? '0 1px 8px rgba(0,0,0,0.22)' : '0 1px 5px rgba(0,0,0,0.04)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{ padding: '11px 12px', display: 'flex', gap: 10, alignItems: 'flex-start', position: 'relative' }}>
        {/* Priority stripe */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: task.done ? (dark ? '#2a2a2a' : '#e5e7eb') : pri.color, borderRadius: '10px 0 0 10px' }} />

        {/* Checkbox */}
        <button onClick={() => onToggle(task.id)} style={{
          width: 17, height: 17, borderRadius: 4, flexShrink: 0, border: '2px solid', marginTop: 1, marginLeft: 6,
          borderColor: task.done ? (dark ? '#444' : '#d1d5db') : pri.color,
          background: task.done ? (dark ? '#444' : '#d1d5db') : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 0,
        }}>
          {task.done && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: task.done ? 400 : 700, marginBottom: hasSubs ? 5 : 0, color: task.done ? muted : textC, textDecoration: task.done ? 'line-through' : 'none', lineHeight: 1.4 }}>
            {task.text}
          </div>

          {/* Subtask progress */}
          {hasSubs && (
            <div style={{ marginBottom: 5 }}>
              <div style={{ height: 2, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 2 }}>
                <div style={{ width: `${subs.length ? Math.round(subsDone / subs.length * 100) : 0}%`, height: '100%', background: '#6366F1', borderRadius: 99, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: 8, color: muted, fontFamily: "'Space Mono', monospace" }}>{subsDone}/{subs.length} {t.completed}</span>
            </div>
          )}

          {/* Badges */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
              background: task.done ? (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : pri.bg,
              color: task.done ? muted : pri.color,
              border: `1px solid ${task.done ? 'transparent' : pri.border}`,
              fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em',
            }}>{task.priority.toUpperCase()}</span>
            <DueBadge due={task.due} done={task.done} t={t} />
            {task.tags.map((tag) => {
              const tc = TAGS.find((x) => x.label === tag)
              return <span key={tag} style={{ fontSize: 8, color: task.done ? muted : (tc?.color || '#aaa') }}>#{tag}</span>
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 12, padding: 2, lineHeight: 1, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.target.style.color = '#6366F1')}
            onMouseLeave={(e) => (e.target.style.color = muted)}>✎</button>
          <button onClick={() => onRemove(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 15, padding: 2, lineHeight: 1, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.target.style.color = '#EF4444')}
            onMouseLeave={(e) => (e.target.style.color = muted)}>×</button>
        </div>
      </div>

      {/* Subtasks inline */}
      {hasSubs && !task.done && (
        <div style={{ padding: '0 12px 10px 35px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {subs.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 7px', background: dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)', borderRadius: 5 }}>
              <button onClick={() => onToggleSubtask(task.id, s.id)} style={{
                width: 12, height: 12, borderRadius: 3, border: '1.5px solid',
                borderColor: s.done ? '#34D399' : 'rgba(100,116,139,0.35)',
                background: s.done ? '#34D399' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0,
              }}>
                {s.done && <span style={{ color: '#fff', fontSize: 7 }}>✓</span>}
              </button>
              <span style={{ fontSize: 10, color: s.done ? muted : textC, textDecoration: s.done ? 'line-through' : 'none', flex: 1 }}>{s.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
