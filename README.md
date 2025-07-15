# Study electron vite

This repo is a study on setting up project with Electron + Vite

## pnpm

- electron 等套件有 postinstall, pnpm 會阻擋並提示執行 `pnpm approve-builds` 來允許, 但有時用 `pnpm add <package>` 會無提示, 要重下一次 `pnpm install` 才會出現
- `pnpm why <package> -r` 要加上 `-r` 才能遞迴搜尋子專案的依賴樹

### 打 patch

只能在實際安裝位置, 也就是 workspace 根目錄進行

```
# 建立臨時目錄, 在該目錄下去修改內容
$ pnpm patch <package>

# 修改完成後 commit 他
$ pnpm patch-commit <temp_dir_path>
```

## Electron
- `app.whenReady()` 在 ESM 下仍舊不支援 top-level await
- 新版 electron 用 ctrl-c kill 時會送出 exit(1), 而 pnpm 接收到非安全離開信號也會報錯, 這是正常現象
- electron cli 沒提供 watch mode, 無法用一般手段做到熱更新
- html 需要加入 meta CSP 設置, 不然 devtools 會跳 electron 警告
  - https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy
- electron cli 無法直接吃 node 參數, 如 `--watch`, `--env-file`

## Node22
- 沒定義 package.json type 的話, node 會預設用 CJS 同時自動偵測 ESM 關鍵字, 偵測到就會用 ESM 執行並彈出警告

## electron-builder

- 需要設定 package.json 的 main, 他會以此作為 entry file
- node_modules 打包議題
  - 如同後端部署會把 node_modules 也帶進去, 所以不需要像前端那樣 bundle packages
  - 會依據 package.json 裡面的 deps 去 copy, 如果放在 devDeps 或是 root 共用就不會被包到
  - runtime 會用到的 deps 得在子專案的 package.json 都聲明才會被包到, 無法只放在 root 共用
  - 控好 devDeps 可以避免多餘的套件被包進去
  - 前端用的套件會被 vite bundle, 不需要聲明到 package.json
  - electron 套件本身是 devDeps, 最終 build 會內建在裡面, 不需要包含在 node_modules

## TODO

- electron 端, 多資料夾 common, child 編譯
  - [x] vite-electron-plugin
  - [] vite-plugin-electron
  - [] basic
- [] run node native in ESM
