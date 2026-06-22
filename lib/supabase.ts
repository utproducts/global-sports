import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Browser-safe client (anon/publishable key, protected by RLS).
// Persists the auth session in the browser; on the server it degrades gracefully.
// Returns null if env isn't configured, so pages can render a graceful fallback.
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;
