<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    light?: boolean
    spaced?: boolean
  }>(),
  {
    light: false,
    spaced: false,
  },
)
</script>

<template>
  <td
    class="font-alt whitespace-nowrap text-sm"
    :class="[
      props.light
        ? 'text-muted-500 dark:text-white'
        : 'text-muted-800 dark:text-white',
      props.spaced ? 'px-4 py-3' : 'py-3',
    ]"
  >
    <slot></slot>
  </td>
</template>
