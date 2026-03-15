import { useState, useCallback, useRef } from 'react'
import { ls, lsSave, playSound } from '../utils/helpers'
import { SAMPLE_TASKS } from '../data/constants'

export function useTasks({ sound, lang, dark, addToast, t }) {
  const [tasks, setTasks] = useState(() => {
    const saved = ls('tf-tasks', null)
    if (saved) return saved
    return SAMPLE_TASKS
  })
  const [nextId, setNextId] = useState(() => {
    const saved = ls('tf-tasks', null)
    if (saved && saved.length) return Math.max(...saved.map((x) => x.id)) + 1
    return 10
  })
  const [syncStatus, setSyncStatus] = useState('saved')
  const [lastSync, setLastSync] = useState(null)
  const syncTimer = useRef(null)

  const snd = useCallback((type) => { if (sound) playSound(type) }, [sound])

  const triggerSync = useCallback((taskList, meta) => {
    setSyncStatus('saving')
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      lsSave('tf-tasks', taskList)
      lsSave('tf-lang', meta.lang)
      lsSave('tf-dark', meta.dark)
      lsSave('tf-sound', meta.sound)
      setSyncStatus('saved')
      setLastSync(Date.now())
      if (meta.sound) playSound('sync')
    }, 800)
  }, [])

  const updateTasks = useCallback((updater, meta) => {
    setTasks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      triggerSync(next, meta)
      return next
    })
  }, [triggerSync])

  const addTask = useCallback((form, formSubs) => {
    const pri = form.priority || t.priLabels[2]
    const newTask = { ...form, priority: pri, id: nextId, done: false, subtasks: formSubs }
    updateTasks((prev) => [...prev, newTask], { lang, dark, sound })
    setNextId((n) => n + 1)
    snd('add')
    const { getDaysLeft } = require('../utils/helpers')
    const days = getDaysLeft(form.due)
    if (days !== null && days <= 0) addToast(`⚠ "${form.text}" — ${t.urgentWarn}`, 'warning')
    else if (days === 1) addToast(`⚠ "${form.text}" — ${t.urgentWarn1}`, 'warning')
    else addToast(`${t.taskAdded}: "${form.text}"`)
  }, [nextId, lang, dark, sound, t, snd, addToast, updateTasks])

  const saveEdit = useCallback((id, data) => {
    updateTasks((prev) => prev.map((x) => (x.id === id ? { ...x, ...data } : x)), { lang, dark, sound })
    snd('edit')
    addToast(t.taskUpdated)
  }, [lang, dark, sound, t, snd, addToast, updateTasks])

  const toggle = useCallback((id) => {
    setTasks((prev) => {
      const task = prev.find((x) => x.id === id)
      if (!task) return prev
      const nowDone = !task.done
      const next = prev.map((x) => (x.id === id ? { ...x, done: nowDone } : x))
      triggerSync(next, { lang, dark, sound })
      snd(nowDone ? 'done' : 'edit')
      if (nowDone) addToast(`✓ "${task.text}" ${t.taskDone}`)
      return next
    })
  }, [lang, dark, sound, t, snd, addToast, triggerSync])

  const toggleSubtask = useCallback((taskId, subId) => {
    updateTasks(
      (prev) => prev.map((x) =>
        x.id === taskId
          ? { ...x, subtasks: (x.subtasks || []).map((s) => s.id === subId ? { ...s, done: !s.done } : s) }
          : x
      ),
      { lang, dark, sound }
    )
    snd('subtask')
  }, [lang, dark, sound, snd, updateTasks])

  const remove = useCallback((id) => {
    setTasks((prev) => {
      const task = prev.find((x) => x.id === id)
      const next = prev.filter((x) => x.id !== id)
      triggerSync(next, { lang, dark, sound })
      snd('delete')
      if (task) addToast(`${t.taskDeleted}: "${task.text}"`)
      return next
    })
  }, [lang, dark, sound, t, snd, addToast, triggerSync])

  return {
    tasks, setTasks, nextId, setNextId,
    syncStatus, lastSync,
    addTask, saveEdit, toggle, toggleSubtask, remove,
    triggerSync,
  }
}
