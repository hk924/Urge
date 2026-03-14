import { P, PL, SM, SML, TM, TL, TX, BD, mn, sf, glass, ba } from '../constants/theme'
import { fd } from '../utils/helpers'
import TriggerIcon from './TriggerIcon'
import TabBar from './TabBar'

export default function Log({ sml, res, triggers, sel, setSel, sc, setScreen }) {
  const all = [
    ...res.map(r => ({ ...r, _type: 'resist' })),
    ...sml.map(s => ({ ...s, _type: 'smell' }))
  ].sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at))

  const triggerLabel = (id) => {
    const t = triggers.find(t => t.id === id)
    return t ? t.label : id
  }

  const triggerIcon = (id) => {
    const t = triggers.find(t => t.id === id)
    return t ? t.icon : "sparkle"
  }

  // Detail view for smell
  if (sel && sel._type === 'smell') {
    const z = sel
    return (
      <div style={{ ...ba, padding: 24, paddingBottom: 32 }} className="fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, marginTop: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>Smell-memo</div>
          <button onClick={() => setSel(null)} style={{ background: "none", border: "none", fontSize: 14, fontFamily: mn, color: TM, cursor: "pointer" }}>Lukk</button>
        </div>
        <div style={{ fontSize: 13, fontFamily: mn, color: TL, marginBottom: 24 }}>{fd(z.date)}</div>
        {z.trigger_text && <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 8 }}>Trigger</div>
          <div style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 300 }}>{z.trigger_text}</div>
        </div>}
        {z.feeling && <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 8 }}>Følelse</div>
          <div style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 300 }}>{z.feeling}</div>
        </div>}
        {z.what && <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 8 }}>Hva ble det</div>
          <div style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 300 }}>{z.what}</div>
        </div>}
        {z.cost > 0 && <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 8 }}>Kostnad</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: SM }}>{z.cost} kr</div>
        </div>}
        {z.what && <>
          <div style={{ height: 1, backgroundColor: BD, margin: "32px 0" }} />
          <div style={{ fontSize: 15, fontStyle: "italic", color: TM, lineHeight: 1.6 }}>Var det verdt det? Husk denne følelsen neste gang.</div>
        </>}
      </div>
    )
  }

  // Detail view for resist
  if (sel && sel._type === 'resist') {
    const z = sel
    return (
      <div style={{ ...ba, padding: 24, paddingBottom: 32 }} className="fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, marginTop: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>Motstått</div>
          <button onClick={() => setSel(null)} style={{ background: "none", border: "none", fontSize: 14, fontFamily: mn, color: TM, cursor: "pointer" }}>Lukk</button>
        </div>
        <div style={{ fontSize: 13, fontFamily: mn, color: TL, marginBottom: 24 }}>{fd(z.date)}</div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 8 }}>Fristelse</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TriggerIcon type={triggerIcon(z.trigger_type)} size={18} color={P} />
            <div style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 300 }}>{triggerLabel(z.trigger_type)}</div>
          </div>
        </div>
        {z.note && <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontFamily: mn, color: TL, textTransform: "uppercase", marginBottom: 8 }}>Situasjon</div>
          <div style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 300 }}>{z.note}</div>
        </div>}
      </div>
    )
  }

  return (
    <div style={ba} className="fade-in">
      <div style={{ padding: "48px 20px 24px" }}>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Logg</div>
        {all.length === 0 ? (
          <div style={{ ...glass, textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 15, color: TL }}>Ingen logg enda!</div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ ...glass, textAlign: "center", background: PL, border: "1px solid rgba(124,92,252,0.15)" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: P }}>{res.length}</div>
                <div style={{ fontSize: 10, fontFamily: mn, color: P, marginTop: 4 }}>Motstått</div>
              </div>
              <div style={{ ...glass, textAlign: "center", background: SML, border: "1px solid rgba(176,124,195,0.15)" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: SM }}>{sml.length}</div>
                <div style={{ fontSize: 10, fontFamily: mn, color: SM, marginTop: 4 }}>Smell</div>
              </div>
            </div>
            {all.map(x =>
              x._type === 'resist' ? (
                <button key={'r' + x.id} onClick={() => setSel(x)} style={{
                  ...glass, width: "100%", textAlign: "left", cursor: "pointer", display: "block",
                  borderLeft: `3px solid ${P}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontFamily: mn, color: TL }}>{fd(x.date)}</div>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{triggerLabel(x.trigger_type)}</div>
                  {x.note && <div style={{ fontSize: 13, color: TM }}>{x.note}</div>}
                </button>
              ) : (
                <button key={'s' + x.id} onClick={() => setSel(x)} style={{
                  ...glass, width: "100%", textAlign: "left", cursor: "pointer", display: "block",
                  borderLeft: `3px solid ${SM}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontFamily: mn, color: TL }}>{fd(x.date)}</div>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={TL} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{x.what || "Ingen detaljer"}</div>
                      {x.trigger_text && <div style={{ fontSize: 13, color: TM }}>{x.trigger_text}</div>}
                    </div>
                    {x.cost > 0 && <div style={{ fontSize: 14, fontFamily: mn, color: SM, fontWeight: 500, flexShrink: 0 }}>{x.cost} kr</div>}
                  </div>
                </button>
              )
            )}
          </>
        )}
      </div>
      <TabBar screen={sc} setScreen={setScreen} />
    </div>
  )
}
