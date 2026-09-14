/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PASSWORD_HASH?: string;
  readonly VITE_APP_PASSWORD_SALT?: string;
  readonly VITE_FEEDBACK_FORM_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
