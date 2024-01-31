import { ref } from "vue";

type Panel = "default" | "ai";
export const panel = ref<Panel>("default");
