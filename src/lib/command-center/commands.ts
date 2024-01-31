import { sleep } from "../helpers/sleep";
import { Icon } from "../icon/types";


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
        icon: 'add',
        shortcut: {
          keys: ["A", "E"],
        },
        async callback() {
          document.querySelector("[data-test='add-entity']")?.dispatchEvent(new MouseEvent("click"));
          await sleep(150)
          // get last data-test="row-n"
          const lastRow = document.querySelector("[data-test^='row-']:last-child");
          const firstCell = lastRow?.querySelector("[data-test^='cell-']");
          firstCell?.dispatchEvent(new MouseEvent("click"));
          console.log("Add new entity - new");
        },
      },
      {
        label: "Add new field",
        icon: 'add',
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
