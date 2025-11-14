// CJS only
import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '@shared/types.js'

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
})

contextBridge.exposeInMainWorld('electronAPI', {
  ping() {
    return ipcRenderer.invoke('ping')
  },
  callChild(msg) {
    return ipcRenderer.invoke('call-child', msg)
  },
} satisfies ElectronAPI)
