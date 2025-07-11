# Electron + vite-vue basic

不使用 electron 的 vite plugin 去綑綁前後端, 配置概念類似傳統 SSR Web。

electron 可以想假想成後端 Server, 前端將最終打包好的 html / css / js 作為靜態資源提供給 electron 啟動 BrowserWindow。

開發模式下, electron 可以用 loadURL 的方式掛載 vite dev server, 讓前端維持原有的 vite HMR 開發方式。但是 electron 這邊得透過 cli 執行，不是直接運行 node，要實現 HMR 就比較困難了。

## Usage

在 workspace root 時...

dev 要開多個終端機, 分別啟動前後端

```
# 先起前端
$ pnpm basic dev:fe

# 掛起 electron
$ pnpm basic dev:elec

# 前後端都打包後, 執行 dist 不掛 vite dev server
$ pnpm basic preview
```

ps. 不能用 `a & b` 的方式串在一起執行, electron 正常關閉時無法關閉 vite, 會殘留在背景

build

```
# vite 打包前端
$ pnpm basic build:fe

# tsdown 編譯 electron ts
$ pnpm basic build:elec

# or tsc 編譯 electron ts
$ pnpm basic build:tsc

# electron-builder 打包
$ pnpm basic build:pack

# 打包整合
$ pnpm basic build
```

## Electron ts 編譯

electron 這邊使用 ts 的話, 需要單獨處理 ts 編譯。由於 preload 限制 CJS, main 如果要走 ESM 會需要分開編譯, tsc 雖能自動根據 .cts 副檔名去編譯不同格式, 可速度較慢。tsdown 或 tsup 雖然速度快, 但得編譯兩次。

要如何把 ts watch 編譯跟 electron restart 綑綁在一起會是個難題。

### tsc / vue-tsc

只有 tsc 編譯時會進行 tscheck 報錯並中斷, 雖然其他編譯器速度快, 但無法強制 type 檢查

- 可自動根據 .cts / .mts 副檔名去編譯成不同 format
- 速度較慢, 需配置 tsconfig
- `vue-tsc -b` 這個 `--build, -b` 是服務於 references 設定, 會將參照有 include 的檔案進行編譯
- 如果 electron 目錄不想被 vue-tsc 一起編譯, 可以不納入 references, 或是不使用 `-b` 改用 `--noEmit -p tsconfig.app.json`

ps. 新的 create-vite vue-ts 模板用了 references 把多個 tsconfig 串起來, build 時 tscheck 改用 `vue-tsc -b` 來掃描所有參照, 他沒寫 `--noEmit` 是因為藏在 `@vue/tsconfig` 裡面了

### tsdown / tsup

tsup 使用 esbuild, tsdown 是 Vue 團隊使用 Rust 開發的後繼者, 用法差不多。

- 這兩套設計概念都是統一編譯, 無法做到細粒度控制 fileA 編譯 esm, fileB 編譯 cjs
  - 可用 array config 批次處理的方式來緩解, 但他實質上還是編譯兩次
- 可參考 electron bin/cli.js 的寫法去整合 watch mode, 實現 afterCompile restart electron
- tsdown 的子依賴有 peer vue-tsc 版本, 不想被限制的話用 tsup

### Vite

因為有 vite-plugin-electron 的存在, 理論上是可以統一走 vite 系統的, 但初步嘗試有些難點待克服。

- 因為 electron 是讀檔案走 `file://` 協定, 前端 build 時要設定 base url 為 `./` 路徑才會對
- 需用 lib mode 搭配 build.ssr 或 rollupOptions.external 才能避免被套件被 bundle
- lib mode 概念是走 entry file 無法指定資料夾, multi files 的情況還不知如何處理
  - 備考: https://github.com/vitejs/vite/discussions/8098

## TODO

- [x] electron ts 編譯時 + watch 重啟
- [] 也許 watch 機制能用程序性呼叫跟前端 vite 綁在同個進入點
