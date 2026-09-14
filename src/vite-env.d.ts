/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PASSWORD_HASH?: string;
  readonly VITE_APP_PASSWORD_SALT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
