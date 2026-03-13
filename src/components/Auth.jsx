import { P, TM, TL, SM, mn, sf, bp, bgg, ip, ba, BG } from '../constants/theme'

export default function Auth({ authEmail, setAuthEmail, authName, setAuthName, authStep, otpCode, setOtpCode, authMsg, sendOTP, verifyOTP, setAuthStep, setAuthMsg }) {
  return (
    <div style={{
      ...ba, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 32, minHeight: "100vh",
      background: `radial-gradient(ellipse at 50% 0%, rgba(124,92,252,0.15) 0%, transparent 60%), ${BG}`
    }}>
      {authStep === "email" ? (
        <div className="fade-in">
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `linear-gradient(135deg, ${P}, #6344d0)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px", boxShadow: `0 8px 32px rgba(124,92,252,0.4)`
          }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>Urge</div>
          <div style={{
            fontSize: 16, color: TM, marginBottom: 40, textAlign: "center",
            maxWidth: 280, lineHeight: 1.6, margin: "0 auto 40px"
          }}>
            Bygg vanen. Motstå fristelsen.<br />Se fremgangen.
          </div>
          <div style={{ width: "100%", maxWidth: 320, margin: "0 auto" }}>
            <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Navn</div>
            <input type="text" placeholder="Ditt navn" value={authName} onChange={e => setAuthName(e.target.value)} style={ip} />
            <div style={{ fontSize: 12, fontFamily: mn, color: TL, marginBottom: 6, marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>Epost</div>
            <input type="email" placeholder="din@epost.no" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={ip} />
            {authMsg && <div style={{ fontSize: 13, color: SM, marginBottom: 10 }}>{authMsg}</div>}
            <button onClick={() => { if (authEmail && authName) sendOTP() }} disabled={!authEmail || !authName} style={{ ...bp, marginTop: 16, opacity: authEmail && authName ? 1 : .4 }}>Send kode</button>
          </div>
        </div>
      ) : authStep === "otp" ? (
        <div className="fade-in" style={{ textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `linear-gradient(135deg, ${P}, #6344d0)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px", boxShadow: `0 8px 32px rgba(124,92,252,0.4)`
          }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Skriv inn koden</div>
          <div style={{ fontSize: 15, color: TM, maxWidth: 280, lineHeight: 1.5, marginBottom: 8 }}>Vi har sendt en 6-sifret kode til</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: P, marginBottom: 28 }}>{authEmail}</div>
          <input type="text" inputMode="numeric" maxLength="6" placeholder="000000" value={otpCode}
            onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
            style={{ ...ip, textAlign: "center", fontSize: 28, fontFamily: mn, letterSpacing: "0.3em", fontWeight: 700, maxWidth: 240, margin: "0 auto", marginBottom: 10 }} />
          {authMsg && <div style={{ fontSize: 13, color: SM, marginBottom: 10 }}>{authMsg}</div>}
          <button onClick={() => { if (otpCode.length === 6) verifyOTP() }} disabled={otpCode.length !== 6} style={{ ...bp, maxWidth: 320, opacity: otpCode.length === 6 ? 1 : .4 }}>Bekreft</button>
          <button onClick={() => { setAuthStep("email"); setOtpCode(""); setAuthMsg("") }} style={{ ...bgg, marginTop: 10, maxWidth: 320 }}>Tilbake</button>
          <button onClick={sendOTP} style={{ background: "none", border: "none", color: TL, fontSize: 13, fontFamily: mn, cursor: "pointer", marginTop: 16 }}>Send kode på nytt</button>
        </div>
      ) : authStep === "loading" ? (
        <div>
          <div style={{ fontSize: 14, fontFamily: mn, color: TL, animation: "pulse 1.5s infinite" }}>Vennligst vent...</div>
        </div>
      ) : null}
    </div>
  )
}
