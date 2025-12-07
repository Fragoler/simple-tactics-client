import type { Position } from '@/types/unit'

export type HighlightPattern =
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

export type ActionState =
  | 'None'
  | 'Selecting'
  | 'Confirmed'

export type RelativeType =
  | 'Executor'
  | 'Target'

export type TargetType = 
  | 'Cell' 
  | 'Unit' 
  | 'None'

export interface HighlightLayer {
  pattern: HighlightPattern
  range: number
  relativeTo: RelativeType
  type: HighlightType
  visibility: HighlightVisibility
}

export interface ActionDefinition {
  id: string
  
  name: string
  icon: string
  
  targetType: TargetType
  targetFilter: {
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
  state: ActionState
  target?: {
    cell?: Position
    unitIds?: number[]
  }
}