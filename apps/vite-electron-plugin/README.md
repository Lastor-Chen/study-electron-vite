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

## ESM 配置

作者只有把 swc 的 transform 部分設定給開出來, 能調整的不多。嘗試過使用 plugin.configResolved 去改 config, 讓他 extensions 追加 `.cts` 之類的會報錯。

目前實驗是可以改 `transformOptions.format` 去編譯成 ESM, 但他內部配置是默認會用 CJS 而產生一些衝突, 例如 `alias` plugin 將會無法使用。

雖然無法單獨控制 preload 編譯成 CJS, 但實驗結果發現直接用 require 去寫不要用 import 的話, swc 的輸出結果會保留 require, 可利用此特性維持 CJS 語法, 但沒辦法單獨控制副檔名輸出為 `.cjs`。

正常情況 type module 模式下去執行 `.js` 時, node 偵測到裡面是 CJS 會跳警告。但 preload 可能是 electron 在內部用其他方式去執行的, 所以即使輸出成 `preload.js` 也不會跳 node 警告。

### alias 替代方案

強改 ESM 輸出之後 alias plugin 不再可用, 但可改用 node.js 原生的 [Subpath imports](https://nodejs.org/api/packages.html#subpath-imports) 來替代。
