import { TODAY } from '../data/constants'

export function getDaysLeft(due) {
  if (!due) return null
  return Math.ceil((new Date(due + 'T00:00:00') - TODAY) / 86400000)
}

export function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const play = (freq, start, dur, vol = 0.15) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g)
      g.connect(ctx.destination)
      o.frequency.value = freq
      g.gain.setValueAtTime(vol, ctx.currentTime + start)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
      o.start(ctx.currentTime + start)
      o.stop(ctx.currentTime + start + dur)
    }
    if (type === 'add')     { play(440, 0, 0.06); play(660, 0.07, 0.12) }
    if (type === 'done')    { play(523, 0, 0.1); play(659, 0.08, 0.1); play(784, 0.16, 0.18) }
    if (type === 'delete')  { play(280, 0, 0.06); play(200, 0.05, 0.12, 0.1) }
    if (type === 'edit')    { play(550, 0, 0.08); play(500, 0.07, 0.1, 0.1) }
    if (type === 'subtask') { play(660, 0, 0.07, 0.1) }
    if (type === 'sync')    { play(880, 0, 0.05, 0.07); play(1100, 0.06, 0.08, 0.05) }
  } catch {
    // AudioContext not available
  }
}

export function ls(key, defaultValue) {
  try {
    const v = localStorage.getItem(key)
    return v !== null ? JSON.parse(v) : defaultValue
  } catch {
    return defaultValue
  }
}

export function lsSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage not available
  }
}

export function getLocale(lang) {
  const map = { es: 'es-MX', en: 'en-US', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR', ja: 'ja-JP' }
  return map[lang] || 'es-MX'
}

/**
 * Given a due date string (YYYY-MM-DD) and a recurrence type,
 * returns the next due date string.
 * If due is empty/null, uses today as the base.
 *
 * @param {string|null} due        - Current due date e.g. "2026-03-18"
 * @param {string}      recurrence - "daily" | "weekly" | "monthly"
 * @returns {string}               - Next due date as "YYYY-MM-DD"
 */
export function getNextDueDate(due, recurrence) {
  const base = due ? new Date(due + 'T00:00:00') : new Date()

  if (recurrence === 'daily') {
    base.setDate(base.getDate() + 1)
  } else if (recurrence === 'weekly') {
    base.setDate(base.getDate() + 7)
  } else if (recurrence === 'monthly') {
    base.setMonth(base.getMonth() + 1)
  }

  const y = base.getFullYear()
  const m = String(base.getMonth() + 1).padStart(2, '0')
  const d = String(base.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
