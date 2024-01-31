import { Ref, onMounted, onUnmounted, ref, watchEffect } from "vue";
import { usePlatform } from "../composables/usePlatform";
import { debounce } from "../helpers/debounce";
import { Command, useCommands } from "./commands";
import { isInputEvent } from "../helpers/dom";

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

type UseCommandCenterArgs = {
  dialog: Ref<HTMLDialogElement | null>;
  input: Ref<HTMLInputElement | null>;
};

export function useCommandCenter({ dialog, input }: UseCommandCenterArgs) {
  const platform = usePlatform();
  let recentKeyCodes: number[] = [];
  const commands = useCommands({ dialog })
  let validCommands: Command[] = [];
  const highlightedCommand = ref<number | null>(null);

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
    if (hasDisputing(command, commands.value)) {
      validCommands.push(command);
      rankAndExecute();
    } else {
      command.callback();
      reset.immediate();
    }
  };


  const handleKeyDown = (e: KeyboardEvent) => {
    // Toggle on Cmd K
    if (platform.cmd.value.get(e) && e.key === "k") {
      e.preventDefault();
      if (dialog.value?.open) {
        dialog.value?.close();
      } else {
        dialog.value?.showModal();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      dialog.value?.close();
      return;
    }

    // Shortcut handling
    recentKeyCodes.push(e.keyCode);
    reset();

    for (const command of commands.value) {
      if (!command.shortcut) continue;

      if (isInputEvent(e)) {
        continue;
      }

      const { keys, cmd, shift, alt } = command.shortcut;

      const isMetaPressed = cmd
        ? platform.cmd.value.get(e)
        : !platform.cmd.value.get(e);
      const isShiftPressed = shift ? e.shiftKey : !e.shiftKey;
      const isAltPressed = alt ? e.altKey : !e.altKey;

      const commandKeyCodes = keys?.map((key) =>
        key.toUpperCase().charCodeAt(0)
      );
      const allKeysPressed = commandKeyCodes
        ? recentKeyCodes.join(",").includes(commandKeyCodes.join(","))
        : false;

      if (allKeysPressed && isMetaPressed && isShiftPressed && isAltPressed) {
        e.preventDefault();
        execute(command);
      }
    }
  };

  const handleDialogPointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "DIALOG") {
      dialog.value?.close();
    }
  };

  const handleDialogClose = () => {
    highlightedCommand.value = null;
    input.value?.blur();
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
    dialog.value?.addEventListener("pointerdown", handleDialogPointerDown);
    dialog.value?.addEventListener("close", handleDialogClose);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
    dialog.value?.removeEventListener("pointerdown", handleDialogPointerDown);
    dialog.value?.removeEventListener("close", handleDialogClose);
  });

  return { highlightedCommand, commands };
}
