import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;

/**
 * Prefer the new publishable key (`sb_publishable_...`).
 * Legacy `anon` JWT keys still work during the migration window (deprecated end of 2026).
 * @see https://supabase.com/docs/guides/getting-started/api-keys
 */
const publicKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

export const isSupabaseConfigured = Boolean(url && publicKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, publicKey!)
  : null;
