import type { IEffect, MoveEffect } from '@/types/effect'
import type { IEffectStrategy } from './IEffectStrategy'
import { usePixiGame } from '@/composables/usePixiGame'
import { useGameStore } from '@/stores/gameStore'

export function useMoveEffectStrategy(): IEffectStrategy {
  const pixi = usePixiGame()
  const gameStore = useGameStore()

  return {
    canExecute(effect: IEffect): boolean {
      return effect.constructor.name === 'MoveEffect'
    },

    async execute(effect: IEffect): Promise<void> {
      const moveEffect = effect as MoveEffect

      const unit = gameStore.getUnitById(moveEffect.unitId)
      if (!unit) {
        console.warn(`Unit ${moveEffect.unitId} not found`)
        return
      }

      await pixi.animateUnitMove(
        moveEffect.unitId,
        moveEffect.to,
        moveEffect.duration
      )

      unit.coords = moveEffect.to
    }
  }
}
