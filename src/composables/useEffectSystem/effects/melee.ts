// src/composables/effect-strategies/useMeleeEffectStrategy.ts
import type { IEffect, MeleeEffect } from '@/types/effect'
import type { IEffectStrategy } from './IEffectStrategy'
import { usePixiGame } from '@/composables/usePixiGame'

export function useMeleeEffectStrategy(): IEffectStrategy {
  const pixi = usePixiGame()

  return {
    canExecute(effect: IEffect): boolean {
      return effect.constructor.name === 'MeleeEffect'
    },

    async execute(effect: IEffect): Promise<void> {
      const meleeEffect = effect as MeleeEffect

      if (meleeEffect.targetUnitId) {
        await pixi.drawMeleeAttack(meleeEffect.targetUnitId, meleeEffect.duration)
      }
    }
  }
}
