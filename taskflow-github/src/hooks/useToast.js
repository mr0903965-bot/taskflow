import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((ts) => [...ts, { id, message, type }])
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3500)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((ts) => ts.filter((x) => x.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
