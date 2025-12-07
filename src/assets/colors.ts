export function getCSSColor(variableName: string): number {
  const cssValue = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()

  const hex = cssValue.startsWith('#') ? cssValue.slice(1) : cssValue
  return parseInt(hex, 16)
}

export const ColorVars = {
  general: {
    background: '--game-general-bg',
    grid:       '--game-general-grid',
    player1:    '--game-general-player1',
    player2:    '--game-general-player2',
    nonplayer:  '--game-general-nonplayer',
    highlight:  '--game-general-highlight',
    selected:   '--game-general-selected',
    wall:       '--game-general-wall',
  },
  action: {
    selection: '--game-action-selection',
    movement:  '--game-action-movement',
    damage:    '--game-action-damage',
    heal:      '--game-action-heal',
    buff:      '--game-action-buff',
    debuff:    '--game-action-debuff',
  },
} as const


export function getPlayerColor(playerId: number | null)
{
  switch(playerId)
  {
    case 0:  return getCSSColor(ColorVars.general.player1)
    case 1:  return getCSSColor(ColorVars.general.player2)
    default: return getCSSColor(ColorVars.general.nonplayer)
  }
}

export function getCellColor(value: number): number {
  switch (value) {
    case 1: return getCSSColor(ColorVars.general.wall)
    default: return getCSSColor(ColorVars.general.background)
  }
}
