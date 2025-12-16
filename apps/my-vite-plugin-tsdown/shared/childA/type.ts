export type ChildACalls = {
  ping(): string
}

export type ChildAEvents = {
  updatePing(val: string): void
}
