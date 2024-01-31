import { Ref, ref, watchEffect, onMounted, onUnmounted, computed } from "vue";
import { getCommands } from "./commands";

type UseCommandsArgs = {
  inputValue: Ref<string>;
};

export function useCommands({ inputValue }: UseCommandsArgs) {
  const commands = ref(getCommands(inputValue.value));

  const handleKeyDown = (e: KeyboardEvent) => {
    // ensure that shortcuts are updated
    commands.value = getCommands(inputValue.value);
  };

  watchEffect(() => {
    // When the input value changes, update the commands
    // We need this to ocassionally avoid racing conditions
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