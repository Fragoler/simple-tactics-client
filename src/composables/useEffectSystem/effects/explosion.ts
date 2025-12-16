// src/composables/effect-strategies/useExplosionEffectStrategy.ts
import type { IEffect, ExplosionEffect } from '@/types/effect'
import type { IEffectStrategy } from './IEffectStrategy'
import { usePixiGame } from '@/composables/usePixiGame'

export function useExplosionEffectStrategy(): IEffectStrategy {
  const pixi = usePixiGame()

  return {
    canExecute(effect: IEffect): boolean {
      return effect.constructor.name === 'ExplosionEffect'
    },

    async execute(effect: IEffect): Promise<void> {
      const explosionEffect = effect as ExplosionEffect

      await pixi.drawExplosion(
        explosionEffect.center,
        explosionEffect.radius,
        explosionEffect.duration
      )
    }
  }
}
