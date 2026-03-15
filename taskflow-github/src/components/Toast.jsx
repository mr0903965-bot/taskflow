export default function Toast({ toasts, remove }) {
  if (!toasts.length) return null
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.type === 'success' ? '#18181B' : t.type === 'warning' ? '#D97706' : '#DC2626',
          color: '#fff', padding: '10px 15px', borderRadius: 10,
          fontSize: 11, fontFamily: "'Space Mono', monospace", fontWeight: 700,
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 10, maxWidth: 260,
          animation: 'slideIn 0.25s ease',
        }}>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', fontSize: 15, padding: 0,
          }}>×</button>
        </div>
      ))}
    </div>
  )
}
