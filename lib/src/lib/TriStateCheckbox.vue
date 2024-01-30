<template>
  <label>
    <input
      type="checkbox"
      :disabled="disabled"
      :indeterminate="val === null"
      :checked="val === true"
      @click="change"
    />
    <span>
      {{ label }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    modelValue: boolean | null;
    disabled?: boolean;
    color?: string;
  }>(),
  {
    color: "#2f4fef",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean | null): void;
}>();

const val = ref<boolean | null>(false);

const change = () => {
  if (val.value === false) val.value = null;
  else if (val.value === null) val.value = true;
  else val.value = false;
  emit("update:modelValue", val.value);
};

watch(
  () => props.modelValue,
  (value) => (val.value = value)
);
</script>
