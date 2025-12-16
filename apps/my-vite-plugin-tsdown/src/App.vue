<template>
  <h1>Electron vite-plugin-tsdown</h1>
  <div>
    <button @click="count++">Count {{ count }}</button>
  </div>
  <div class="mt-2">
    <button @click="onPing">Call Main</button>
    <p>{{ mainRes || '&nbsp;' }}</p>
  </div>
  <div class="mt-2">
    <button @click="callChildA">Call ChildA</button>
    <p>Res: {{ childARes }}</p>
    <p>Ref: {{ childARefVal }}</p>
  </div>
  <div class="mt-2">
    <button @click="callChildB">Call ChildB</button>
    <p>Res: {{ childBRes }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChildA, useChildB } from '@/composables/useIpcChild'
import { childARef } from '@/composables/useChildRef'

const count = ref(0)

const mainRes = ref('')
const onPing = async () => {
  mainRes.value = await window.electronAPI.ping()
}

const { childA } = useChildA()
const childARes = ref('')
const childARefVal = childARef('updatePing', { initValue: '' })
const callChildA = async () => {
  childARes.value = await childA.ping()
}

const { childB } = useChildB()
const childBRes = ref('')
const callChildB = async () => {
  childBRes.value = await childB.callChildA()
}
</script>

<style scoped>
.mt-2 {
  margin-top: 8px;
}
</style>
