import type { IEffect, HealEffect } from '@/types/effect'
import type { IEffectStrategy } from './IEffectStrategy'
import { usePixiGame } from '@/composables/usePixiGame'
import { useGameStore } from '@/stores/gameStore'

export function useHealEffectStrategy(): IEffectStrategy {
  const pixi = usePixiGame()
  const gameStore = useGameStore()

  return {
    canExecute(effect: IEffect): boolean {
      return effect.constructor.name === 'HealEffect'
    },

    async execute(effect: IEffect): Promise<void> {
      const healEffect = effect as HealEffect

      const unit = gameStore.getUnitById(healEffect.targetUnitId)
      if (!unit) {
        console.warn(`Unit ${healEffect.targetUnitId} not found`)
        return
      }

      await pixi.drawHealEffect(
        healEffect.targetUnitId,
        healEffect.amount,
        300
      )

      unit.curHealth = Math.min(unit.curHealth + healEffect.amount, unit.maxHealth)
    }
  }
}
