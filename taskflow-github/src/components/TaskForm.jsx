import { useState } from 'react'
import { getDaysLeft } from '../utils/helpers'
import { playSound } from '../utils/helpers'

export default function TaskForm({ t, PRIORITIES, TAGS, dark, onAdd, onCancel }) {
  const [form, setForm]     = useState({ text: '', priority: t.priLabels[2], tags: [], due: '' })
  const [newSub, setNewSub] = useState('')
  const [formSubs, setFormSubs] = useState([])

  const surf  = dark ? '#1A1A1E' : '#FFFFFF'
  const bord  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textC = dark ? '#EFEFEF' : '#18181B'
  const muted = dark ? 'rgba(255,255,255,0.33)' : '#9CA3AF'
  const bg    = dark ? '#0E0E11' : '#F5F4F0'

  const toggleTag = (tag) =>
    setForm((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((x) => x !== tag) : [...f.tags, tag] }))

  const addFormSub = () => {
    if (!newSub.trim()) return
    setFormSubs((s) => [...s, { id: Date.now(), text: newSub.trim(), done: false }])
    setNewSub('')
    playSound('subtask')
  }

  const handleAdd = () => {
    if (!form.text.trim()) return
    onAdd(form, formSubs)
  }

  const handleCancel = () => {
    setForm({ text: '', priority: t.priLabels[2], tags: [], due: '' })
    setFormSubs([])
    setNewSub('')
    onCancel()
  }

  const days = getDaysLeft(form.due)
  let dueHint = ''
  if (form.due) {
    if (days === 0)      dueHint = t.today
    else if (days === 1) dueHint = t.tomorrow
    else if (days < 0)   dueHint = `${t.expiredAgo} ${Math.abs(days)}d`
    else                 dueHint = `${t.expiresIn} ${days} ${t.days}`
  }

  return (
    <div style={{ background: surf, border: `1.5px solid ${bord}`, borderRadius: 12, padding: '15px', boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.05)', animation: 'fadeIn 0.2s ease' }}>
      {/* Text input */}
      <input
        autoFocus
        value={form.text}
        onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder={t.whatTodo}
        style={{ width: '100%', border: 'none', borderBottom: `2px solid ${textC}`, padding: '4px 0', fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: 700, outline: 'none', marginBottom: 12, background: 'transparent', color: textC }}
      />

      {/* Priority */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 7, letterSpacing: '0.12em', color: muted, marginBottom: 5, fontFamily: "'Space Mono', monospace" }}>{t.priority}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {PRIORITIES.map((p) => (
            <button key={p.label} onClick={() => setForm((f) => ({ ...f, priority: p.label }))} style={{
              padding: '3px 10px', borderRadius: 5, border: '1.5px solid',
              borderColor: form.priority === p.label ? p.color : bord,
              background: form.priority === p.label ? p.bg : 'transparent',
              color: form.priority === p.label ? p.color : muted,
              fontSize: 8, fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: 'pointer',
            }}>{p.label.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Due date */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 7, letterSpacing: '0.12em', color: muted, marginBottom: 5, fontFamily: "'Space Mono', monospace" }}>{t.dueDate}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <input type="date" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
            style={{ padding: '4px 8px', border: `1px solid ${bord}`, borderRadius: 5, fontSize: 10, fontFamily: "'Space Mono', monospace", color: textC, outline: 'none', background: surf, colorScheme: dark ? 'dark' : 'light' }} />
          {dueHint && <span style={{ fontSize: 8, color: muted }}>{dueHint}</span>}
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 7, letterSpacing: '0.12em', color: muted, marginBottom: 5, fontFamily: "'Space Mono', monospace" }}>{t.tags}</div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {TAGS.map((tag) => (
            <button key={tag.label} onClick={() => toggleTag(tag.label)} style={{
              padding: '2px 7px', borderRadius: 99, cursor: 'pointer', border: '1px solid',
              borderColor: form.tags.includes(tag.label) ? tag.color : bord,
              background: form.tags.includes(tag.label) ? `${tag.color}18` : 'transparent',
              color: form.tags.includes(tag.label) ? tag.color : muted, fontSize: 8,
            }}>#{tag.label}</button>
          ))}
        </div>
      </div>

      {/* Subtasks */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 7, letterSpacing: '0.12em', color: muted, marginBottom: 5, fontFamily: "'Space Mono', monospace" }}>{t.subtasks.toUpperCase()}</div>
        {formSubs.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 0', fontSize: 10, color: textC }}>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#6366F1', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{s.text}</span>
            <button onClick={() => setFormSubs((fs) => fs.filter((x) => x.id !== s.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 12, padding: 0 }}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          <input value={newSub} onChange={(e) => setNewSub(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFormSub())}
            placeholder={t.addSubtask}
            style={{ flex: 1, padding: '4px 7px', border: `1px solid ${bord}`, borderRadius: 5, fontSize: 10, fontFamily: "'Lato', sans-serif", background: 'transparent', color: textC, outline: 'none' }} />
          <button onClick={addFormSub} style={{ padding: '4px 9px', borderRadius: 5, border: `1px solid ${bord}`, background: 'transparent', color: muted, cursor: 'pointer', fontSize: 13 }}>+</button>
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: 5 }}>
        <button onClick={handleAdd} style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: textC, color: bg, fontSize: 11, fontWeight: 700, fontFamily: "'Lato', sans-serif", cursor: 'pointer' }}>{t.add}</button>
        <button onClick={handleCancel} style={{ padding: '8px 13px', borderRadius: 7, border: `1px solid ${bord}`, background: 'transparent', color: muted, fontSize: 11, fontFamily: "'Lato', sans-serif", cursor: 'pointer' }}>{t.cancel}</button>
      </div>
    </div>
  )
}
