import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"
import { WITHINGS_TOKEN_URL, WITHINGS_MEASURE_URL, MEASURE_TYPES, decodeMeasure } from "../_shared/withings.ts"

async function refreshToken(supabaseAdmin: any, token: any): Promise<string | null> {
  const clientId = Deno.env.get("WITHINGS_CLIENT_ID")!
  const secret = Deno.env.get("WITHINGS_CLIENT_SECRET")!

  const res = await fetch(WITHINGS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      action: "requesttoken",
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: secret,
      refresh_token: token.refresh_token,
    }),
  })

  const data = await res.json()
  if (data.status !== 0 || !data.body?.access_token) {
    console.error("Refresh failed:", data)
    return null
  }

  await supabaseAdmin.from("withings_tokens").update({
    access_token: data.body.access_token,
    refresh_token: data.body.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.body.expires_in,
    updated_at: new Date().toISOString(),
  }).eq("user_id", token.user_id)

  return data.body.access_token
}

async function getValidToken(supabaseAdmin: any, token: any): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000)
  if (token.expires_at > now + 60) return token.access_token
  return await refreshToken(supabaseAdmin, token)
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders })

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return new Response("Unauthorized", { status: 401, headers: corsHeaders })

    const { action } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // Get stored token
    const { data: token } = await supabaseAdmin
      .from("withings_tokens")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    // STATUS
    if (action === "status") {
      return new Response(JSON.stringify({ connected: !!token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // DISCONNECT
    if (action === "disconnect") {
      if (token) {
        await supabaseAdmin.from("withings_tokens").delete().eq("user_id", user.id)
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // SYNC
    if (action === "sync") {
      if (!token) {
        return new Response(JSON.stringify({ error: "Not connected" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const accessToken = await getValidToken(supabaseAdmin, token)
      if (!accessToken) {
        // Token invalid, remove it
        await supabaseAdmin.from("withings_tokens").delete().eq("user_id", user.id)
        return new Response(JSON.stringify({ error: "Token expired, please reconnect" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Fetch last 30 days of measurements
      const startdate = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60
      const enddate = Math.floor(Date.now() / 1000)

      const measRes = await fetch(WITHINGS_MEASURE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${accessToken}`,
        },
        body: new URLSearchParams({
          action: "getmeas",
          category: "1",
          startdate: startdate.toString(),
          enddate: enddate.toString(),
        }),
      })

      const measData = await measRes.json()

      if (measData.status !== 0) {
        return new Response(JSON.stringify({ error: `Withings API-feil (${measData.status})` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const groups = measData.body?.measuregrps || []
      if (groups.length === 0) {
        return new Response(JSON.stringify({ ok: true, synced: 0, message: "Ingen nye målinger" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      let synced = 0

      for (const grp of groups) {
        const externalId = `withings_${grp.grpid}`
        const date = new Date(grp.date * 1000)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

        let kg: number | null = null
        let fat: number | null = null
        let muscle: number | null = null

        for (const m of grp.measures) {
          const val = decodeMeasure(m.value, m.unit)
          if (m.type === MEASURE_TYPES.WEIGHT) kg = val
          if (m.type === MEASURE_TYPES.FAT_PERCENT) fat = val
          if (m.type === MEASURE_TYPES.MUSCLE_MASS) {
            // Withings gives muscle mass in kg; convert to % if we have weight
            if (kg && val > 0) muscle = parseFloat(((val / kg) * 100).toFixed(1))
          }
        }

        if (kg === null) continue

        const { error: upsertErr } = await supabaseAdmin.from("weights").upsert({
          user_id: user.id,
          kg,
          fat,
          muscle,
          date: dateStr,
          source: "withings",
          external_id: externalId,
        }, { onConflict: "user_id,date" })

        if (upsertErr) {
          console.error("Upsert error:", upsertErr)
        } else {
          synced++
        }
      }

      return new Response(JSON.stringify({ ok: true, synced }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (e) {
    console.error("withings-sync error:", e)
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
