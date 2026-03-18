import { useState, useMemo, useEffect } from 'react'
import LANGS from './data/languages'
import { PRI_COLORS, TAG_COLORS, TODAY } from './data/constants'
import { ls, lsSave, getDaysLeft, getLocale, getNextDueDate } from './utils/helpers'
import { exportTasks, readTaskFile, mergeImport, replaceImport } from './utils/exportImport'
import { useToast } from './hooks/useToast'
import Toast        from './components/Toast'
import DueBadge     from './components/DueBadge'
import TaskItem     from './components/TaskItem'
import TaskForm     from './components/TaskForm'
import EditModal    from './components/EditModal'
import CalendarView from './components/CalendarView'
import StatsView    from './components/StatsView'
import QuickAdd     from './components/QuickAdd'
import HelpPanel    from './components/HelpPanel'

export default function App() {
  // ── Preferences ────────────────────────────────────────────────────────────
  const [lang,  setLang]  = useState(() => ls('tf-lang',  'es'))
  const [dark,  setDark]  = useState(() => ls('tf-dark',  false))
  const [sound, setSound] = useState(() => ls('tf-sound', true))
  useEffect(() => { lsSave('tf-lang',  lang)  }, [lang])
  useEffect(() => { lsSave('tf-dark',  dark)  }, [dark])
  useEffect(() => { lsSave('tf-sound', sound) }, [sound])

  // ── Tasks state ─────────────────────────────────────────────────────────────
  const [tasks,  setTasks]  = useState(() => {
    const saved = ls('tf-tasks', null)
    if (saved) return saved
    return [
      { id:1, text:'Entregar informe Q1', priority:'Urgente', tags:['Trabajo'], due: TODAY.toISOString().split('T')[0], done:false, subtasks:[] },
      { id:2, text:'Pagar renta del mes', priority:'Alta',    tags:['Finanzas'], due: (() => { const d=new Date(TODAY); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0] })(), done:false, subtasks:[{id:101,text:'Transferencia bancaria',done:false},{id:102,text:'Guardar comprobante',done:false}] },
      { id:3, text:'Revisión médica',     priority:'Media',   tags:['Salud'],    due: (() => { const d=new Date(TODAY); d.setDate(d.getDate()+5); return d.toISOString().split('T')[0] })(), done:false, subtasks:[] },
      { id:4, text:'Leer capítulo 7',     priority:'Baja',    tags:['Estudio'],  due: (() => { const d=new Date(TODAY); d.setDate(d.getDate()+10); return d.toISOString().split('T')[0] })(), done:true,  subtasks:[] },
    ]
  })
  const [nextId, setNextId] = useState(() => {
    const saved = ls('tf-tasks', null)
    return saved?.length ? Math.max(...saved.map((x) => x.id)) + 1 : 10
  })
  const [syncStatus, setSyncStatus] = useState('saved')
  const [lastSync,   setLastSync]   = useState(null)

  // ── UI state ────────────────────────────────────────────────────────────────
  const [view,        setView]       = useState('list')
  const [showForm,    setShowForm]   = useState(false)
  const [editTask,    setEditTask]   = useState(null)
  const [filterP,     setFilterP]    = useState(null)
  const [filterT,     setFilterT]    = useState(null)
  const [showDone,    setShowDone]   = useState(true)
  const [sortBy,      setSortBy]     = useState('due')
  const [notifPerm,   setNotifPerm]  = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default')
  const [showLangMenu,  setShowLangMenu]  = useState(false)
  const [deletingIds,   setDeletingIds]   = useState(new Set())  // ids currently animating out
  const [showHelp,      setShowHelp]      = useState(false)

  const { toasts, addToast, removeToast } = useToast()
  const t = LANGS[lang]
  const PRIORITIES = t.priLabels.map((label, i) => ({ label, color: PRI_COLORS[i], bg: `${PRI_COLORS[i]}12`, border: `${PRI_COLORS[i]}40`, num: 4 - i }))
  const TAGS       = t.tagLabels.map((label, i) => ({ label, color: TAG_COLORS[i] }))

  // ── Sync to localStorage ────────────────────────────────────────────────────
  const syncTasks = (newTasks) => {
    setSyncStatus('saving')
    setTimeout(() => {
      lsSave('tf-tasks', newTasks)
      setSyncStatus('saved')
      setLastSync(Date.now())
    }, 600)
  }

  const updateTasks = (updater) => {
    setTasks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      syncTasks(next)
      return next
    })
  }

  // ── Notifications ───────────────────────────────────────────────────────────
  const requestNotif = async () => {
    if (typeof Notification === 'undefined') { addToast(t.notifOff, 'error'); return }
    const p = await Notification.requestPermission()
    setNotifPerm(p)
    addToast(p === 'granted' ? t.notifOn : t.notifOff, p === 'granted' ? 'success' : 'error')
  }

  // ── Task actions ────────────────────────────────────────────────────────────
  const handleAdd = (form, formSubs) => {
    const pri     = form.priority || t.priLabels[2]
    const newTask = { ...form, priority: pri, id: nextId, done: false, subtasks: formSubs }
    updateTasks((prev) => [...prev, newTask])
    setNextId((n) => n + 1)
    const days = getDaysLeft(form.due)
    if (days !== null && days <= 0) addToast(`⚠ "${form.text}" — ${t.urgentWarn}`, 'warning')
    else if (days === 1)            addToast(`⚠ "${form.text}" — ${t.urgentWarn1}`, 'warning')
    else                            addToast(`${t.taskAdded}: "${form.text}"`)
    setShowForm(false)
  }

  const handleSaveEdit = (id, data) => {
    updateTasks((prev) => prev.map((x) => (x.id === id ? { ...x, ...data } : x)))
    addToast(t.taskUpdated)
    setEditTask(null)
  }

  const handleToggle = (id) => {
    setTasks((prev) => {
      const task    = prev.find((x) => x.id === id)
      if (!task) return prev
      const nowDone = !task.done

      // Mark the task done/undone
      let next = prev.map((x) => (x.id === id ? { ...x, done: nowDone } : x))

      // Spawn next occurrence when a recurring task is completed
      if (nowDone && task.recurrence) {
        const nextDue = getNextDueDate(task.due, task.recurrence)
        const spawned = {
          id:         nextId,
          text:       task.text,
          priority:   task.priority,
          tags:       [...task.tags],
          due:        nextDue,
          done:       false,
          subtasks:   [],              // subtasks reset for each occurrence
          recurrence: task.recurrence,
        }
        next = [...next, spawned]
        setNextId((n) => n + 1)
        addToast(`${t.recNextCreated} ${nextDue}`, 'info')
      } else if (nowDone) {
        addToast(`✓ "${task.text}" ${t.taskDone}`)
      }

      syncTasks(next)
      return next
    })
  }

  const handleToggleSub = (taskId, subId) => {
    updateTasks((prev) =>
      prev.map((x) =>
        x.id === taskId
          ? { ...x, subtasks: (x.subtasks || []).map((s) => s.id === subId ? { ...s, done: !s.done } : s) }
          : x
      )
    )
  }

  const handleRemove = (id) => {
    // Phase 1: mark as deleting — TaskItem plays taskExit animation
    setDeletingIds((prev) => new Set(prev).add(id))

    // Phase 2: after animation (250ms), remove from state and clear the id
    setTimeout(() => {
      const task = tasks.find((x) => x.id === id)
      updateTasks((prev) => prev.filter((x) => x.id !== id))
      setDeletingIds((prev) => { const s = new Set(prev); s.delete(id); return s })
      if (task) addToast(`${t.taskDeleted}: "${task.text}"`)
    }, 250)
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    exportTasks(tasks)
    addToast('Export JSON ↓')
  }

  // ── Import ────────────────────────────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be picked again if needed
    e.target.value = ''

    try {
      const raw = await readTaskFile(file)
      const defaultPriority = t.priLabels[2]   // "Media" / "Medium" etc.

      const confirmed = window.confirm(
        `Import ${raw.length} task(s)?\n\nOK = Merge with existing tasks\nCancel = Replace all tasks`
      )

      if (confirmed) {
        // Merge
        const { merged, nextId: newNextId, valid, skipped } = mergeImport(tasks, raw, nextId, defaultPriority)
        setTasks(merged)
        setNextId(newNextId)
        syncTasks(merged)
        const msg = skipped > 0 ? `Imported ${valid} tasks (${skipped} skipped)` : `Imported ${valid} tasks`
        addToast(msg)
      } else {
        // Replace — but only if user explicitly presses Cancel (meaning Replace)
        const doReplace = window.confirm(`Replace ALL current tasks with the ${raw.length} imported task(s)?`)
        if (!doReplace) return
        const { replaced, nextId: newNextId, valid, skipped } = replaceImport(raw, defaultPriority)
        setTasks(replaced)
        setNextId(newNextId)
        syncTasks(replaced)
        const msg = skipped > 0 ? `Replaced with ${valid} tasks (${skipped} skipped)` : `Replaced with ${valid} tasks`
        addToast(msg)
      }
    } catch (err) {
      const messages = {
        NOT_JSON:    'Error: file must be a .json file',
        NOT_ARRAY:   'Error: invalid format — expected a JSON array',
        PARSE_ERROR: 'Error: could not parse JSON file',
        READ_ERROR:  'Error: could not read file',
      }
      addToast(messages[err] || 'Import failed', 'error')
    }
  }

  // ── Filtered & sorted tasks ─────────────────────────────────────────────────
  const getPriNum = (p) => PRIORITIES.find((x) => x.label === p)?.num ?? 0
  const visible = useMemo(() => {
    let list = tasks.filter((x) => (showDone ? true : !x.done))
    if (filterP) list = list.filter((x) => x.priority === filterP)
    if (filterT) list = list.filter((x) => x.tags.includes(filterT))
    if (sortBy === 'due')      list = [...list].sort((a, b) => { if (!a.due) return 1; if (!b.due) return -1; return a.due.localeCompare(b.due) })
    if (sortBy === 'priority') list = [...list].sort((a, b) => getPriNum(b.priority) - getPriNum(a.priority))
    return list
  }, [tasks, filterP, filterT, showDone, sortBy])

  const urgentCount = tasks.filter((x) => !x.done && (x.priority === t.priLabels[0] || (getDaysLeft(x.due) !== null && getDaysLeft(x.due) <= 1))).length
  const doneCount   = tasks.filter((x) => x.done).length
  const pct         = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  // ── Theme ───────────────────────────────────────────────────────────────────
  const bg    = dark ? '#0E0E11' : '#F5F4F0'
  const surf  = dark ? '#1A1A1E' : '#FFFFFF'
  const bord  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textC = dark ? '#EFEFEF' : '#18181B'
  const muted = dark ? 'rgba(255,255,255,0.33)' : '#9CA3AF'
  const head  = dark ? '#09090B' : '#18181B'
  const syncColor = syncStatus === 'saved' ? '#34D399' : syncStatus === 'saving' ? '#F59E0B' : '#EF4444'

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ minHeight: '100vh', background: bg, color: textC, transition: 'background 0.3s' }}
      onClick={() => showLangMenu && setShowLangMenu(false)}
    >
      {/* ── HEADER ── */}
      <div style={{ background: head, color: '#F8F7F4', padding: '22px 26px 18px', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 13 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.16em', color: '#444', marginBottom: 2, fontFamily: "'Space Mono', monospace" }}>
                {TODAY.toLocaleDateString(getLocale(lang), { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>{t.appName}</h1>
            </div>

            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {/* Language selector */}
              <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setShowLangMenu((m) => !m)} style={{ height: 28, padding: '0 8px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: '#E0E0E0' }}>
                  <span>{LANGS[lang].flag}</span>
                  <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", opacity: 0.7 }}>{lang.toUpperCase()}</span>
                </button>
                {showLangMenu && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: dark ? '#1A1A1E' : '#fff', border: `1px solid ${bord}`, borderRadius: 10, overflow: 'hidden', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.3)', minWidth: 150 }}>
                    {Object.entries(LANGS).map(([code, l]) => (
                      <button key={code} onClick={() => { setLang(code); setShowLangMenu(false) }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 12px', background: lang === code ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)') : 'transparent', border: 'none', cursor: 'pointer', color: lang === code ? textC : muted, fontSize: 11 }}>
                        <span>{l.flag}</span><span>{l.name}</span>
                        {lang === code && <span style={{ marginLeft: 'auto', fontSize: 9, color: '#6366F1' }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setSound((s) => !s)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: sound ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sound ? '🔊' : '🔇'}</button>
              <button onClick={requestNotif} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid', borderColor: notifPerm === 'granted' ? '#34D399' : 'rgba(255,255,255,0.1)', background: notifPerm === 'granted' ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔔</button>
              <button onClick={() => setDark((d) => !d)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{dark ? '☀️' : '🌙'}</button>
              <button
                onClick={() => setShowHelp((s) => !s)}
                title={t.helpTitle}
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  border: `1px solid ${showHelp ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  background: showHelp ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Space Mono', monospace", fontWeight: 700,
                  color: showHelp ? '#A5B4FC' : 'rgba(255,255,255,0.6)',
                  transition: 'all 0.2s',
                }}
              >?</button>

              {urgentCount > 0 && (
                <div style={{ background: '#EF4444', color: '#fff', borderRadius: 7, padding: '2px 9px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, fontWeight: 700, lineHeight: 1 }}>{urgentCount}</div>
                  <div style={{ fontSize: 7, opacity: 0.85 }}>{t.urgentes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(255,255,255,0.45)', borderRadius: 99, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: '#444', whiteSpace: 'nowrap' }}>{doneCount}/{tasks.length}</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '18px 26px 80px' }}>

        {/* View tabs + sync indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {[['list', '☰'], ['calendar', '📅'], ['stats', '◎']].map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '4px 11px', borderRadius: 6, border: `1px solid ${bord}`, background: view === v ? textC : 'transparent', color: view === v ? bg : muted, fontSize: 9, fontFamily: "'Space Mono', monospace", cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span>{icon}</span>
                <span>{v === 'list' ? 'LIST' : v === 'calendar' ? t.calTitle.toUpperCase() : t.statsTitle.toUpperCase()}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {syncStatus === 'saving'
              ? <div style={{ width: 5, height: 5, borderRadius: '50%', border: `1.5px solid ${syncColor}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              : <span style={{ width: 5, height: 5, borderRadius: '50%', background: syncColor, display: 'inline-block', transition: 'background 0.3s' }} />
            }
            <span style={{ fontSize: 7, fontFamily: "'Space Mono', monospace", color: syncColor }}>
              💾 {syncStatus === 'saved' ? t.saved : syncStatus === 'saving' ? t.saving : t.syncError}
              {syncStatus === 'saved' && lastSync && <span style={{ opacity: 0.4 }}> {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </span>
          </div>
        </div>

        {/* Views */}
        {view === 'calendar' && <CalendarView tasks={tasks} t={t} dark={dark} />}
        {view === 'stats'    && <StatsView tasks={tasks} t={t} dark={dark} PRIORITIES={PRIORITIES} TAGS={TAGS} onExport={handleExport} onImport={handleImport} />}

        {view === 'list' && (
          <>
            {/* Priority filter pills */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {PRIORITIES.map((p) => (
                <button key={p.label} onClick={() => setFilterP(filterP === p.label ? null : p.label)} style={{ padding: '3px 9px', borderRadius: 5, border: '1.5px solid', borderColor: filterP === p.label ? p.color : bord, background: filterP === p.label ? p.bg : 'transparent', color: filterP === p.label ? p.color : muted, fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', fontFamily: "'Space Mono', monospace", cursor: 'pointer', transition: 'all 0.15s' }}>
                  {p.label.toUpperCase()}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '3px 6px', borderRadius: 5, border: `1px solid ${bord}`, background: surf, fontSize: 8, fontFamily: "'Space Mono', monospace", color: muted, cursor: 'pointer' }}>
                  <option value="due">{t.sortDate}</option>
                  <option value="priority">{t.sortPri}</option>
                </select>
                <button onClick={() => setShowDone((s) => !s)} style={{ padding: '3px 8px', borderRadius: 5, border: `1px solid ${bord}`, background: showDone ? textC : 'transparent', color: showDone ? bg : muted, fontSize: 8, fontFamily: "'Space Mono', monospace", cursor: 'pointer', transition: 'all 0.2s' }}>
                  {showDone ? t.hideD : t.showD}
                </button>
              </div>
            </div>

            {/* Tag filter pills */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 14, flexWrap: 'wrap' }}>
              {TAGS.map((tag) => (
                <button key={tag.label} onClick={() => setFilterT(filterT === tag.label ? null : tag.label)} style={{ padding: '2px 7px', borderRadius: 99, border: '1px solid', borderColor: filterT === tag.label ? tag.color : bord, background: filterT === tag.label ? `${tag.color}18` : 'transparent', color: filterT === tag.label ? tag.color : muted, fontSize: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
                  #{tag.label}
                </button>
              ))}
            </div>

            {/* ── Quick Add bar ── */}
            <QuickAdd
              t={t}
              dark={dark}
              defaultPriority={t.priLabels[2]}
              onAdd={handleAdd}
            />

            {/* Task list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {visible.length === 0 && (
                <div style={{ textAlign: 'center', padding: '34px 0', color: muted }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, marginBottom: 3 }}>{t.allDone}</div>
                  <div style={{ fontSize: 10 }}>{t.noTasks}</div>
                </div>
              )}
              {visible.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  PRIORITIES={PRIORITIES}
                  TAGS={TAGS}
                  dark={dark}
                  t={t}
                  isDeleting={deletingIds.has(task.id)}
                  onToggle={handleToggle}
                  onToggleSubtask={handleToggleSub}
                  onEdit={setEditTask}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Add task */}
            <div style={{ marginTop: 13 }}>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1.5px dashed ${bord}`, background: 'transparent', color: muted, fontSize: 11, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = textC; e.currentTarget.style.color = textC }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = bord;  e.currentTarget.style.color = muted }}
                >
                  {t.addTask}
                </button>
              ) : (
                <TaskForm t={t} PRIORITIES={PRIORITIES} TAGS={TAGS} dark={dark} onAdd={handleAdd} onCancel={() => setShowForm(false)} />
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit modal */}
      {editTask && (
        <EditModal
          task={editTask}
          onSave={(data) => handleSaveEdit(editTask.id, data)}
          onClose={() => setEditTask(null)}
          t={t}
          PRIORITIES={PRIORITIES}
          TAGS={TAGS}
          dark={dark}
        />
      )}

      {showHelp && (
        <HelpPanel t={t} dark={dark} onClose={() => setShowHelp(false)} />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  )
}
