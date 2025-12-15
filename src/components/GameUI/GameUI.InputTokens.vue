<script setup lang="ts">
import { ref } from 'vue'
import { useSignalR } from '@/composables/useSignalR.ts'
import { useConnectionStore } from '@/stores/connectionStore'


const gameToken = ref('')
const playerToken = ref('')

const isInputVisible = ref(false)
const isConnecting = ref(false)

async function handleClick() {
  if (isInputVisible.value) {
    if (isConnecting.value) return
    
    isConnecting.value = true
    
    try {
      const conStore = useConnectionStore()
      const { connect } = useSignalR()

      conStore.updateTokens(gameToken.value, playerToken.value)
      await connect()

      if (conStore.isConnected) {
        isInputVisible.value = false
      }
    } catch (error) {
      
			console.error('Connection failed:', error)

    } finally {
      isConnecting.value = false
    }
  } else {
    isInputVisible.value = true
  }
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="isInputVisible" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">
          Game Token
        </label>
        <input
          v-model="gameToken"
          type="text"
          placeholder="Введите game token"
          :disabled="isConnecting"
          class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">
          Player Token
        </label>
        <input
          v-model="playerToken"
          type="text"
          placeholder="Введите player token"
          :disabled="isConnecting"
          class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
      </div>
    </div>

    <button
      @click="handleClick"
      :disabled="isInputVisible && (!gameToken || !playerToken || isConnecting)"
      class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
    >
      <span v-if="isConnecting">Подключение...</span>
      <span v-else>{{ isInputVisible ? 'Подключиться' : 'Ввести токены' }}</span>
    </button>
  </div>
</template>
