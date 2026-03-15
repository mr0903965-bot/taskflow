import { useState } from 'react'

export default function EditModal({ task, onSave, onClose, t, PRIORITIES, TAGS, dark }) {
  const [form, setForm] = useState({
    text: task.text,
    priority: task.priority,
    tags: [...task.tags],
    due: task.due || '',
  })
  const [newSub, setNewSub] = useState('')
  const [subtasks, setSubtasks] = useState(task.subtasks || [])

  const surf  = dark ? '#1C1C1E' : '#fff'
  const bord  = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const textC = dark ? '#F0F0F0' : '#1C1C1E'
  const muted = dark ? 'rgba(255,255,255,0.35)' : '#9CA3AF'

  const toggleTag = (tag) =>
    setForm((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((x) => x !== tag) : [...f.tags, tag] }))

  const addSub = () => {
    if (!newSub.trim()) return
    setSubtasks((s) => [...s, { id: Date.now(), text: newSub.trim(), done: false }])
    setNewSub('')
  }
  const toggleSub  = (id) => setSubtasks((s) => s.map((x) => x.id === id ? { ...x, done: !x.done } : x))
  const removeSub  = (id) => setSubtasks((s) => s.filter((x) => x.id !== id))

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: surf, borderRadius: 16, padding: 22, width: '100%', maxWidth: 460, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: textC }}>{t.editTask}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Text */}
        <input
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          style={{ width: '100%', border: 'none', borderBottom: `2px solid ${textC}`, padding: '4px 0', fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: 700, outline: 'none', marginBottom: 14, background: 'transparent', color: textC }}
        />

        {/* Priority */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: muted, marginBottom: 7, fontFamily: "'Space Mono', monospace" }}>{t.priority}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {PRIORITIES.map((p) => (
              <button key={p.label} onClick={() => setForm((f) => ({ ...f, priority: p.label }))} style={{
                padding: '4px 11px', borderRadius: 5, border: '1.5px solid',
                borderColor: form.priority === p.label ? p.color : bord,
                background: form.priority === p.label ? p.bg : 'transparent',
                color: form.priority === p.label ? p.color : muted,
                fontSize: 9, fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: 'pointer',
              }}>{p.label.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: muted, marginBottom: 7, fontFamily: "'Space Mono', monospace" }}>{t.dueDate}</div>
          <input type="date" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
            style={{ padding: '5px 9px', border: `1px solid ${bord}`, borderRadius: 6, fontSize: 10, fontFamily: "'Space Mono', monospace", color: textC, outline: 'none', background: surf, colorScheme: dark ? 'dark' : 'light' }} />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: muted, marginBottom: 7, fontFamily: "'Space Mono', monospace" }}>{t.tags}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {TAGS.map((tag) => (
              <button key={tag.label} onClick={() => toggleTag(tag.label)} style={{
                padding: '2px 8px', borderRadius: 99, cursor: 'pointer', border: '1px solid',
                borderColor: form.tags.includes(tag.label) ? tag.color : bord,
                background: form.tags.includes(tag.label) ? `${tag.color}18` : 'transparent',
                color: form.tags.includes(tag.label) ? tag.color : muted, fontSize: 9,
              }}>#{tag.label}</button>
            ))}
          </div>
        </div>

        {/* Subtasks */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: muted, marginBottom: 8, fontFamily: "'Space Mono', monospace" }}>{t.subtasks.toUpperCase()}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
            {subtasks.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 9px', background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 6, border: `1px solid ${bord}` }}>
                <button onClick={() => toggleSub(s.id)} style={{ width: 14, height: 14, borderRadius: 3, border: '1.5px solid', borderColor: s.done ? '#34D399' : 'rgba(100,116,139,0.4)', background: s.done ? '#34D399' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}>
                  {s.done && <span style={{ color: '#fff', fontSize: 8 }}>✓</span>}
                </button>
                <span style={{ flex: 1, fontSize: 11, color: s.done ? muted : textC, textDecoration: s.done ? 'line-through' : 'none' }}>{s.text}</span>
                <button onClick={() => removeSub(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 13, padding: 0 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <input value={newSub} onChange={(e) => setNewSub(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSub())}
              placeholder={t.addSubtask}
              style={{ flex: 1, padding: '6px 9px', border: `1px solid ${bord}`, borderRadius: 6, fontSize: 11, fontFamily: "'Lato', sans-serif", background: 'transparent', color: textC, outline: 'none' }} />
            <button onClick={addSub} style={{ padding: '6px 11px', borderRadius: 6, border: `1px solid ${bord}`, background: 'transparent', color: muted, cursor: 'pointer', fontSize: 14 }}>+</button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 7 }}>
          <button onClick={() => onSave({ ...form, subtasks })} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: textC, color: surf, fontSize: 12, fontWeight: 700, fontFamily: "'Lato', sans-serif", cursor: 'pointer' }}>{t.save}</button>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${bord}`, background: 'transparent', color: muted, fontSize: 12, fontFamily: "'Lato', sans-serif", cursor: 'pointer' }}>{t.cancel}</button>
        </div>
      </div>
    </div>
  )
}
