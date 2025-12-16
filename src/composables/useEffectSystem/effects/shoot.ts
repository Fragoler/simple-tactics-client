// src/composables/effect-strategies/useShootEffectStrategy.ts
import type { IEffect, ShootEffect } from '@/types/effect'
import type { IEffectStrategy } from './IEffectStrategy'
import { usePixiGame } from '@/composables/usePixiGame'

export function useShootEffectStrategy(): IEffectStrategy {
  const pixi = usePixiGame()

  return {
    canExecute(effect: IEffect): boolean {
      return effect.constructor.name === 'ShootEffect'
    },

    async execute(effect: IEffect): Promise<void> {
      const shootEffect = effect as ShootEffect

      await pixi.drawProjectile(
        shootEffect.from,
        shootEffect.to,
        shootEffect.duration,
        'shoot'
      )
    }
  }
}
