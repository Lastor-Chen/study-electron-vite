# Electron + my vite-plugin-tsdown

## Memo

- `$ electron .` 他會去找 packageJson.main
- 程序化使用與 tsdown.config 混用的行為不明，最好 `config: false` 禁用
- tsdown onSuccess 可以直接跑 `$ electron .` 但有缺點
  - owner 會是 tsdown, 無法監聽他 exit 後一併關閉 vite
  - (已解決) 若是 vite restart 會 re-run tsdown, 但無法關閉前一個 electron 殘留殭屍進程
- vite restart (改 config) 是 reload config 不是 restart node, 閉包變數會被清掉, 但 global.process 會是同一個
- 不能判斷 `child.killed` 才去 kill electron，否則 vite r key restart 的生命週期不一樣，會導致誤判產生殭屍進程
- process 相關監聽要用 `once` 去掛，避免 vite restart 時報出監聽重複掛太多的問題
- 新版 rolldown 改了 ESM import 編譯成 cjs 的方式, 不會再注入一段 __toESM 的 code

## import.meta.env

- tsdown 沒有讀取 .env file 的機制
- tsdown 有個 `env` 參數，效果類似包裝過的 `define`
- 原理是在 compile time 做字串替換, 所以 `import.meta.env` 會是空的
- `process.env.VAR_NAME` 也會被指定的 `env` 替換
- vite plugin 可以透過 `configResolved` 取得 env 再去注入給 tsdown

## handle electron restart

- 按 r + enter 重啟的行為跟 change vite.config 不一樣, tsdown build 會莫名的立即被執行一次, 之後 reload config 又會被執行一次
- 通用方法是 child 記在 global 後, 無條件置頂先 kill 一次
- 另一個作法是透過 tsdown onSuccess 給的 abort signal 去 spawn, tsdown rebuild 時就能自動關閉, 但需處理 AbortError
- 為了避免 vite restart 時, tsdown 殘留殭屍程序, 現在讓 vite restart 與 tsdown 隔離

## Watcher

- vite 跟 tsdown 的 watch 預設都會監聽整個專案
  - tsdown `v0.17.0` 改用 rolldown watcher, 只會監聽 entry 範圍
  - 指定 watch 範圍外, 會觸發, 但 clean 之後會 build 不出東西
  - 無法再透過 count 實現 onAllSuccess
- multi builds 時 onSuccess, watch 各自獨立, 可有兩種 onSuccess 方案
  - 各自只 watch 自己, onSuccess 都掛上去
  - ~~統一 watch 所有目錄, onSuccess 只掛一個~~
