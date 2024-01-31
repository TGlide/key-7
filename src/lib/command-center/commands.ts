import { Ref, computed, onMounted, onUnmounted, ref, watchEffect } from "vue";
import { sleep } from "../helpers/sleep";
import { Icon } from "../icon/types";
import { isInputEvent } from "../helpers/dom";
import { format } from "path";

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
};

const selectors = {
  selectAll:
    "div:nth-child(1) > div:nth-child(1) > label:nth-child(1) > button",
  selectBox: "div.rounded-xl:nth-child(3)",
  addEntity: '[data-test="add-entity"]',
  createProject: "div.shrink-0:nth-child(2)",
  lastEntity: '[data-test^="row-"]:last-child',
  deleteSelected: '[data-test="action-bar-delete-button"]',
  prompt: "h4 + div textarea",
  fieldName: "input[aria-label='Name']",
} as const;

function getEl(selector: keyof typeof selectors) {
  return document.querySelector(selectors[selector]) as HTMLElement | null;
}

function exists(selector: keyof typeof selectors) {
  return !!getEl(selector);
}

function isFocused(selector: keyof typeof selectors) {
  const el = getEl(selector);
  return el === document.activeElement;
}

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

function getProjectCommands(inputValue: string): Command[] {
  const selectBox = getEl("selectBox");
  const allSelected = selectBox?.getAttribute("aria-checked") === "true";

  const selectedCommands: Command[] = allSelected
    ? [
      {
        label: "Clear selection",
        icon: "close",
        shortcut: {
          keys: ["C", "S"],
        },
        callback() {
          const el = getEl("selectAll");
          el?.click();
        },
      },
      {
        label: "Delete selected",
        icon: "trash",
        shortcut: {
          keys: ["D", "S"],
        },
        callback() {
          const el = getEl("deleteSelected");
          el?.click();
        },
      },
    ]
    : [
      {
        label: "Select all",
        icon: "check",
        shortcut: {
          keys: ["S", "A"],
        },
        callback() {
          const el = getEl("selectAll");
          el?.click();
        },
      },
    ];

  const promptCommands: Command[] = isFocused("prompt")
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
        },
      },
    ]
    : [];

  const baseCommands: Array<Command> = [
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
    ...selectedCommands,
  ];

  if (inputValue) {
    const fields = document.querySelectorAll('[data-test="property-header"]');
    const fieldCommands = Array.from(fields).map((entity) => {
      const el = entity as HTMLElement;
      return {
        label: `Edit ${el.innerText}`,
        icon: "edit",
        callback() {
          el.click();
        },
      } as Command;
    });

    return [...baseCommands, ...fieldCommands];
  }

  return [...baseCommands];
}

const getCommands = (inputValue: string): Command[] => {
  if (window.location.origin !== "https://agidb.v7labs.com") {
    return [...homeCommands, ...getProjectCommands(inputValue)];
  }

  const projectPattern = /https:\/\/agidb\.v7labs\.com\/.*?\/projects\/.+/;
  if (window.location.href.match(projectPattern)) {
    return getProjectCommands(inputValue);
  }

  return [...homeCommands];
};

type UseCommandsArgs = {
  inputValue: Ref<string>;
};

export function useCommands({ inputValue }: UseCommandsArgs) {
  const commands = ref(getCommands(inputValue.value));

  const handleKeyDown = (e: KeyboardEvent) => {
    // ensure that shortcuts are updated
    if (!isInputEvent(e)) {
      commands.value = getCommands(inputValue.value);
    }
  };

  watchEffect(() => {
    // When the input value changes, update the commands
    // We need this since we're limiting input events
    // on the handleKeyDown function
    commands.value = getCommands(inputValue.value);
  });

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  const filteredCommands = computed(() => {
    return commands.value.filter((command) => {
      return (
        command.label.toLowerCase().includes(inputValue.value.toLowerCase()) ||
        command.shortcut?.keys
          .join(" ")
          .toLowerCase()
          .includes(inputValue.value.toLowerCase())
      );
    });
  });

  return filteredCommands;
}
