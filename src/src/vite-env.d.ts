/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  // Agrega más variables de entorno aquí según necesites
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}