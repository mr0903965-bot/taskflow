import { useEffect, useRef } from 'react'
import SupportCard from './SupportCard'

// Donation links — set your own URLs here, or leave empty to hide
const SUPPORT_LINKS = {
  bmac: 'https://buymeacoffee.com/YOUR_USERNAME',
  kofi: 'https://ko-fi.com/YOUR_USERNAME',
}

// Feature pill icon map — stable, language-independent
const FEAT_ICONS = ['🌍','🌙','📅','📊','↻','↓↑','🔔','💾','⚡','☑']

export default function HelpPanel({ t, dark, onClose }) {
  const closeRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Focus the close button on open for accessibility
  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  // Detect mobile for slide direction
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 520

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const bg     = dark ? '#111113' : '#FAFAF8'
  const surf   = dark ? '#1A1A1E' : '#FFFFFF'
  const bord   = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
  const textC  = dark ? '#EFEFEF' : '#18181B'
  const muted  = dark ? 'rgba(255,255,255,0.38)' : '#9CA3AF'
  const subtle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'

  // ── Shared section header style ─────────────────────────────────────────────
  const SectionHead = ({ icon, label }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
    }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 14, fontWeight: 700, color: textC,
      }}>{label}</span>
    </div>
  )

  // ── Panel styles (desktop: slide from right / mobile: slide from bottom) ───
  const panelStyle = isMobile ? {
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    height: 'auto', maxHeight: '85vh',
    background: bg,
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
    overflowY: 'auto',
    zIndex: 900,
    animation: 'helpSlideUp 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
  } : {
    position: 'fixed',
    top: 0, right: 0, bottom: 0,
    width: 340,
    background: bg,
    borderLeft: `1px solid ${bord}`,
    boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
    overflowY: 'auto',
    zIndex: 900,
    animation: 'helpSlideIn 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
  }

  return (
    <>
      <style>{`
        @keyframes helpSlideIn {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes helpSlideUp {
          from { transform: translateY(100%); opacity: 0.6; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-help-panel] { animation: none !important; }
        }
      `}</style>

      {/* Overlay — click to close */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.28)',
          zIndex: 899,
          animation: 'fadeIn 200ms ease both',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label={t.helpTitle}
        data-help-panel
        style={panelStyle}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 14px',
          borderBottom: `1px solid ${bord}`,
          position: 'sticky', top: 0,
          background: bg,
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.1em', color: muted,
            }}>?</span>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 16, fontWeight: 900, color: textC,
            }}>{t.helpTitle}</span>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7,
              border: `1px solid ${bord}`,
              background: 'transparent',
              color: muted, fontSize: 18, lineHeight: 1,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = textC; e.currentTarget.style.borderColor = textC }}
            onMouseLeave={(e) => { e.currentTarget.style.color = muted; e.currentTarget.style.borderColor = bord }}
          >×</button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '20px' }}>

          {/* ① What is TaskFlow */}
          <div style={{
            background: surf, border: `1px solid ${bord}`,
            borderRadius: 12, padding: '16px', marginBottom: 14,
          }}>
            <SectionHead icon="✦" label={t.helpWhat} />
            <p style={{
              fontSize: 12, color: muted, lineHeight: 1.7,
              fontFamily: "'Lato', sans-serif", margin: 0,
            }}>{t.helpDesc}</p>
          </div>

          {/* ② Quick steps */}
          <div style={{
            background: surf, border: `1px solid ${bord}`,
            borderRadius: 12, padding: '16px', marginBottom: 14,
          }}>
            <SectionHead icon="→" label={t.helpHowTo} />
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {t.helpSteps.map((step, i) => (
                <li key={i} style={{
                  fontSize: 12, color: textC, lineHeight: 1.65,
                  fontFamily: "'Lato', sans-serif",
                  marginBottom: i < t.helpSteps.length - 1 ? 8 : 0,
                  paddingLeft: 4,
                }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* ③ Key features */}
          <div style={{
            background: surf, border: `1px solid ${bord}`,
            borderRadius: 12, padding: '16px',
          }}>
            <SectionHead icon="★" label={t.helpFeatures} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 7,
            }}>
              {t.helpFeatList.map((feat, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 10px',
                  background: subtle,
                  borderRadius: 8,
                  border: `1px solid ${bord}`,
                }}>
                  <span style={{ fontSize: 13, flexShrink: 0 }}>{FEAT_ICONS[i] || '•'}</span>
                  <span style={{
                    fontSize: 11, color: textC,
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <SupportCard t={t} dark={dark} links={SUPPORT_LINKS} />

          <div style={{
            marginTop: 16, textAlign: 'center',
            fontSize: 10, color: muted,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.06em',
          }}>
            TASKFLOW ✦ v1.0
          </div>

        </div>
      </div>
    </>
  )
}
