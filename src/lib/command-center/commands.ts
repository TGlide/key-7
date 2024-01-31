import { Ref, onMounted, onUnmounted, ref } from "vue";
import { sleep } from "../helpers/sleep";
import { Icon } from "../icon/types";
import { isInputEvent } from "../helpers/dom";

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
  selectAll: "div:nth-child(1) > div:nth-child(1) > label:nth-child(1)",
  selectBox: "div.rounded-xl:nth-child(3)",
  addEntity: '[data-test="add-entity"]',
  createProject: "div.shrink-0:nth-child(2)",
  lastEntity: '[data-test^="row-"]:last-child',
  deleteSelected: '[data-test="action-bar-delete-button"]',
} as const;

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

function getEl(selector: keyof typeof selectors) {
  return document.querySelector(selectors[selector]) as HTMLElement | null;
}

function exists(selector: keyof typeof selectors) {
  return !!getEl(selector);
}

function getProjectCommands(): Command[] {
  const isSelecting = exists("selectBox");

  return [
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
          "[data-test='add-properrty']"
        ) as HTMLElement | null;
        el?.click();
      },
    },
    ...(isSelecting
      ? [
        {
          label: "Clear selection",
          // icon: 'clear',
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
          shortcut: {
            keys: ["S", "A"],
          },
          callback() {
            const el = getEl("selectAll");
            el?.click();
          },
        },
      ]),
  ].filter(Boolean) as Command[];
}

const getCommands = (): Command[] => {
  if (window.location.origin !== "https://agidb.v7labs.com") {
    return [...homeCommands, ...getProjectCommands()];
  }

  if (window.location.pathname.endsWith("/projects")) {
    return [...homeCommands];
  }

  return getProjectCommands();
};

type UseCommandsArgs = {
  dialog: Ref<HTMLDialogElement | null>;
};

export function useCommands({ dialog }: UseCommandsArgs) {
  const commands = ref(getCommands());

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isInputEvent(e)) {
      commands.value = getCommands();
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  return commands;
}