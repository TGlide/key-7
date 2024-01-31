<script setup lang="ts">
import type { Icon } from "./types";
const { icon } = defineProps<{ icon: Icon }>();
</script>

<template>
  <svg
    v-if="icon === 'add'"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 15 15"
  >
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M8 2.75a.5.5 0 0 0-1 0V7H2.75a.5.5 0 0 0 0 1H7v4.25a.5.5 0 0 0 1 0V8h4.25a.5.5 0 0 0 0-1H8z"
      clip-rule="evenodd"
    />
  </svg>
</template>
