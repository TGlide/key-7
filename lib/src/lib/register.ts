import { defineCustomElement } from "vue";
import CommandCenter from "./CommandCenter.vue";

export function register() {
  const el = defineCustomElement(CommandCenter);
  customElements.define("command-center", el);
}

(window as any).registerKey7 = register;
