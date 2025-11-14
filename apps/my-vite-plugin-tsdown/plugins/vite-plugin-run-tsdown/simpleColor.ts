const color = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: "\x1b[36m",
}

export const green = (text: string) => `${color.green}${text}${color.reset}`
export const cyan = (text: string) => `${color.cyan}${text}${color.reset}`
