# Electron + my vite-plugin-tsdown

## Memo

- vite 跟 tsdown 的 watch 預設都會監聽整個專案
- `$ electron .` 他會去找 packageJson.main
- 程序化使用與 tsdown.config 混用的行為不明，最好 `config: false` 禁用
- multi builds 時 onSuccess, watch 是各自獨立的, 所以會有兩種 onSuccess 方案
  - 各自只 watch 自己, onSuccess 都掛上去
  - 統一 watch 所有目錄, onSuccess 只掛一個
- tsdown onSuccess 可以直接跑 `$ electron .` 但有缺點
  - owner 會是 tsdown, 無法監聽他 exit 後一併關閉 vite
  - (已解決) 若是 vite restart 會重 run tsdown, 但無法關閉前一個 electron 殘留殭屍進程
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
