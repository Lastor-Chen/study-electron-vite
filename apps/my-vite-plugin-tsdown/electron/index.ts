import path from 'node:path'

import { app, BrowserWindow, ipcMain } from 'electron'
import dayjs from 'dayjs'

const isDev = process.env.NODE_ENV === 'development'
if (isDev) {
  console.log('Run electron app with frontend vite dev server')
}

let win: BrowserWindow | undefined

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(import.meta.dirname, './preload.cjs'),
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173/')
  } else {
    win.loadFile(path.join(import.meta.dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) return allWindows[0].focus()

  createWindow()
})

ipcMain.handle('ping', () => {
  const date = dayjs().format('YYYY/MM/DD')

  return `pong ${date}`
})
