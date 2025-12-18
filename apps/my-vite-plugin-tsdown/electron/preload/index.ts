// will compile to CJS
import { contextBridge, ipcRenderer } from 'electron'

import { bridgeIpcChild } from '@packages/child-utility/preload'

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
} satisfies ElectronAPI)

bridgeIpcChild()
