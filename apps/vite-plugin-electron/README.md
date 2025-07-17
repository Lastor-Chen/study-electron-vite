# Electron + vite-plugin-electron

使用 `vite-plugin-electron` 去集成 electron 前後端開發流程。

基本原理是利用 vite lib mode 去編譯 electron ts, 依靠 vite plugin 提供的鉤子去偵測 file onChange 時重新編譯, 並將 electron kill 後重新拉起。

詳見:
https://zhuanlan.zhihu.com/p/497638546

## 優點

- 可自由控制 main 與 preload 的 vite lib mode 編譯設定
- 單純的接口整合, 沒有魔法行為
- 整合到 vite 一起處理, 所以 tsconfig.electron 可以用 refs 整合一起透過 vue-tsc 做 tscheck
  - tscheck 要記得設定 `noEmit`

## 缺點

- vite lib mode 預設是做 bundle, 得另外處理
  - https://github.com/electron-vite/vite-plugin-electron/issues/249
- 要自己熟悉 vite lib mode 的打包機制, 自己客製設定
- 這套件最初預設 config 是 CJS base 的, 用 type: module 會有一些地方轉換不良, 要手動去控

## Other

- 他內部會看 package.json 的 type 設定去判斷 format
- 要設成 type module, 或指定 .mts 副檔名去輸出 esm, `import.meta.dirname` 這類 ESM 變數才抓得到
- 因為 preload 是另一個 build 進入點, 所以套件預設將 `config.build.emptyOutDir` 設為 false, 避免熱重啟時互相 clear build 結果
- 內附的 `notBundle` plugin 他 doc 寫說只會排除 cjs npm-pkg
  - 可利用 vite `build.ssr` 去做到 no bundle, no minify, node 端不壓縮也利於定位 error 位置

## preload CommonJS 編譯問題

如果希望遵守 node.js type module 的機制, 那理論上 preload 副檔名應該使用 `.{cts,cjs}` 去標明。

但 vite 在編譯 ts 時, 會先給 esbuild 編譯之後才丟給 rollup bundle, 而 vite 預設只處理 `.ts`。需要另外設定 `esbuild.include` 告訴它要處理 `.cts` 才行。否則直接進 rollup 遇上 `import type` 之類的 ts 語法會報錯。

參考:<br>
https://vite.dev/guide/features.html#transpile-only
