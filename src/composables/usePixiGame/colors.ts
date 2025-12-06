export function getCSSColor(variableName: string): number {
  const cssValue = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()
  
  const hex = cssValue.replace('#', '')
  return parseInt(hex, 16)
}

export const GameColors = {
  get background() {
    return getCSSColor('--game-bg')
  },
  get grid() {
    return getCSSColor('--game-grid')
  },
  get player1() {
    return getCSSColor('--game-player1')
  },
  get player2() {
    return getCSSColor('--game-player2')
  },
  get highlight() {
    return getCSSColor('--game-highlight')
  },
  get selected() {
    return getCSSColor('--game-selected')
  }
}

export function getCellColor(value: number): number {
  switch (value) {
    case 1: return 0x2d4a2b
    case 2: return 0x4a2d2d
    case 3: return 0x2d3a4a
    default: return GameColors.background
  }
}
