import type { Position } from '@/types/unit'

export type Pattern =
  | 'Manhattan'
  | 'Adjacent'
  | 'AdjacentDiagonal'
  | 'Circle'
  | 'Self'
  | 'Line'
  | 'None'

export type HighlightType =
  | 'Selection'
  | 'Movement'
  | 'Damage'
  | 'Heal'
  | 'Buff'
  | 'Debuff'

export type HighlightVisibility =
  | 'Selecting'
  | 'Confirmed'
  | 'Always'

export type RelativeType =
  | 'Executor'
  | 'Target'

export type TargetType = 
  | 'Cell' 
  | 'None'

export interface HighlightLayer {
  pattern: Pattern
  range: number
  relative: RelativeType
  type: HighlightType
  visibility: HighlightVisibility
}

export interface ActionDefinition {
  id: string
  
  name: string
  icon: string
  
  targetType: TargetType
  targetFilter: {
    pattern: Pattern
    range?: number
    requireEnemy?: boolean
    requireAlly?: boolean
    maxTargets?: number
  }

  highlightLayers: HighlightLayer[]
}

export interface ScheduledAction {
  unitId: number
  actionId: string

  confirmed: boolean 
  target?: {
    cell?: Position
    unitIds?: number[]
  }
}