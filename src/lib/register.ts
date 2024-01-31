import { defineCustomElement } from "vue";
import CommandCenter from "./command-center/CommandCenter.ce.vue";

export const CommandCenterElement = defineCustomElement(CommandCenter);


export function register() {
  customElements.define("command-center", CommandCenterElement);
}

(window as any).registerKey7 = register;
