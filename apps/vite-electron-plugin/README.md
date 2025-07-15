# Electron + vite-plugin-electron

## vite-electron-plugin

- 吃不到此 lib 的 type 定義, 要打 patch 去改
- 它是另外用 swc 去編譯 ts, 而非 vite 的 rollup
- 要設定 esm 應該從 transformOptions.format 去設
- 內部有用到該作者自己寫的 `notBundle` plugin, 所以預設不會被 bundle
- source file 只吃 `.ts` 遇上 `.cts` `.mts` 不會有反應, 開出來的設定改不了, 加上 `.cts` 會報錯
- 即使設定了 transform.format esm, cjs require 仍舊會被保留, 剛好可以處理 preload.ts
- 大概因為 preload 是另外被拉起的, 所以在 type module 的環境下也不會報 require 錯誤
- 要用 `alias` plugin 的話需要另外安裝 `acorn`, 他誤寫在 devDeps 不會一起安裝
- `alias` plugin 在 ESM 模式下不 work, 編譯後無法替換 path
  - 可改用 node.js [Subpath imports](https://nodejs.org/api/packages.html#subpath-imports) 替代

### 優點

- source 可以直接吃 dir
