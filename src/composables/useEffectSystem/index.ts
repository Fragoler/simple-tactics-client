// src/composables/useEffectSystem/index.ts
import { parseEffect, parseEffects } from './parsing'
import { useEffectStore } from '@/stores/effectStore'
import { initPlayer } from './player'
import type { EffectDto } from '@/types/effect'

export function useEffectSystem() {
  const effectStore = useEffectStore()

  function init() {
    initPlayer()
  }

  function addEffects(dtos: EffectDto[]) {
    const effects = parseEffects(dtos)
    effectStore.enqueueEffects(effects)
  }

  function addEffect(dto: EffectDto) {
    const effect = parseEffect(dto)
    if (effect) {
      effectStore.enqueueEffects([effect])
    }
  }

  function clearEffects() {
    effectStore.clearQueue()
  }

  return {
    init,
    addEffects,
    addEffect,
    clearEffects,
  }
}
