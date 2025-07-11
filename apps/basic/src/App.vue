<template>
  <h1>Electron Vite Vue Basic</h1>
  <div>
    <button @click="count++">Count {{ count }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>
