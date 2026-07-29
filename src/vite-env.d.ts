/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  /** Preferred public client key (`sb_publishable_...`) */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Legacy anon JWT — fallback only during migration */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_ADMIN_DEMO_PASSWORD?: string;
  readonly VITE_MPESA_PAYBILL?: string;
  readonly VITE_MPESA_TILL?: string;
  readonly VITE_MPESA_ACCOUNT?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
