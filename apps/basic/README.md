# Electron + vite-vue basic

不使用 electron 的 vite plugin 去綑綁前後端, 配置概念類似傳統 SSR Web。

electron 可以想假想成後端 Server, 前端將最終打包好的 html / css / js 作為靜態資源提供給 electron 啟動 BrowserWindow。

開發模式下, electron 可以用 loadURL 的方式掛載 vite dev server, 讓前端維持原有的 vite HMR 開發方式。但是 electron 這邊得透過 cli 執行，不是直接運行 node，要實現 HMR 就比較困難了。

```
# 如果可直接透過 node 執行, 就能直接掛 watch mode (node20+)
$ node index.js --watch

# 是透過 electron cli 去跑, 他沒提供 --watch 之類的功能
$ electron index.js
```

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

electron 要走 ESM base 的話, 必需要開啟一些不安全的模式才能使用 ESM 的 preload, 所以多數情況 preload 都建議維持 CJS。

由於 preload 得單獨編譯成 CJS, 所以處理上會產生困難點, 只有 tsc 可以依據 `.cts / .mts` 副檔名去自動判斷, esbuild 這類 bundler 只能多編譯一次單獨處理 preload。

要如何把 ts watch 編譯跟 electron restart 綑綁在一起會是個難題。

### tsc and vue-tsc

只有 tsc 編譯時會進行 tscheck 報錯並中斷, 雖然其他編譯器速度快, 但無法強制 type 檢查

- 可自動根據 .cts / .mts 副檔名去編譯成不同 format
- 速度較慢, 需配置 tsconfig
- `vue-tsc -b` 這個 `--build, -b` 是服務於 references 設定, 會將參照有 include 的檔案進行編譯
- 如果 electron 目錄不想被 vue-tsc 一起編譯, 可以不納入 references, 或是不使用 `-b` 改用 `--noEmit -p tsconfig.app.json`
- tsc 編譯需設定 `moduleResolution: nodenext` 才能限制一定要填副檔名

ps. 新的 create-vite vue-ts 模板用了 references 把多個 tsconfig 串起來, build 時 tscheck 改用 `vue-tsc -b` 來掃描所有參照, 他沒寫 `--noEmit` 是因為藏在 `@vue/tsconfig` 裡面了

### tsdown vs tsup

> tsup 已經宣布不再積極維護, 作者建議改用 tsdown。

tsup 使用 esbuild, tsdown 是 Vue 團隊使用 Rust 開發的後繼者, 用法差不多。

- 這兩套設計概念都是 bundler 而非 compiler, 會從一個 entry 進行統一打包, 無法做到細粒度單獨去控制 A 編譯成 esm, B 編譯成 cjs
  - 可用 array config 批次處理的方式來緩解, 但他實質上還是編譯兩次
- tsdown 對 entry 進行優化, 可以吃 glob `src/**/*.ts`
- tsdown 的子依賴有 peer vue-tsc 版本, 不想被限制的話用 tsup
- 可參考 electron bin/cli.js 的寫法去整合 watch mode, 實現 afterCompile restart electron
- 現況 tsdown 升級可能會造成行為變更, 因為內部 rolldown 還是 beta 版
- tsdown 可以參照 tsconfig 解析 path alias, 但要注意 tsc 不行

### tsdown watch then restart electron

- 可透過 tsdown hooks.build:node 去實現 watch + electron restart
- 有兩個 build 進程, clean 都打開會互相洗掉 (vite-electron-plugin 的作法都關掉 clean)

### ESM vs CJS

混合情況下會有一些坑, 下列變因會互相影響 tsc 判斷, bundler 則不完全看 tsconfig 會有不同行為:

- package.json 的 type 設定
- tsconfig 的 `module`, `moduleResolution` 設定
- 實際是寫 import or require
- `nodenext` 下會看副檔名 `.cts` or `.mts`
- tsconfig 設為 `moduleResolution: bundler` 時, `import 'electron'` ts 會錯誤的去專案找 `electron/index.ts`

type module 混 cjs 編譯時的一些坑:

- 只存在 `.cts` 時, 會報錯說找不到 require 等定義, 但同時存在 `.ts .cts` 則不會出現報錯
- VScode 有時會無法正確判斷是否為 node 環境, require 等關鍵字會時不時紅線, 時不時又正常
- 如果會用到 CJS 語法, 最好都安裝 @types/node 不要依賴自動推斷, 會誤判且行為規則不明
- 用 import 寫可被編譯成 ESM or CJS, 但寫 require 無法被編譯為 ESM
- bundler 會為了處理 .default 的差異, 編譯 import 為 require 時會加上 __toESM 做轉換, tsc 則只會純翻譯
- tsconfig 要設定 `nodenext` 才會去參照 package.json 的 type 設定
- 會統一進 vite 之類打包工具處理的話 tsconfig 的 moduleResolution 應設定為 bundler

### Vite

因為有 vite-plugin-electron 的存在, 理論上是可以統一走 vite 系統的, 但初步嘗試有些難點待克服。

- 因為 electron 是讀檔案走 `file://` 協定, 前端 build 時要設定 base url 為 `./` 路徑才會對
- 需用 lib mode 搭配 build.ssr 或 rollupOptions.external 才能避免被套件被 bundle
- lib mode 概念是走 entry file 無法指定資料夾, multi files 的情況還不知如何處理
  - 備考: https://github.com/vitejs/vite/discussions/8098

## TODO

- [x] electron ts 編譯時 + watch 重啟
- [] 也許 watch 機制能用程序性呼叫跟前端 vite 綁在同個進入點
