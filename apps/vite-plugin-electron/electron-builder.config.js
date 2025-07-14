/**
 * @type {import('electron-builder').Configuration}
 */
export default {
  productName: 'Electron VPE',
  appId: 'electron.vpe.app',
  asar: true,
  // 一些檔案包進 asar 可能會有問題, 可指定將其不要 pack
  asarUnpack: [],
  directories: {
    buildResources: 'resources',
    output: 'release/${version}',
  },
  files: ['dist-electron', 'dist'],
  compression: 'store',
  mac: {
    artifactName: '${productName}.${ext}',
    mergeASARs: true,
    target: [
      {
        target: 'pkg',
        arch: 'universal',
      },
    ],
  },
  pkg: {
    installLocation: '/Applications',
    allowAnywhere: true,
    overwriteAction: 'upgrade',
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
    artifactName: '${productName}.${ext}',
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
    runAfterFinish: false,
  },
}
