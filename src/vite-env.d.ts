/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MPESA_PAYBILL?: string;
  readonly VITE_MPESA_TILL?: string;
  readonly VITE_MPESA_ACCOUNT?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
