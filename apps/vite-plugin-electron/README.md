# Electron + vite-plugin-electron

基本原理
https://zhuanlan.zhihu.com/p/497638546

## vite-plugin-electron

- 它是用 lib mode 來 build, 預設會被 bundle
  - https://github.com/electron-vite/vite-plugin-electron/issues/249
- 要設成 type module, 或指定 .mts 副檔名去輸出 esm, `import.meta.dirname` 這類 ESM 變數才抓得到
- 這套件最初預設 config 是 CJS base 的, 用 type: module 會有一些地方轉換不良, 要手動去控
- 因為 preload 是另一個 build 進入點, 所以套件預設 `config.build.emptyOutDir` 是 false, 避免熱重啟時互相 clear build 結果
- 他會去看 package.json 是否設定 `type: module` 決定預設 format
- 內附的 `notBundle` plugin 只會排除 cjs npm-pkg
  - 可利用 `build.ssr` 去做到 no bundle, no minify, node 端不壓縮也利於定位 error 位置
- 由於 electron 納入 vite 建構 `tsconfig.electron.json` 可一起加入 refs, 但要補上 `noEmit` 避免 vue-tsc 在 tscheck 時編譯

## vite-electron-plugin

- 吃不到此 lib 的 type 定義, 無語法提示
- 它是另外用 esbuild 去編譯, 而非 vite 的 rollup
- 要設定 esm 應該從 transformOptions.format 去設
- 內部有用到該作者自己寫的 `notBundle` plugin, 所以預設不會被 bundle
