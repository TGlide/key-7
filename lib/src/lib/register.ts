import { defineCustomElement } from "vue";
import CommandCenter from "./components/CommandCenter.ce.vue";

export function register() {
  const el = defineCustomElement(CommandCenter);
  customElements.define("command-center", el);
}

(window as any).registerKey7 = register;
