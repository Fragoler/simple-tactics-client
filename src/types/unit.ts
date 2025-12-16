export type UnitSprite = 'Triangle' | 'Square' | 'Circle'

export interface Unit {
  unitId: number
  playerId: number | undefined
  coords : Position

  sprite : UnitSprite

  curHealth: number
  maxHealth: number

  actionIds: string[]   
}

export interface Position {
  x: number
  y: number
}