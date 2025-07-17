export type ElectronAPI = {
  ping(): Promise<string>
  callChild(msg: string): Promise<string>
}
