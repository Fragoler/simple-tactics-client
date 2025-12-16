// src/types/effect.ts
import { IEffectRunner } from '@/composables/useEffectSystem/effects/ieffect'
import { useMoveEffectStrategy } from '@/composables/useEffectSystem/effects/move'
import type { Position } from './unit'

export interface EffectDto {
  effectType: string
  [key: string]: any
}

export interface IEffect {
  readonly id: string
  readonly unitId: number
  readonly duration: number

  readonly runner: IEffectRunner

  validate(): boolean
}

export class MoveEffect implements IEffect {
  constructor(
    public readonly id: string,
    public readonly unitId: number,
    public readonly duration: number,
    public readonly from: Position,
    public readonly to: Position
  ) {}
    
  public readonly runner: IEffectRunner = useMoveEffectStrategy()

  validate(): boolean {
    return this.unitId > 0 && this.duration > 0
  }
}

export class ShootEffect implements IEffect {
  constructor(
    public readonly id: string,
    public readonly unitId: number,
    public readonly duration: number,
    public readonly from: Position,
    public readonly to: Position,
    public readonly targetUnitId?: number
  ) {}

  validate(): boolean {
    return this.unitId > 0 && this.duration > 0
  }
}

export class MeleeEffect implements IEffect {
  constructor(
    public readonly id: string,
    public readonly unitId: number,
    public readonly duration: number,
    public readonly from: Position,
    public readonly to: Position,
    public readonly targetUnitId?: number
  ) {}

  validate(): boolean {
    return this.unitId > 0 && this.duration > 0
  }
}

export class ExplosionEffect implements IEffect {
  constructor(
    public readonly id: string,
    public readonly unitId: number,
    public readonly duration: number,
    public readonly center: Position,
    public readonly radius: number
  ) {}

  validate(): boolean {
    return this.unitId > 0 && this.duration > 0 && this.radius > 0
  }
}

export class DamageEffect implements IEffect {
  constructor(
    public readonly id: string,
    public readonly unitId: number,
    public readonly duration: number,
    public readonly targetUnitId: number,
    public readonly amount: number,
    public readonly newHealth: number
  ) {}

  validate(): boolean {
    return (
      this.unitId > 0 &&
      this.targetUnitId > 0 &&
      this.amount > 0 &&
      this.newHealth >= 0
    )
  }
}

export class DeathEffect implements IEffect {
  constructor(
    public readonly id: string,
    public readonly unitId: number,
    public readonly duration: number
  ) {}

  validate(): boolean {
    return this.unitId > 0 && this.duration > 0
  }
}

export class HealEffect implements IEffect {
  constructor(
    public readonly id: string,
    public readonly unitId: number,
    public readonly duration: number,
    public readonly targetUnitId: number,
    public readonly amount: number
  ) {}

  validate(): boolean {
    return (
      this.unitId > 0 &&
      this.targetUnitId > 0 &&
      this.amount > 0
    )
  }
}
