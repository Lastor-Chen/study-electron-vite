# Electron + vite-electron-plugin

使用 `vite-electron-plugin` 去集成 electron 前後端開發流程。該套件與 `vite-plugin-electron` 是同個作者, 兩個套件的做法不同。

`vite-electron-plugin` 不是透過 vite lib mode 去編譯 electron, 而是另外使用 swc (雖然他文件上是寫 esbuild, 但新版本改用 swc 文件沒改)。相比 `vite-plugin-electron` 也提供更多功能。

## 優點

- input 可以直接指定 dir 而非 file, 方便很多
- 不同於 `vite-plugin-electron` 只是提供一個接口 config 要自己設, 他有一個預設 config 處理好大多事情
- 純做 ts 編譯不進行 bundle, 使用作者另外寫的 [notbundle](https://github.com/caoxiemeihao/notbundle) 基於 swc
- 有更多額外 plugin 可用, 例如 `loadViteEnv`

## 缺點

- 這套是預設編譯為 CJS base 下去寫的配置, 改 ESM 是強改, 無法很完美
- 相較於 `vite-plugin-electron` 是個高階封裝, 很多設定包在裡面改不了
- 無法單獨設定 preload 編譯成不同 format
  - 要單獨編譯 preload CJS 的話, 可在 preload 全用 require 來寫
- input 只吃 `.ts .tsx .js .jsx` 遇上 `.cts .mts` 會被忽略
- 它 package.json 輸出設定沒寫好, 引用時抓不到 type, 得自己打 patch 去改
- deps 依賴沒設好 `acorn` 被寫到了 devDeps, 用 pnpm 之類非攤平的管理工具時得單獨安裝他

## ESM first 問題

- 這套件的設定是以輸出 CJS 為準, 開出來的 API 無法單獨控制 preload 的編譯方式
- input 不吃 `.cts` 目前找不到可以追加的設定, 只能命名為 `preload.ts`
- 可以透過 `transformOptions.format` 將整體編譯格式改為 ESM
- preload 得用 hack 的方式, 利用 `require` 會被忽略的特性, 強行在 format ESM 的設定下維持 CJS 語法
  - 但是在 ESM 環境下 require 將無法取得套件的 type 全會變成 any
- preload 輸出的副檔名可利用 `dest` plugin 修改為 `.cjs`
  - 不改也行, 大概因為 preload 是 electron 內部用其他方式執行的, 所以在 ESM 環境下跑 CJS 的 `.js` 時 node.js 沒有跳警告
- 改成 ESM 後 `alias` plugin 將無法使用

### alias 替代方案

強改 ESM 輸出之後 alias plugin 不再可用, 但可改用 node.js 原生的 [Subpath imports](https://nodejs.org/api/packages.html#subpath-imports) 來替代。
