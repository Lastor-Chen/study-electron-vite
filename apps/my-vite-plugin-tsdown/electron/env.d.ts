/// <reference types="vite/types/importMeta.d.ts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV?: string
  }
}

interface ImportMetaEnv {
  readonly VITE_FOO: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
