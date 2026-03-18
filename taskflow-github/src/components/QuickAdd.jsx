import { useState } from 'react'

/**
 * QuickAdd — lightweight always-visible input bar.
 * Creates a task with default values on Enter.
 * Does NOT replace the full TaskForm.
 */
export default function QuickAdd({ t, dark, defaultPriority, onAdd }) {
  const [text, setText] = useState('')

  const bord  = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'
  const textC = dark ? '#EFEFEF' : '#18181B'
  const muted = dark ? 'rgba(255,255,255,0.28)' : '#B0B7C3'
  const surf  = dark ? '#1A1A1E' : '#FFFFFF'
  const accentBord = dark ? 'rgba(99,102,241,0.55)' : 'rgba(99,102,241,0.45)'

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const trimmed = text.trim()
      if (!trimmed) return
      // Call parent with title + sensible defaults
      onAdd(
        {
          text:     trimmed,
          priority: defaultPriority,  // "Media" / "Medium" / etc. in current lang
          tags:     [],
          due:      '',
        },
        [] // empty subtasks
      )
      setText('')
    }
    if (e.key === 'Escape') {
      setText('')
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      borderRadius: 10,
      background: surf,
      border: `1.5px solid ${text.length > 0 ? accentBord : bord}`,
      marginBottom: 10,
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: text.length > 0
        ? '0 0 0 3px rgba(99,102,241,0.08)'
        : dark ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Icon */}
      <span style={{
        fontSize: 14,
        color: text.length > 0 ? '#6366F1' : muted,
        flexShrink: 0,
        transition: 'color 0.2s',
        userSelect: 'none',
      }}>⚡</span>

      {/* Input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`${t.whatTodo.replace('?', '')}… (Enter)`}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontSize: 12,
          fontFamily: "'Lato', sans-serif",
          fontWeight: 500,
          color: textC,
          outline: 'none',
          caretColor: '#6366F1',
        }}
      />

      {/* Hint — only visible while typing */}
      {text.length > 0 && (
        <span style={{
          fontSize: 9,
          fontFamily: "'Space Mono', monospace",
          color: muted,
          flexShrink: 0,
          letterSpacing: '0.04em',
          animation: 'fadeIn 0.15s ease',
        }}>
          ENTER ↵
        </span>
      )}
    </div>
  )
}
