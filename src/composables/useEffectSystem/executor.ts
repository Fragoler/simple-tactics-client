import type { IEffect } from '@/types/effect'
import { IEffectStrategy } from './effect/ieffect'
import { useMoveEffectStrategy } from './effects/move'
import { useShootEffectStrategy } from './effects/shoot'
import { useMeleeEffectStrategy } from './effects/melee'
import { useExplosionEffectStrategy } from './effects/explosion'
import { useDamageEffectStrategy } from './effects/damage'
import { useDeathEffectStrategy } from './effects/death'
import { useHealEffectStrategy } from './effects/heal'

export function useEffectExecutor() {
  const strategies: IEffectStrategy[] = [
    useMoveEffectStrategy(),
    useShootEffectStrategy(),
    useMeleeEffectStrategy(),
    useExplosionEffectStrategy(),
    useDamageEffectStrategy(),
    useDeathEffectStrategy(),
    useHealEffectStrategy(),
  ]

  async function execute(effect: IEffect): Promise<void> {
    if (!effect.validate()) {
      console.error(`Effect validation failed:`, effect)
      return
    }

    const strategy = strategies.find(s => s.canExecute(effect))

    if (!strategy) {
      console.error(`No strategy found for effect:`, effect.constructor.name)
      return
    }

    try {
      await strategy.execute(effect)
    } catch (error) {
      console.error(`Error executing effect:`, error)
    }
  }

  async function executeBatch(effects: IEffect[]): Promise<void> {
    for (const effect of effects) {
      await execute(effect)
    }
  }

  return {
    execute,
    executeBatch,
  }
}
