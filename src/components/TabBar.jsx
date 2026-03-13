import { P, TL, BD, mn } from '../constants/theme'

const icons = {
  home: c => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  stats: c => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  log: c => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  body: c => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
}

const tabs = [["home", "Hjem"], ["stats", "Statistikk"], ["log", "Logg"], ["body", "Kropp"]]

export default function TabBar({ screen, setScreen }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, display: "flex", justifyContent: "space-around",
      padding: "12px 0 28px", backgroundColor: "rgba(10,10,15,0.95)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderTop: `1px solid ${BD}`, zIndex: 100
    }}>
      {tabs.map(([id, l]) =>
        <button key={id} onClick={() => setScreen(id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          background: "none", border: "none", cursor: "pointer",
          color: screen === id ? P : TL, fontSize: 10, fontFamily: mn,
          fontWeight: screen === id ? 500 : 400, letterSpacing: "0.05em",
          textTransform: "uppercase", padding: "4px 12px"
        }}>
          {icons[id](screen === id ? P : TL)}
          <span>{l}</span>
        </button>
      )}
    </div>
  )
}
