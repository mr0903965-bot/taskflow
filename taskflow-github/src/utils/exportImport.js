/**
 * exportImport.js
 * Pure utility functions for exporting and importing tasks.
 * No React, no side-effects — easy to test in isolation.
 */

// ─── EXPORT ───────────────────────────────────────────────────────────────────

/**
 * Triggers a browser download of the tasks array as a JSON file.
 * Uses a temporary <a> + Blob URL — no server required.
 *
 * @param {Array} tasks - The current tasks array
 */
export function exportTasks(tasks) {
  const dateStr = new Date().toISOString().split('T')[0]           // YYYY-MM-DD
  const filename = `taskflow-${dateStr}.json`
  const json     = JSON.stringify(tasks, null, 2)
  const blob     = new Blob([json], { type: 'application/json' })
  const url      = URL.createObjectURL(blob)

  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  // Release the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── IMPORT ───────────────────────────────────────────────────────────────────

/**
 * Validates and normalises a single raw task object from an imported file.
 * Returns a clean task object, or null if the item is fundamentally invalid.
 *
 * Rules:
 *  - Must have a string `text` (non-empty)
 *  - Must have a boolean `done`
 *  - Missing optional fields are filled with safe defaults
 *
 * @param {any} raw - Raw parsed object from the JSON file
 * @param {string} defaultPriority - e.g. "Media" in the current language
 * @returns {Object|null}
 */
export function validateTask(raw, defaultPriority = 'Media') {
  if (!raw || typeof raw !== 'object') return null
  if (typeof raw.text !== 'string' || !raw.text.trim()) return null
  if (typeof raw.done !== 'boolean') return null

  return {
    // Required fields — kept as-is
    text: raw.text.trim(),
    done: raw.done,

    // Optional fields — kept if valid, otherwise default
    priority:   typeof raw.priority === 'string' && raw.priority ? raw.priority : defaultPriority,
    tags:       Array.isArray(raw.tags) ? raw.tags.filter((t) => typeof t === 'string') : [],
    due:        typeof raw.due === 'string' ? raw.due : '',
    subtasks:   Array.isArray(raw.subtasks)
      ? raw.subtasks
          .filter((s) => s && typeof s.text === 'string' && typeof s.done === 'boolean')
          .map((s) => ({ id: s.id ?? Date.now() + Math.random(), text: s.text.trim(), done: s.done }))
      : [],
    recurrence: ['daily', 'weekly', 'monthly'].includes(raw.recurrence) ? raw.recurrence : null,

    // id is intentionally omitted — caller assigns a fresh id
  }
}

/**
 * Reads a File object and resolves with the parsed array,
 * or rejects with a user-facing error message string.
 *
 * @param {File} file
 * @returns {Promise<Array>}
 */
export function readTaskFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/json') {
      reject('NOT_JSON')
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        if (!Array.isArray(parsed)) { reject('NOT_ARRAY'); return }
        resolve(parsed)
      } catch {
        reject('PARSE_ERROR')
      }
    }

    reader.onerror = () => reject('READ_ERROR')
    reader.readAsText(file)
  })
}

/**
 * Merges imported raw items into the existing tasks array.
 * Re-assigns IDs to avoid collisions.
 *
 * @param {Array}  existing        - Current tasks in state
 * @param {Array}  rawImported     - Raw parsed array from file
 * @param {number} nextId          - Current nextId counter
 * @param {string} defaultPriority - Fallback priority label
 * @returns {{ merged: Array, nextId: number, valid: number, skipped: number }}
 */
export function mergeImport(existing, rawImported, nextId, defaultPriority) {
  let idCounter = nextId
  let valid     = 0
  let skipped   = 0

  const newTasks = rawImported.reduce((acc, raw) => {
    const clean = validateTask(raw, defaultPriority)
    if (!clean) { skipped++; return acc }
    acc.push({ ...clean, id: idCounter++ })
    valid++
    return acc
  }, [])

  return {
    merged:  [...existing, ...newTasks],
    nextId:  idCounter,
    valid,
    skipped,
  }
}

/**
 * Replaces current tasks with imported raw items.
 * Re-assigns IDs starting from 1.
 *
 * @param {Array}  rawImported
 * @param {string} defaultPriority
 * @returns {{ replaced: Array, nextId: number, valid: number, skipped: number }}
 */
export function replaceImport(rawImported, defaultPriority) {
  let idCounter = 1
  let valid     = 0
  let skipped   = 0

  const newTasks = rawImported.reduce((acc, raw) => {
    const clean = validateTask(raw, defaultPriority)
    if (!clean) { skipped++; return acc }
    acc.push({ ...clean, id: idCounter++ })
    valid++
    return acc
  }, [])

  return {
    replaced: newTasks,
    nextId:   idCounter,
    valid,
    skipped,
  }
}
