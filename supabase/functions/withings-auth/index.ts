import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"
import { WITHINGS_AUTH_URL } from "../_shared/withings.ts"

const encoder = new TextEncoder()

async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("")
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

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return new Response("Unauthorized", { status: 401, headers: corsHeaders })

    const clientId = Deno.env.get("WITHINGS_CLIENT_ID")!
    const secret = Deno.env.get("WITHINGS_CLIENT_SECRET")!
    const redirectUri = Deno.env.get("WITHINGS_REDIRECT_URI")!

    // Create HMAC-signed state: userId.timestamp.signature
    const ts = Date.now().toString()
    const msg = `${user.id}.${ts}`
    const sig = await hmacSign(secret, msg)
    const state = `${user.id}.${ts}.${sig}`

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "user.metrics",
      state,
    })

    const url = `${WITHINGS_AUTH_URL}?${params.toString()}`

    return new Response(JSON.stringify({ url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (e) {
    console.error("withings-auth error:", e)
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
