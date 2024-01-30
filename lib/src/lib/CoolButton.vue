<script setup lang="ts">
const props = defineProps<{ title: string }>()
</script>

<template>
  <button>{{ props.title }}</button>
</template>

<style scoped>
button {
  background-color: red;
}
</style>
