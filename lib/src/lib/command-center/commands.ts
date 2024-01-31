import { Ref, onMounted, onUnmounted } from "vue";
import { debounce } from "../helpers/debounce";

import { usePlatform } from "../composables/usePlatform";

export type Shortcut = {
  keys: string[];
  cmd?: boolean;
  alt?: boolean;
  shift?: boolean;
};

export type Command = {
  label: string;
  shortcut?: Shortcut;
  callback: () => void;
};

export type CommandGroup = {
  label: string;
  commands: Command[];
};

export const commandGroups: CommandGroup[] = [
  {
    label: "General",
    commands: [
      {
        label: "Add new entity",
        shortcut: {
          keys: ["A", "E"],
        },
        callback() {
          console.log("Add new entity");
        },
      },
      {
        label: "Add new field",
        shortcut: {
          keys: ["A", "F"],
        },
        callback() {
          console.log("Add new field");
        },
      },
    ],
  },
];
