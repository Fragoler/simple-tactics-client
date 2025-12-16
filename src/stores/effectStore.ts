import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IEffect } from '@/types/effect'

export const useEffectStore = defineStore('effect', () => {
  const queue = ref<IEffect[]>([])
  const isPlaying = ref(false)

  const hasEffects = computed(() => queue.value.length > 0)

  function enqueueEffects(effects: IEffect[]) {
    console.debug("effects enqueued")
    queue.value.push(...effects)
  }

  function dequeueEffect(): IEffect | null {
    return queue.value.shift() || null
  }

  function clearQueue() {
    queue.value = []
    isPlaying.value = false
  }

  function setPlaying(value: boolean) {
    isPlaying.value = value
  }

  return {
    // States
    queue,
    isPlaying,
    
    // Computed
    hasEffects,

    // Actions
    enqueueEffects,
    dequeueEffect,
    clearQueue,
    setPlaying,
  }
})
