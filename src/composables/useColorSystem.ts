import { useActionStore } from '@/stores/actionStore'
import { useGameStore } from '@/stores/gameStore'
import type { HighlightType } from '@/types/action'
import { computed } from 'vue'


export interface ColorConfig {
  color: number
  alpha: number
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

const ActionHighlight = {
  Selection: computed(() => { return { color: getCSSColor(ColorVars.action.selection), alpha: 0.3 }}),
  Movement:  computed(() => { return { color: getCSSColor(ColorVars.action.movement),  alpha: 0.25 }}),
  Damage:    computed(() => { return { color: getCSSColor(ColorVars.action.damage),    alpha: 0.4 }}),
  Heal:      computed(() => { return { color: getCSSColor(ColorVars.action.heal),      alpha: 0.35 }}),
  Buff:      computed(() => { return { color: getCSSColor(ColorVars.action.buff),      alpha: 0.3 }}),
  Debuff:    computed(() => { return { color: getCSSColor(ColorVars.action.debuff),    alpha: 0.35 }}),
} as const



function getCSSColor(variableName: string): number {
  const cssValue = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()

  const hex = cssValue.startsWith('#') ? cssValue.slice(1) : cssValue
  return parseInt(hex, 16)
}


function getPlayerStringColor(playerId: number | null) {
  switch(playerId) {
    case 0:  return '--game-general-player1'
    case 1:  return '--game-general-player2'
    default: return '--game-general-nonplayer'
  }
}

function getPlayerColor(playerId: number | null)
{
  return getCSSColor(getPlayerStringColor(playerId))
}


function getCellColor(type: number): number {
  switch (type) {
    case 1: return getCSSColor(ColorVars.general.wall)
    default: return getCSSColor(ColorVars.general.background)
  }
}

function getUnitOutlineColor(unitId: number) {
    const actionStore = useActionStore()
    const gameStore = useGameStore()

    const unit = gameStore.getUnitById(unitId) 
    if (!unit)
      throw Error(`Unknown unitid ${unitId}`)

    if (unit.playerId !== null && gameStore.isPlayerReady(unit.playerId))
      return getPlayerColor(unit?.playerId)

    if (actionStore.getUnitScheduledAction(unitId)?.confirmed)
      return getCSSColor(ColorVars.general.selected)

    return getCSSColor(ColorVars.general.nonplayer) 
}

function getActionHighlightColor(type: HighlightType) : ColorConfig
{
  const config = ActionHighlight[type].value
  return config
}


export function useColorSystem() {
    return {
        getCSSColor,
        ColorVars,

        getCellColor,
        getPlayerStringColor,
        getPlayerColor,
        getUnitOutlineColor,
        getActionHighlightColor,

    }
}
