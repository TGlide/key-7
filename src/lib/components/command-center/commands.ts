import { sleep } from "@/lib/helpers/sleep";
import { Icon } from "../icon/types";
import { panel } from "./panel";
import { isInProjectPage } from "./project";
import { exists, getEl } from "./selectors";

export type Shortcut = {
  keys: string[];
  cmd?: boolean;
  alt?: boolean;
  shift?: boolean;
};

export type Command = {
  label: string;
  icon: Icon;
  shortcut?: Shortcut;
  callback: () => void;
  keepOpen?: boolean;
};

const homeCommands: Command[] = [
  {
    label: "Create new project",
    icon: "add",
    shortcut: {
      keys: ["C"],
    },
    callback() {
      console.log("Create new project");
      const el = getEl("createProject");
      el?.click();
    },
  },
];

const clear: Command = {
  label: "Clear selection",
  icon: "close",
  shortcut: {
    keys: ["C", "S"],
  },
  callback() {
    const el = getEl("selectAll");
    el?.click();
  },
};

const selectAll: Command = {
  label: "Select all",
  icon: "check",
  shortcut: {
    keys: ["S", "A"],
  },
  callback() {
    const el = getEl("selectAll");
    el?.click();
  },
};

const deleteSelected: Command = {
  label: "Delete selected",
  icon: "trash",
  shortcut: {
    keys: ["D", "S"],
  },
  callback() {
    const el = getEl("deleteSelected");
    el?.click();
  },
};

function getProjectCommands(inputValue: string): Command[] {
  const selected = getEl("selectAll")?.getAttribute("aria-checked");
  const allSelected = selected === "true";
  const hasSelected = !!selected && selected !== "false";

  const selectedCommands: Command[] = [];

  if (hasSelected) {
    selectedCommands.push(clear);
    selectedCommands.push(deleteSelected);
  }

  if (!allSelected) {
    selectedCommands.push(selectAll);
  }

  const promptCommands: Command[] = exists("prompt")
    ? [
      {
        label: "Insert template prompt",
        icon: "edit",
        callback() {
          const el = getEl("prompt") as HTMLTextAreaElement | null;
          if (!el) return;
          const name = getEl("fieldName") as HTMLInputElement | null;
          if (!name) return;

          const template = `Reply with ${name.value} only. Do not say any extra info, the reply should be exclusively an objective answer without extra padding.`;
          el.value = template;
          // send a input event to trigger the vue update
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.click();

          el.focus();
        },
      },
    ]
    : [];

  const baseCommands: Array<Command> = [
    {
      label: "Ask our AI",
      icon: "ai",
      callback() {
        panel.value = "ai";
      },
      keepOpen: true,
    },
    ...promptCommands,
    {
      label: "Add new entity",
      icon: "add",
      shortcut: {
        keys: ["A", "E"],
      },
      async callback() {
        console.log("Add new entity");
        getEl("addEntity")?.click();
        await sleep(500);
        // get last data-test="row-n"
        const lastRow = getEl("lastEntity");
        const firstCell = lastRow?.querySelector(
          "[data-test^='cell-']"
        ) as HTMLElement | null;
        firstCell?.click();
      },
    },
    {
      label: "Add new field",
      icon: "add",
      shortcut: {
        keys: ["A", "F"],
      },
      callback() {
        console.log("Add new field");
        const el = document.querySelector(
          "[data-test='add-property']"
        ) as HTMLElement | null;
        el?.click();
      },
    },
    ...selectedCommands,
    {
      label: "Go home",
      icon: "home",
      shortcut: {
        keys: ["G", "H"],
      },
      callback() {
        window.location.href = "https://agidb.v7labs.com/";
      },
    },
  ];

  if (inputValue) {
    const fields = document.querySelectorAll('[data-test="property-header"]');
    const fieldCommands = Array.from(fields).map((entity) => {
      const el = entity as HTMLElement;
      return {
        label: `Edit ${el.innerText}`,
        icon: "edit",
        callback() {
          const btn = el.querySelector("[role='button']") as HTMLElement | null
          btn?.click();
        },
      } as Command;
    });

    return [...baseCommands, ...fieldCommands];
  }

  return [...baseCommands];
}

export function getCommands(inputValue: string): Command[] {
  if (window.location.origin !== "https://agidb.v7labs.com") {
    return [...homeCommands, ...getProjectCommands(inputValue)];
  }

  if (isInProjectPage()) {
    return getProjectCommands(inputValue);
  }

  return [...homeCommands];
}
