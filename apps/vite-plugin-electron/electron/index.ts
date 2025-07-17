import path from 'node:path'

import { app, BrowserWindow, ipcMain, utilityProcess } from 'electron'
import dayjs from 'dayjs'

import { ping } from '@shared/utils/index.js'

let win: BrowserWindow | undefined

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(import.meta.dirname, './preload.cjs'),
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL('http://localhost:5173/')
  } else {
    win.loadFile(path.join(import.meta.dirname, '../../dist/index.html'))
  }
}

// TODO try MessageChannelMain?
function forkChild() {
  const child = utilityProcess.fork(path.join(import.meta.dirname, './child/index.js'), [], {
    stdio: 'inherit',
  })

  ipcMain.handle('call-child', async (_, msg: string) => {
    const result = await new Promise((resolve) => {
      child.once('message', (returnVal) => {
        resolve(returnVal)
      })

      child.postMessage(msg)
    })

    return result
  })
}

app.whenReady().then(() => {
  createWindow()
  forkChild()
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
  const date = dayjs().format('YYYY/MM/DD HH:mm:ss')
  const result = ping()

  return `${result} ${date}`
})
