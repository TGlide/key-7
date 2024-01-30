import { defineCustomElement } from "vue";
import TriStateCheckbox from "./TriStateCheckbox.vue";

export function register() {
  const el = defineCustomElement(TriStateCheckbox);
  customElements.define("tri-state-checkbox", el);
}

(window as any).registerKey7 = register;
