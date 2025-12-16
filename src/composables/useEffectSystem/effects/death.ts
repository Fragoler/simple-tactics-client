import type { IEffect, DeathEffect } from '@/types/effect'
import type { IEffectStrategy } from './IEffectStrategy'
import { usePixiGame } from '@/composables/usePixiGame'
import { useGameStore } from '@/stores/gameStore'

export function useDeathEffectStrategy(): IEffectRunner {
  const pixi = usePixiGame()
  const gameStore = useGameStore()

  return {
    canExecute(effect: IEffect): boolean {
      return effect.constructor.name === 'DeathEffect'
    },

    async execute(effect: IEffect): Promise<void> {
      const deathEffect = effect as DeathEffect

      await pixi.animateUnitDeath(deathEffect.unitId, deathEffect.duration)

      gameStore.removeUnit(deathEffect.unitId)
    }
  }
}
