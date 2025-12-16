// src/composables/useEffectFactory.ts
import type { IEffect } from '@/types/effect'
import {
  MoveEffect,
  ShootEffect,
  MeleeEffect,
  ExplosionEffect,
  DamageEffect,
  DeathEffect,
  HealEffect,
} from '@/types/effect'

/**
 * Factory Pattern - создание эффектов из DTO
 */
export function useEffectFactory() {
  function create(dto: EffectDTO): IEffect {
    switch (dto.effectType) {
      case 'Move':
        return new MoveEffect({
          id: dto.id,
          unitId: dto.unitId,
          duration: dto.duration,
          from: dto.from,
          to: dto.to,
        })

      case 'Shoot':
        return new ShootEffect({
          id: dto.id,
          unitId: dto.unitId,
          duration: dto.duration,
          from: dto.from,
          to: dto.to,
          targetUnitId: dto.targetUnitId,
        })

      case 'Melee':
        return new MeleeEffect({
          id: dto.id,
          unitId: dto.unitId,
          duration: dto.duration,
          from: dto.from,
          to: dto.to,
          targetUnitId: dto.targetUnitId,
        })

      case 'Explosion':
        return new ExplosionEffect({
          id: dto.id,
          unitId: dto.unitId,
          duration: dto.duration,
          center: dto.center,
          radius: dto.radius,
        })

      case 'Damage':
        return new DamageEffect({
          id: dto.id,
          unitId: dto.unitId,
          duration: dto.duration,
          targetUnitId: dto.targetUnitId,
          amount: dto.amount,
          newHealth: dto.newHealth,
        })

      case 'Death':
        return new DeathEffect({
          id: dto.id,
          unitId: dto.unitId,
          duration: dto.duration,
        })

      case 'Heal':
        return new HealEffect({
          id: dto.id,
          unitId: dto.unitId,
          duration: dto.duration,
          targetUnitId: dto.targetUnitId,
          amount: dto.amount,
        })

      default:
        throw new Error(`Unknown effect type: ${dto.type}`)
    }
  }

  function createBatch(dtos: EffectDTO[]): IEffect[] {
    return dtos
      .map(dto => {
        try {
          return create(dto)
        } catch (error) {
          console.error(`Failed to create effect:`, error)
          return null
        }
      })
      .filter((effect): effect is IEffect => effect !== null)
  }

  return {
    create,
    createBatch,
  }
}
