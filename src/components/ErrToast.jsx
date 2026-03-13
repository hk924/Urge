import { sf } from '../constants/theme'

export default function ErrToast({ err, setErr }) {
  if (!err) return null
  return (
    <div onClick={() => setErr("")} style={{
      position: "fixed", top: 48, left: "50%", transform: "translateX(-50%)",
      backgroundColor: "rgba(176,124,195,0.95)", color: "#fff", padding: "12px 20px",
      borderRadius: 12, fontSize: 14, fontFamily: sf, zIndex: 200,
      maxWidth: 350, textAlign: "center", cursor: "pointer"
    }}>
      {err}
    </div>
  )
}
