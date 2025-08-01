# Electron + my vite-plugin-tsdown

- vite 預設就會監聽 root 底下所有內容
- tsdown 程序性使用要注意分開 compile preload, 不然 cjs 會導致他去 bundle `import {} from 'electron'`, 導致 electron 無法正常處理
