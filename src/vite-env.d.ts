/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
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
