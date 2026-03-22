/**
 * AppFooter
 * Minimal informational footer rendered at the bottom of the app.
 * No state, no hooks, no dependencies.
 * Accepts `t` for i18n — email address is never translated.
 */
export default function AppFooter({ dark, t }) {
  const bord  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const muted = dark ? 'rgba(255,255,255,0.22)' : '#C0C0C0'
  const link  = dark ? 'rgba(255,255,255,0.30)' : '#A8A8A8'

  const text = {
    fontSize: 10,
    fontFamily: "'Lato', sans-serif",
    color: muted,
    lineHeight: 1.6,
    margin: 0,
  }

  return (
    <footer style={{
      borderTop: `1px solid ${bord}`,
      padding: '20px 26px 24px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 640,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>

        {/* App description */}
        <p style={text}>{t.footerDesc}</p>

        {/* Privacy note */}
        <p style={text}>{t.footerPrivacy}</p>

        {/* Contact — email is intentionally NOT translated */}
        <p style={{ ...text, marginTop: 2 }}>
          {t.footerContact}:{' '}
          <a
            href="mailto:support.taskflow@gmail.com?subject=Soporte%20TaskFlow"
            style={{
              color: link,
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = muted)}
            onMouseLeave={(e) => (e.currentTarget.style.color = link)}
          >
            support.taskflow@gmail.com
          </a>
        </p>

        {/* Built by */}
        <p style={{
          ...text,
          marginTop: 8,
          color: dark ? 'rgba(255,255,255,0.15)' : '#D4D4D4',
          fontSize: 9,
        }}>
          {t.footerBuiltBy}
        </p>

      </div>
    </footer>
  )
}
