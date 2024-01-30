<script setup lang="ts">
import { ref } from "vue";
import { TriStateCheckbox } from "./lib";

const v = ref(false);
</script>

<template>
  <TriStateCheckbox v-model:model-value="v" />
</template>
