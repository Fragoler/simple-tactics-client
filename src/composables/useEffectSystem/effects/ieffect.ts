import type { IEffect } from '@/types/effect'

export interface IEffectRunner {
  canExecute(effect: IEffect): boolean
  execute(effect: IEffect): Promise<void>
}
