<script setup lang="ts">
import { onMounted, ref } from "vue";

const dialog = ref<HTMLDialogElement | null>(null);

onMounted(() => {
  window.addEventListener("keydown", (e) => {
    // Toggle on Cmd K
    if (e.metaKey && e.key === "k") {
      const isOpen = dialog.value?.open;
      if (isOpen) {
        dialog.value?.close();
      } else {
        dialog.value?.showModal();
      }
    }

    if (e.key === "Escape") {
      dialog.value?.close();
    }
  });
});
</script>

<template>
  <dialog ref="dialog">
    <input type="text" placeholder="Search for commands or fields" />
  </dialog>
</template>

<style scoped>
* {
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
  padding: 0;
}

*:not(dialog) {
  margin: 0;
}
</style>
