# Electron + my vite-plugin-tsdown

## Memo

- vite 的勾子會監聽整個專案的 change
- tsdown 程序性使用要注意分開 compile preload, 不然 cjs 會導致他去 bundle `import {} from 'electron'`, 導致 electron 無法正常處理
- electron 執行的進入點 path 給 `.` 就會去找 packageJson.main 的設定
- 程序性使用 vs config 的行為不明，似乎最好是禁用 config 避免干擾

## TODO

- import.meta.env 替代方案
- 能否以 tsdown.config 為主?
