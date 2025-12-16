import type { IEffect, DamageEffect } from '@/types/effect'
import type { IEffectRunner } from './ieffect'
import { usePixiGame } from '@/composables/usePixiGame'
import { useGameStore } from '@/stores/gameStore'

export function useDamageEffect(): IEffectRunner {
  const pixi = usePixiGame()
  const gameStore = useGameStore()

  return {
    canExecute(effect: IEffect): boolean {
      return effect.constructor.name === 'DamageEffect'
    },

    async execute(effect: IEffect): Promise<void> {
      const damageEffect = effect as DamageEffect

      const unit = gameStore.getUnitById(damageEffect.targetUnitId)
      if (!unit) {
        console.warn(`Unit ${damageEffect.targetUnitId} not found`)
        return
      }

      await pixi.drawDamageHit(
        damageEffect.targetUnitId,
        damageEffect.amount,
        300
      )

      unit.curHealth = damageEffect.newHealth
    }
  }
}
