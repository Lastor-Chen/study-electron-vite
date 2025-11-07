# Electron + my vite-plugin-tsdown

## Memo

- vite 的勾子會監聽整個專案的 change
- tsdown 程序性使用要注意分開 compile preload, 不然 cjs 會導致他去 bundle `import {} from 'electron'`, 導致 electron 無法正常處理
- electron 執行的進入點 path 給 `.` 就會去找 packageJson.main 的設定
- 程序性使用 vs config 的行為不明，似乎最好是禁用 config 避免干擾
- 多 build thread 時 onSuccess, watch 等機制是各自獨立的
  - 如果各自 watch, 因為 main thread 要忽略 preload, 設定繁瑣
  - 統一 watch 則會有 onSuccess 被觸發兩次的問題, 但可只掛一個來解決
- 拉起 electron 時，不下 `--no-sandbox` 會無法 restart
- tsdown onSuccess 可以直接跑 `$ electron .` 但有缺點
  - 無法監控其 exit 後關閉 vite
  - 若是 vite config change 會殘留殭屍進程
- vite config change 時，是 reload 不是 restart，子程序變數會遺失，但可改存在 global process

## TODO

- 確認 path alias
- import.meta.env 替代方案
