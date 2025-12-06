export type UnitSprite = 'triangle' | 'square' | 'circle'
export type ActionType = 'move' | 'wait'


export interface Unit {
  unitId: number
  playerId: number | null 
  coords : Position

  sprite : UnitSprite

  curHealth: number
  maxHealth: number
}

export interface Position {
  x: number
  y: number
}

export interface UnitAction {
  unitId: number
  actionType: ActionType
  targetX?: number
  targetY?: number
  targetUnitId?: number
}