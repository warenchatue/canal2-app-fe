<script setup lang="ts">
const { open } = usePanels()
</script>

<template>
  <button
    type="button"
    class="bg-primary-700 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300"
    @click="open('language')"
  >
    <img
      class="h-7 w-7 rounded-full"
      src="/img/icons/flags/france.svg"
      alt="flag icon"
    />
  </button>
</template>
