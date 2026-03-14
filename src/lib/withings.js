import { supabase } from './supabase'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}

export async function getWithingsAuthUrl() {
  const headers = await authHeaders()
  const res = await fetch(`${FUNCTIONS_URL}/withings-auth`, { headers })
  if (!res.ok) throw new Error('Failed to get auth URL')
  const { url } = await res.json()
  return url
}

export async function getWithingsStatus() {
  const headers = await authHeaders()
  const res = await fetch(`${FUNCTIONS_URL}/withings-sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'status' }),
  })
  if (!res.ok) throw new Error('Failed to get status')
  const { connected } = await res.json()
  return connected
}

export async function syncWithings() {
  const headers = await authHeaders()
  const res = await fetch(`${FUNCTIONS_URL}/withings-sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'sync' }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Sync failed')
  return data
}

export async function disconnectWithings() {
  const headers = await authHeaders()
  const res = await fetch(`${FUNCTIONS_URL}/withings-sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'disconnect' }),
  })
  if (!res.ok) throw new Error('Failed to disconnect')
  return true
}
