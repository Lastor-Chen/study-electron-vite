export type ElectronAPI = {
  ping(): string
  callChild(msg: string): string
}
