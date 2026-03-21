/**
 * SupportButton
 * Reusable "☕ Apoyar" button that opens the Buy Me a Coffee link.
 * Two variants:
 *   - "header"  → compact pill for the header toolbar
 *   - "inline"  → wider card with supporting text for below the task list
 */

const BMAC_URL = 'https://buymeacoffee.com/TaskFloww'

export default function SupportButton({ dark, variant = 'header' }) {
  const muted  = dark ? 'rgba(255,255,255,0.35)' : '#9CA3AF'
  const bord   = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'
  const textC  = dark ? '#EFEFEF' : '#18181B'
  const surf   = dark ? '#1A1A1E' : '#FFFFFF'

  const handleOpen = () => {
    window.open(BMAC_URL, '_blank', 'noopener,noreferrer')
  }

  // ── Header variant — compact pill ─────────────────────────────────────────
  if (variant === 'header') {
    return (
      <button
        onClick={handleOpen}
        title="Apoyar TaskFlow en Buy Me a Coffee"
        style={{
          height: 28,
          padding: '0 10px',
          borderRadius: 99,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.65)',
          fontSize: 11,
          fontFamily: "'Lato', sans-serif",
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          whiteSpace: 'nowrap',
          transition: 'background 0.2s, color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(245,158,11,0.18)'
          e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'
          e.currentTarget.style.color = '#FCD34D'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
        }}
      >
        ☕ <span>Apoyar</span>
      </button>
    )
  }

  // ── Inline variant — subtle card below the task list ──────────────────────
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 20,
      padding: '12px 14px',
      borderRadius: 10,
      border: `1px solid ${bord}`,
      background: surf,
      boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <span style={{
        fontSize: 10,
        color: dark ? 'rgba(255,255,255,0.25)' : '#C4C4C4',
        fontFamily: "'Lato', sans-serif",
        lineHeight: 1.5,
      }}>
        Si TaskFlow te ayuda a organizarte, puedes apoyarlo con una donación ☕
      </span>

      <button
        onClick={handleOpen}
        style={{
          flexShrink: 0,
          padding: '6px 13px',
          borderRadius: 99,
          border: `1.5px solid ${bord}`,
          background: 'transparent',
          color: muted,
          fontSize: 11,
          fontFamily: "'Lato', sans-serif",
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'color 0.2s, border-color 0.2s, background 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#F59E0B'
          e.currentTarget.style.borderColor = '#F59E0B'
          e.currentTarget.style.background = 'rgba(245,158,11,0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = muted
          e.currentTarget.style.borderColor = bord
          e.currentTarget.style.background = 'transparent'
        }}
      >
        ☕ Apoyar
      </button>
    </div>
  )
}
