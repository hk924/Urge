import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { WITHINGS_TOKEN_URL } from "../_shared/withings.ts"

const encoder = new TextEncoder()

async function hmacVerify(secret: string, message: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("")
  return expected === signature
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")
    const appUrl = Deno.env.get("APP_URL") || "https://urge.hallgeir.dev"

    if (!code || !state) {
      return Response.redirect(`${appUrl}?withings=error`, 302)
    }

    // Verify HMAC state: userId.timestamp.signature
    const parts = state.split(".")
    if (parts.length !== 3) {
      return Response.redirect(`${appUrl}?withings=error`, 302)
    }

    const [userId, ts, sig] = parts
    const secret = Deno.env.get("WITHINGS_CLIENT_SECRET")!

    const valid = await hmacVerify(secret, `${userId}.${ts}`, sig)
    if (!valid) {
      console.error("Invalid state signature")
      return Response.redirect(`${appUrl}?withings=error`, 302)
    }

    // Check timestamp not too old (15 min)
    const age = Date.now() - parseInt(ts)
    if (age > 15 * 60 * 1000) {
      console.error("State expired")
      return Response.redirect(`${appUrl}?withings=error`, 302)
    }

    // Exchange code for tokens
    const clientId = Deno.env.get("WITHINGS_CLIENT_ID")!
    const redirectUri = Deno.env.get("WITHINGS_REDIRECT_URI")!

    const tokenRes = await fetch(WITHINGS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "requesttoken",
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: secret,
        redirect_uri: redirectUri,
        code,
      }),
    })

    const tokenData = await tokenRes.json()

    if (tokenData.status !== 0 || !tokenData.body?.access_token) {
      console.error("Token exchange failed:", tokenData)
      return Response.redirect(`${appUrl}?withings=error`, 302)
    }

    const { access_token, refresh_token, expires_in, userid, scope } = tokenData.body

    // Store tokens using service_role (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    const { error } = await supabaseAdmin.from("withings_tokens").upsert({
      user_id: userId,
      withings_user_id: String(userid),
      access_token,
      refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + expires_in,
      scope: scope || "user.metrics",
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })

    if (error) {
      console.error("Token store error:", error)
      return Response.redirect(`${appUrl}?withings=error`, 302)
    }

    return Response.redirect(`${appUrl}?withings=connected`, 302)
  } catch (e) {
    console.error("withings-callback error:", e)
    const appUrl = Deno.env.get("APP_URL") || "https://urge.hallgeir.dev"
    return Response.redirect(`${appUrl}?withings=error`, 302)
  }
})
