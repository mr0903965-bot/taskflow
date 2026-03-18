import DueBadge from './DueBadge'
import { getDaysLeft } from '../utils/helpers'

export default function TaskItem({
  task,
  PRIORITIES,
  TAGS,
  dark,
  t,
  isDeleting,   // ← new: triggers exit animation
  onToggle,
  onToggleSubtask,
  onEdit,
  onRemove,
}) {
  const pri       = PRIORITIES.find((p) => p.label === task.priority) || PRIORITIES[2]
  const days      = getDaysLeft(task.due)
  const urgent    = !task.done && days !== null && days <= 1
  const subs      = task.subtasks || []
  const subsDone  = subs.filter((s) => s.done).length
  const hasSubs   = subs.length > 0

  const surf  = dark ? '#1A1A1E' : '#FFFFFF'
  const bord  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textC = dark ? '#EFEFEF' : '#18181B'
  const muted = dark ? 'rgba(255,255,255,0.33)' : '#9CA3AF'

  // Stripe color: transitions smoothly via .task-priority-stripe CSS class
  const stripeColor = task.done ? (dark ? '#2a2a2a' : '#e5e7eb') : pri.color

  return (
    <div
      // task-enter   → plays once on mount (creation animation)
      // task-exit    → plays when isDeleting is true (removal animation)
      // Neither class is ever both applied at the same time.
      className={isDeleting ? 'task-exit' : 'task-enter'}
      style={{
        background: surf,
        border: `1px solid ${urgent && !task.done ? 'rgba(239,68,68,0.25)' : bord}`,
        borderRadius: 10,
        overflow: 'hidden',
        // opacity and box-shadow still transition inline for the completion state
        opacity:    task.done ? 0.48 : 1,
        transition: 'opacity 300ms ease, box-shadow 300ms ease, border-color 200ms ease',
        boxShadow:  task.done ? 'none' : dark ? '0 1px 8px rgba(0,0,0,0.22)' : '0 1px 5px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ padding: '11px 12px', display: 'flex', gap: 10, alignItems: 'flex-start', position: 'relative' }}>

        {/* Priority stripe — transitions color on completion via CSS class */}
        <div
          className="task-priority-stripe"
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
            background: stripeColor,
            borderRadius: '10px 0 0 10px',
          }}
        />

        {/* Checkbox — spring scale pop via CSS class */}
        <button
          className={`task-checkbox${task.done ? ' is-checked' : ''}`}
          onClick={() => onToggle(task.id)}
          style={{
            width: 17, height: 17, borderRadius: 4, flexShrink: 0,
            border: '2px solid',
            marginTop: 1, marginLeft: 6,
            borderColor: task.done ? (dark ? '#444' : '#d1d5db') : pri.color,
            background:  task.done ? (dark ? '#444' : '#d1d5db') : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          {task.done && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Title — color + opacity transition via CSS class */}
          <div
            className={`task-content-text${task.done ? ' is-done' : ''}`}
            style={{
              fontSize: 12,
              fontWeight:      task.done ? 400 : 700,
              marginBottom:    hasSubs ? 5 : 0,
              color:           task.done ? muted : textC,
              textDecoration:  task.done ? 'line-through' : 'none',
              lineHeight: 1.4,
            }}
          >
            {task.text}
          </div>

          {/* Subtask progress bar */}
          {hasSubs && (
            <div style={{ marginBottom: 5 }}>
              <div style={{ height: 2, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 2 }}>
                <div style={{
                  width: `${subs.length ? Math.round(subsDone / subs.length * 100) : 0}%`,
                  height: '100%', background: '#6366F1', borderRadius: 99,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <span style={{ fontSize: 8, color: muted, fontFamily: "'Space Mono', monospace" }}>
                {subsDone}/{subs.length} {t.completed}
              </span>
            </div>
          )}

          {/* Priority / due / tag badges */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
              background: task.done ? (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : pri.bg,
              color:      task.done ? muted : pri.color,
              border:     `1px solid ${task.done ? 'transparent' : pri.border}`,
              fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em',
              transition: 'color 300ms ease, background 300ms ease, border-color 300ms ease',
            }}>
              {task.priority.toUpperCase()}
            </span>
            <DueBadge due={task.due} done={task.done} t={t} />
            {task.recurrence && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 2,
                padding: '2px 6px', borderRadius: 5,
                background: task.done ? 'rgba(100,116,139,0.08)' : 'rgba(99,102,241,0.10)',
                color: task.done ? muted : '#6366F1',
                fontSize: 9, fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
                border: `1px solid ${task.done ? 'transparent' : 'rgba(99,102,241,0.25)'}`,
                transition: 'color 300ms ease, background 300ms ease',
              }}>
                ↻
              </span>
            )}
            {task.tags.map((tag) => {
              const tc = TAGS.find((x) => x.label === tag)
              return (
                <span
                  key={tag}
                  style={{
                    fontSize: 8,
                    color: task.done ? muted : (tc?.color || '#aaa'),
                    transition: 'color 300ms ease',
                  }}
                >
                  #{tag}
                </span>
              )
            })}
          </div>
        </div>

        {/* Edit + Remove buttons */}
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <button
            onClick={() => onEdit(task)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 12, padding: 2, lineHeight: 1, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.target.style.color = '#6366F1')}
            onMouseLeave={(e) => (e.target.style.color = muted)}
          >✎</button>
          <button
            onClick={() => onRemove(task.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 15, padding: 2, lineHeight: 1, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.target.style.color = '#EF4444')}
            onMouseLeave={(e) => (e.target.style.color = muted)}
          >×</button>
        </div>
      </div>

      {/* Subtasks inline */}
      {hasSubs && !task.done && (
        <div style={{ padding: '0 12px 10px 35px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {subs.map((s) => (
            <div
              key={s.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px 7px',
                background: dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
                borderRadius: 5,
              }}
            >
              <button
                onClick={() => onToggleSubtask(task.id, s.id)}
                style={{
                  width: 12, height: 12, borderRadius: 3, border: '1.5px solid',
                  borderColor:  s.done ? '#34D399' : 'rgba(100,116,139,0.35)',
                  background:   s.done ? '#34D399' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, padding: 0,
                  transition: 'background 200ms ease, border-color 200ms ease, transform 150ms cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                {s.done && <span style={{ color: '#fff', fontSize: 7 }}>✓</span>}
              </button>
              <span style={{
                fontSize: 10, flex: 1,
                color:          s.done ? muted : textC,
                textDecoration: s.done ? 'line-through' : 'none',
                transition:     'color 300ms ease',
              }}>
                {s.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
