<template>
  <h1>Electron Vite Vue Basic</h1>
  <div>
    <button @click="count++">Count {{ count }}</button>
    <button class="ml-2" @click="onPing">ping</button>
    <button class="ml-2" @click="callChild">Call Child</button>
  </div>
   <div class="mt-2">
    <span>{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const message = ref('')

const onPing = async () => {
  message.value = await window.electronAPI.ping()
}

const callChild = async () => {
  message.value = await window.electronAPI.callChild('test msg')
}
</script>

<style scoped>
.ml-2 {
  margin-left: 8px;
}

.mt-2 {
  margin-top: 8px;
}
</style>
