import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IEffect } from '@/types/effect'

export const useEffectStore = defineStore('effect', () => {
  const queue = ref<IEffect[]>([])
  const playing = ref<IEffect | null>(null)
  const isPlaying = ref(false)


  function enqueueEffects(effects: IEffect[]) {
    queue.value.push(...effects)
  }

  function setPlaying(effect: IEffect | null) {
    playing.value = effect
  }

  function setIsPlaying(value: boolean) {
    isPlaying.value = value
  }

  function dequeueEffect(): IEffect | null {
    return queue.value.shift() || null
  }

  function clearQueue() {
    queue.value = []
  }

  return {
    // States
    queue,
    playing,
    isPlaying,

    // Computed


    // Actions
    enqueueEffects,
    setPlaying,
    setIsPlaying,
    dequeueEffect,
    clearQueue,
  }
})
