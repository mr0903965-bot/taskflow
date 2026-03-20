/**
 * SupportCard
 * Shown at the bottom of HelpPanel.
 * Renders a short message + optional donation links.
 * No state, no hooks, no dependencies.
 */
export default function SupportCard({ t, dark, links = {} }) {
  const surf  = dark ? '#1A1A1E' : '#FFFFFF'
  const bord  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
  const textC = dark ? '#EFEFEF' : '#18181B'
  const muted = dark ? 'rgba(255,255,255,0.38)' : '#9CA3AF'

  const hasAnyLink = links.bmac || links.kofi

  const pillBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 12px',
    borderRadius: 99,
    border: `1px solid ${bord}`,
    background: 'transparent',
    color: muted,
    fontSize: 11,
    fontFamily: "'Lato', sans-serif",
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  }

  return (
    <div style={{
      background: surf,
      border: `1px solid ${bord}`,
      borderRadius: 12,
      padding: '16px',
      marginTop: 14,
    }}>
      {/* Heart icon + section label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
      }}>
        <span style={{ fontSize: 14 }}>♥</span>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 14,
          fontWeight: 700,
          color: textC,
        }}>Support</span>
      </div>

      {/* Message */}
      <p style={{
        fontSize: 12,
        color: muted,
        lineHeight: 1.7,
        fontFamily: "'Lato', sans-serif",
        margin: '0 0 14px 0',
      }}>
        {t.supportMsg}
      </p>

      {/* Primary button — only if at least one link exists */}
      {hasAnyLink && (
        <a
          href={links.bmac || links.kofi}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            padding: '9px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#6366F1',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.04em',
            textDecoration: 'none',
            cursor: 'pointer',
            marginBottom: 10,
            transition: 'opacity 0.15s',
            boxSizing: 'border-box',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          ♥ {t.supportBtn}
        </a>
      )}

      {/* Individual platform links */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {links.bmac && (
          <a
            href={links.bmac}
            target="_blank"
            rel="noopener noreferrer"
            style={pillBase}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F59E0B'; e.currentTarget.style.borderColor = '#F59E0B' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = muted;     e.currentTarget.style.borderColor = bord }}
          >
            ☕ Buy Me a Coffee
          </a>
        )}
        {links.kofi && (
          <a
            href={links.kofi}
            target="_blank"
            rel="noopener noreferrer"
            style={pillBase}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#06B6D4'; e.currentTarget.style.borderColor = '#06B6D4' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = muted;     e.currentTarget.style.borderColor = bord }}
          >
            🍵 Ko-fi
          </a>
        )}
      </div>
    </div>
  )
}
