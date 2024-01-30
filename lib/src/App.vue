<script setup lang="ts">
import { ref } from "vue";
import { CommandCenter } from "./lib";
import { usePlatform } from "./lib/composables/usePlatform";

const { cmd } = usePlatform();
const open = ref(false);
</script>

<template>
  <main>
    <p>Press {{ cmd.label }} + K</p>
    <button @click="open = true">or just press me, that's fine too!</button>
    <CommandCenter v-model:open="open" />
  </main>
</template>

<style scoped lang="scss">
main {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  width: 100vw;
}

p {
  font-family: "Inter", sans-serif;
  font-size: 5rem;
  opacity: 0.5;
  font-weight: 800;
  margin: 0;
  padding: 0;
}

button {
  border: none;
  background: none;
  color: white;
  opacity: 0.75;
  font-size: 0.875rem;
  margin-block-start: 0.5rem;

  &:hover {
    cursor: pointer;
    opacity: 1;
    text-decoration: underline;
  }
}

@media (max-width: 600px) {
  p {
    font-size: 3rem;
  }
}
</style>
