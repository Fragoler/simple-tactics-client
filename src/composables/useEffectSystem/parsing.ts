import { EffectDto, IEffect } from '@/types/effect'
import type { Position } from '@/types/unit'

// Interfaces
type EffectConstructor<T extends IEffect> = {
  readonly TYPE: string
  fromDto(dto: EffectDto): T | null
}

// Implementations
export class MoveEffect implements IEffect {
  static readonly TYPE = 'Move'

  constructor(
    public readonly duration: number,
    public readonly unitId: number,
    public readonly from: Position,
    public readonly to: Position
  ) {}

  static fromDto(dto: EffectDto): MoveEffect | null {
    if (!dto.from || !dto.to || !dto.unitId) return null
    return new MoveEffect(dto.duration, dto.unitId, dto.from, dto.to)
  }

  async doEffect(): Promise<void> {
    const { usePixiGame } = await import('@/composables/usePixiGame')
    const { useGameStore } = await import('@/stores/gameStore')
    
    const pixi = usePixiGame()
    const gameStore = useGameStore()

    const unit = gameStore.getUnitById(this.unitId)
    if (!unit) {
      console.warn(`Unit ${this.unitId} not found`)
      return
    }

    await pixi.animateUnitMove(this.unitId, this.to, this.duration)
    unit.coords = this.to
  }
}

export class ShootEffect implements IEffect {
  static readonly TYPE = 'Shoot'

  constructor(
    public readonly duration: number,
    public readonly unitId: number,
    public readonly from: Position,
    public readonly to: Position,
    public readonly targetUnitId?: number
  ) {}

  static fromDto(dto: EffectDto): ShootEffect | null {
    if (!dto.from || !dto.to || !dto.unitId) return null
    return new ShootEffect(dto.duration, dto.unitId, dto.from, dto.to, dto.targetUnitId)
  }

  async doEffect(): Promise<void> {
    const { usePixiGame } = await import('@/composables/usePixiGame')
    const pixi = usePixiGame()

    await pixi.drawProjectile(this.from, this.to, this.duration)
  }
}

export class MeleeEffect implements IEffect {
  static readonly TYPE = 'Melee'

  constructor(
    public readonly duration: number,
    public readonly unitId: number,
    public readonly from: Position,
    public readonly to: Position,
    public readonly targetUnitId?: number
  ) {}

  static fromDto(dto: EffectDto): MeleeEffect | null {
    if (!dto.from || !dto.to || !dto.unitId) return null
    return new MeleeEffect(dto.duration, dto.unitId, dto.from, dto.to, dto.targetUnitId)
  }

  async doEffect(): Promise<void> {
    const { usePixiGame } = await import('@/composables/usePixiGame')
    const pixi = usePixiGame()

    if (this.targetUnitId) {
      await pixi.drawMeleeAttack(this.targetUnitId, this.duration)
    }
  }
}

export class ExplosionEffect implements IEffect {
  static readonly TYPE = 'Explosion'

  constructor(
    public readonly duration: number,
    public readonly unitId: number,
    public readonly center: Position,
    public readonly radius: number
  ) {}

  static fromDto(dto: EffectDto): ExplosionEffect | null {
    if (!dto.center || !dto.radius || !dto.unitId) return null
    return new ExplosionEffect(dto.duration, dto.unitId, dto.center, dto.radius)
  }

  async doEffect(): Promise<void> {
    const { usePixiGame } = await import('@/composables/usePixiGame')
    const pixi = usePixiGame()

    await pixi.drawExplosion(this.center, this.radius, this.duration)
  }
}

export class DamageEffect implements IEffect {
  static readonly TYPE = 'Damage'

  constructor(
    public readonly duration: number,
    public readonly unitId: number,
    public readonly amount: number,
  ) {}

  static fromDto(dto: EffectDto): DamageEffect | null {
    if (!dto.unitId || !dto.unitId || !dto.amount) return null
    return new DamageEffect(dto.duration, dto.unitId, dto.amount)
  }

  async doEffect(): Promise<void> {
    const { usePixiGame } = await import('@/composables/usePixiGame')
    const { useGameStore } = await import('@/stores/gameStore')
    
    const pixi = usePixiGame()
    const gameStore = useGameStore()

    const unit = gameStore.getUnitById(this.unitId)
    if (!unit) {
      console.warn(`Unit ${this.unitId} not found`)
      return
    }

    await pixi.drawDamageHit(this.unitId, this.duration)
    unit.curHealth -= this.amount
  }
}

export class DeathEffect implements IEffect {
  static readonly TYPE = 'Death'

  constructor(
    public readonly duration: number,
    public readonly unitId: number
  ) {}

  static fromDto(dto: EffectDto): DeathEffect | null {
    if (!dto.unitId) return null
    return new DeathEffect(dto.duration, dto.unitId)
  }

  async doEffect(): Promise<void> {
    const { usePixiGame } = await import('@/composables/usePixiGame')
    const { useGameStore } = await import('@/stores/gameStore')
    
    const pixi = usePixiGame()
    const gameStore = useGameStore()

    await pixi.animateUnitDeath(this.unitId, this.duration)
    gameStore.removeUnit(this.unitId)
  }
}

export class HealEffect implements IEffect {
  static readonly TYPE = 'Heal'

  constructor(
    public readonly duration: number,
    public readonly unitId: number,
    public readonly targetUnitId: number,
    public readonly amount: number
  ) {}

  static fromDto(dto: EffectDto): HealEffect | null {
    if (!dto.unitId || !dto.targetUnitId || !dto.amount) return null
    return new HealEffect(dto.duration, dto.unitId, dto.targetUnitId, dto.amount)
  }

  async doEffect(): Promise<void> {
    const { usePixiGame } = await import('@/composables/usePixiGame')
    const { useGameStore } = await import('@/stores/gameStore')
    
    const pixi = usePixiGame()
    const gameStore = useGameStore()

    const unit = gameStore.getUnitById(this.targetUnitId)
    if (!unit) {
      console.warn(`Unit ${this.targetUnitId} not found`)
      return
    }

    await pixi.drawHealEffect(this.targetUnitId, this.duration)
    unit.curHealth = Math.min(unit.curHealth + this.amount, unit.maxHealth)
  }
}

// Parser
const effectClasses = [
  MoveEffect, ShootEffect, MeleeEffect, ExplosionEffect,
  DamageEffect, DeathEffect, HealEffect
] as const

const effectRegistry = new Map<string, EffectConstructor<any>>(
  effectClasses.map(cls => [cls.TYPE, cls])
)

export function parseEffect(dto: EffectDto): IEffect | null {
  const effectClass = effectRegistry.get(dto.type)
  if (!effectClass) {
    console.error(`Unknown effect type: ${dto.type}`)
    return null
  }
  return effectClass.fromDto(dto)
}

export function parseEffects(dtos: EffectDto[]): IEffect[] {
  return dtos.map(parseEffect).filter((e): e is IEffect => e !== null)
}
