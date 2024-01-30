<script setup lang="ts">
import { register } from "key-7";
register();
</script>

<template>
  <div>
    <span>hi</span>
    <tri-state-checkbox :model-value="false" />
  </div>
</template>
