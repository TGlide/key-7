<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { usePlatform } from "../composables/usePlatform";
import { commandGroups } from "./commands";
import { useCommandCenter } from "./useCommandCenter";

const dialog = ref<HTMLDialogElement | null>(null);

const { cmd, isMac } = usePlatform();

const { highlightedCommand } = useCommandCenter({ dialog });

function handleInputKeydown(e: KeyboardEvent) {
  const totalCommands = commandGroups.reduce(
    (acc, group) => acc + group.commands.length,
    0
  );

  switch (e.key) {
    case "ArrowDown": {
      e.preventDefault();
      if (highlightedCommand.value === null) {
        highlightedCommand.value = 0;
      } else {
        highlightedCommand.value = Math.min(
          highlightedCommand.value + 1,
          totalCommands - 1
        );
      }
      break;
    }

    case "ArrowUp": {
      e.preventDefault();
      if (highlightedCommand.value === null) {
        highlightedCommand.value = totalCommands - 1;
      } else {
        highlightedCommand.value = Math.max(highlightedCommand.value - 1, 0);
      }
      break;
    }

    case "Enter": {
      e.preventDefault();
      if (highlightedCommand.value !== null) {
        commandGroups.forEach((group) => {
          if (highlightedCommand.value! < group.commands.length) {
            group.commands[highlightedCommand.value!].callback();
          } else {
            highlightedCommand.value! -= group.commands.length;
          }
        });
        dialog.value?.close();
      }
      break;
    }

    case "Home": {
      e.preventDefault();
      highlightedCommand.value = 0;
      break;
    }

    case "End": {
      e.preventDefault();
      highlightedCommand.value = totalCommands - 1;
      break;
    }
  }
}
</script>

<template>
  <dialog ref="dialog">
    <div class="content">
      <input
        type="text"
        placeholder="Search for commands or fields"
        ref="input"
        @keydown="handleInputKeydown"
      />
      <hr />
      <ul>
        <template v-for="group in commandGroups">
          <li class="group">{{ group.label }}</li>
          <li
            class="command"
            v-for="(command, i) in group.commands"
            :data-highlighted="highlightedCommand === i"
            @click="
              () => {
                command.callback();
                dialog?.close();
              }
            "
            @mouseover="() => (highlightedCommand = i)"
            @mouseleave="() => (highlightedCommand = null)"
          >
            <div class="inner">
              <span class="label">{{ command.label }}</span>
              <div class="shortcut" v-if="command.shortcut">
                <kbd class="kbd" v-if="command.shortcut.cmd">
                  {{ cmd.label }}
                </kbd>
                <kbd class="kbd" v-if="command.shortcut.shift">
                  {{ isMac ? "⇧" : "Shift" }}
                </kbd>
                <kbd class="kbd" v-if="command.shortcut.alt">
                  {{ isMac ? "⌥" : "Alt" }}
                </kbd>
                <template v-if="command.shortcut">
                  <template v-for="(key, i) in command.shortcut.keys" :key="i">
                    <kbd class="kbd">
                      {{ key.toUpperCase() }}
                    </kbd>
                    <span v-if="i !== command.shortcut.keys.length - 1">
                      then
                    </span>
                  </template>
                </template>
              </div>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
@use "sass:color";
@import "../styles/colors.scss";

* {
  background: 0;
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
  padding: 0;

  &:not(dialog) {
    margin: 0;
  }
}

dialog {
  @keyframes pop-in {
    0% {
      transform: scale(var(--scale-from));
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes pop-out {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(var(--scale-from));
    }
  }

  display: block;
  inset: 0;
  opacity: 0;
  --scale-from: 0.95;

  border: none;
  box-shadow: 0px 16px 32px 0px color.adjust($colar-gray-12, $alpha: -0.75);

  animation: pop-out 150ms ease-in-out forwards;
  pointer-events: none;
  outline: none;
  transition: opacity 150ms ease-in-out;

  &[open] {
    animation-name: pop-in;
    pointer-events: auto;
    opacity: 1;
  }

  &::backdrop {
    opacity: 0;
  }
}

.content {
  width: min(40rem, 100vw - 3rem);
  max-height: min(100vh, 30rem);
  background-color: color.adjust($colar-gray-11, $alpha: -0.375);
  backdrop-filter: blur(32px);
  border-radius: 0.5rem;
  border: 1px solid $colar-gray-10;
}

input {
  background: none;
  border: none;
  outline: none;
  color: $colar-gray-4;

  font-size: 1.25rem;
  font-weight: 300;
  padding: 1rem;
  width: 100%;
}

hr {
  border: none;
  border-bottom: 1px solid $colar-gray-10;
}

ul {
  list-style: none;
  padding-block: 0.25rem;

  .group {
    color: $colar-gray-7;
    font-weight: 400;
    font-size: 0.875rem;

    margin-block-start: 0.5rem;
    margin-block-end: 0.25rem;
    margin-inline-start: 1rem;
  }

  .command {
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
    padding-block: 0.125rem; // Give padding so it's still clickable, but looks separated from the group
    padding-inline: 0.5rem;

    .inner {
      display: flex;
      justify-content: space-between;
      align-items: center;

      border-radius: 8px;

      padding-block: 0.75rem;
      padding-inline: 1rem;

      user-select: none;
    }
    &[data-highlighted="true"] .inner {
      background-color: $colar-gray-10;
    }

    .shortcut {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;

      span {
        color: $colar-gray-6;
      }
    }
  }
}

kbd {
  display: grid;
  place-items: center;

  $size: 1.5rem;
  width: $size;
  height: $size;
  background-color: color.adjust($colar-gray-10, $alpha: -0.5);
  border-radius: 0.25rem;
  border: 1px solid $colar-gray-8;
}
</style>
