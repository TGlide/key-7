import { onMounted, onUnmounted } from "vue";
import { debounce } from "../helpers/debounce";
import { isMac } from "../helpers/platform";

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

function isInputEvent(event: KeyboardEvent) {
  return ["INPUT", "TEXTAREA", "SELECT"].includes(
    (event.target as HTMLElement).tagName
  );
}

function getCommandRank(command: Command) {
  if (!command.shortcut) return 0;
  const { keys, cmd, shift, alt } = command.shortcut;
  const modifiers = [cmd, shift, alt].filter(Boolean).length;
  return (keys?.length || 0) + modifiers * 10;
}

function hasDisputing(command: Command, allCommands: Command[]) {
  return allCommands.some((otherCommand) => {
    if (command === otherCommand) {
      return false;
    }
    if (!otherCommand.shortcut) {
      return false;
    }
    if (!command.shortcut) {
      return false;
    }
    const keysString = command.shortcut.keys.join("+");
    const otherKeysString = otherCommand?.shortcut.keys?.join("+");

    const cmdRank = getCommandRank(command);
    const otherCmdRank = getCommandRank(otherCommand);

    return (
      (keysString.includes(otherKeysString) ||
        otherKeysString.includes(keysString)) &&
      cmdRank <= otherCmdRank
    );
  });
}

export function useCommandCenter() {
  const commands = commandGroups.flatMap((group) => group.commands);
  let recentKeyCodes: number[] = [];
  let validCommands: Command[] = [];

  const reset = debounce(() => {
    recentKeyCodes = [];
    validCommands = [];
  }, 1000);

  const getHighestPriorityCommand = () => {
    if (!validCommands.length) return;

    if (validCommands.length === 1) {
      return validCommands[0];
    }
    // Rank commands by how many keys and modifiers they have.
    // Each key is worth 1 point, each modifier is worth 10 points.
    // The command with the highest score wins.
    const rankedCommands = validCommands.map((command) => {
      return { command, score: getCommandRank(command) };
    });

    const highestScore = Math.max(...rankedCommands.map(({ score }) => score));
    const highestScoreCommands = rankedCommands.filter(
      ({ score }) => score === highestScore
    );

    if (highestScoreCommands.length === 1) {
      return highestScoreCommands[0].command;
    }

    // If there's still a tie, the command with the most modifiers wins.
    // And if even that's a tie, the first command wins.
    const mostModifiers = Math.max(
      ...highestScoreCommands.map(({ command }) => {
        if (!command.shortcut) return 0;
        const { cmd, shift, alt } = command.shortcut;
        return [cmd, shift, alt].filter(Boolean).length;
      })
    );
    const mostModifiersCommands = highestScoreCommands.filter(({ command }) => {
      if (!command.shortcut) return false;
      const { cmd, shift, alt } = command.shortcut;
      return [cmd, shift, alt].filter(Boolean).length === mostModifiers;
    });

    return mostModifiersCommands[0]?.command;
  };

  const rankAndExecute = debounce(() => {
    const command = getHighestPriorityCommand();
    command?.callback();
    reset.immediate();
  }, 200);

  const execute = (command: Command) => {
    if (hasDisputing(command, commands)) {
      validCommands.push(command);
      rankAndExecute();
    } else {
      command.callback();
      reset.immediate();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    recentKeyCodes.push(event.keyCode);
    reset();

    for (const command of commands) {
      if (!command.shortcut) continue;

      if (isInputEvent(event)) {
        continue;
      }

      const { keys, cmd, shift, alt } = command.shortcut;

      const isMetaPressed = cmd
        ? isMac()
          ? event.metaKey
          : event.ctrlKey
        : !(isMac() ? event.metaKey : event.ctrlKey);
      const isShiftPressed = shift ? event.shiftKey : !event.shiftKey;
      const isAltPressed = alt ? event.altKey : !event.altKey;

      const commandKeyCodes = keys?.map((key) =>
        key.toUpperCase().charCodeAt(0)
      );
      const allKeysPressed = commandKeyCodes
        ? recentKeyCodes.join(",").includes(commandKeyCodes.join(","))
        : false;

      if (allKeysPressed && isMetaPressed && isShiftPressed && isAltPressed) {
        event.preventDefault();
        execute(command);
      }
    }
  };

  onMounted(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
}
