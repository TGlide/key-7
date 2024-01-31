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

// export const commandGroups: CommandGroup[] = [
//   {
//     label: "General",
//     commands: [
//       {
//         label: "Add new entity",
//         icon: 'add',
//         shortcut: {
//           keys: ["A", "E"],
//         },
//         async callback() {
//           document.querySelector("[data-test='add-entity']")?.dispatchEvent(new MouseEvent("click"));
//           await sleep(150)
//           // get last data-test="row-n"
//           const lastRow = document.querySelector("[data-test^='row-']:last-child");
//           const firstCell = lastRow?.querySelector("[data-test^='cell-']");
//           firstCell?.dispatchEvent(new MouseEvent("click"));
//           console.log("Add new entity - new");
//         },
//       },
//       {
//         label: "Add new field",
//         icon: 'add',
//         shortcut: {
//           keys: ["A", "F"],
//         },
//         callback() {
//           console.log("Add new field");
//         },
//       },
//     ],
//   },
// ];

const homeCommands: Command[] = [
  {
    label: 'Create new project',
    icon: 'add',
    shortcut: {
      keys: ['C'],
    },
    callback() {
      console.log('Create new project');
      const el = document.querySelector('div.shrink-0:nth-child(2)') as HTMLElement | null
      el?.click()
    },
  }
]
const projectCommands: Command[] = [
  {
    label: 'Go home',
    icon: 'home',
    shortcut: {
      keys: ['G', 'H'],
    },
    callback() {
      window.location.href = 'https://agidb.v7labs.com/'
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
      document
        .querySelector("[data-test='add-entity']")
        ?.dispatchEvent(new MouseEvent("click"));
      await sleep(500);
      // get last data-test="row-n"
      const lastRow = document.querySelector(
        "[data-test^='row-']:last-child"
      );
      const firstCell = lastRow?.querySelector("[data-test^='cell-']") as HTMLElement | null;
      firstCell?.click()
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
      const el = document.querySelector("[data-test='add-properrty']") as HTMLElement | null
      el?.click()
    },
  },
];

export const getCommands = (): Command[] => {
  if (window.location.origin !== 'https://agidb.v7labs.com') {
    return [...homeCommands, ...projectCommands]
  }

  if (window.location.pathname.endsWith('/projects')) {
    return [...homeCommands]
  }

  return [...projectCommands]
};
