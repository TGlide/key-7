<script setup lang="ts">
import { onMounted, ref } from "vue";
import { CommandCenter } from "./lib";

const v = ref(false);

onMounted(() => {
  const iframe = document.querySelector("iframe");
  const global = iframe?.contentWindow;
  console.log(global);

  global?.window.addEventListener("load", () => {
    const script = document.createElement("script");
    script.setAttribute(
      "src",
      "https://cdn.jsdelivr.net/npm/key-7@0.0.4/dist/key-7.js"
    );
    script.setAttribute("type", "module");
    script.setAttribute("id", "key-7");
    console.log(global?.document.head);
    global?.parent.document.head.appendChild(script);

    script.addEventListener("load", function () {
      (global?.window as any)?.registerKey7();
      const el = document.createElement("tri-state-checkbox");
      const app = document.querySelector("#app");
      app?.prepend(el);
    });
  });
});
</script>

<template>
  <main>
    <p>Press ⌘ + K</p>
    <CommandCenter />
  </main>
</template>

<style scoped>
p {
  font-family: "Inter", sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  padding: 0;
}

main {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  width: 100vw;
}
</style>
