<script setup lang="ts">
import { useRafFn } from "@vueuse/core";
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import { usePlatform } from "@/lib/composables/usePlatform";
import { clamp } from "@/lib/helpers/clamp";
import Icon from "@/lib/components/icon/Icon.vue";
import { Message, useChat } from "ai/vue";
import { panel } from "./panel";
import { useCommandCenter } from "./useCommandCenter";
import {
  isInProjectPage,
  getProjectFields,
  getProjectEntities,
} from "./project";
import { sleep } from "@/lib/helpers/sleep";

/* Element Refs */
const dialog = ref<HTMLDialogElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
const inputValue = ref("");

const ul = ref<HTMLElement | null>(null);
const innerContent = ref<HTMLElement | null>(null);
const innerContentHeight = ref(0);
const scrollContainer = ref<HTMLElement | null>(null);

/* Animations & Styling */
useRafFn(() => {
  if (innerContent.value) {
    innerContentHeight.value = +getComputedStyle(
      innerContent.value!
    )?.height?.replace("px", "");
  } else {
    innerContentHeight.value = 0;
  }
});
const smoothHeight = computed(() => {
  return clamp(52, innerContentHeight.value, 300);
});

onMounted(() => {
  document.documentElement.style.setProperty("color-scheme", "dark");
});

/* AI */
const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello, how can I help you? I may answer you questions about your AGIDB project.",
  },
];

const { append, isLoading, messages } = useChat({
  api: "https://www.thomasglopes.com/ai",
  initialMessages,
});

watch(isLoading, function autoFocusInput($isLoading) {
  if (dialog.value?.open && !$isLoading) {
    sleep(100).then(() => {
      input.value?.focus();
    });
  }
});

watch(messages, function autoScrollChat() {
  if (panel.value !== "ai") return;
  scrollContainer.value?.scrollTo({
    top: scrollContainer.value?.scrollHeight,
    behavior: "smooth",
  });

  // In case DOM has not updated by the time the scroll is called
  sleep(100).then(() => {
    scrollContainer.value?.scrollTo({
      top: scrollContainer.value?.scrollHeight,
      behavior: "smooth",
    });
  });
});

watchEffect(function setInitialMessages() {
  if (panel.value !== "ai") {
    messages.value = [...initialMessages];
  } else if (messages.value.length <= 1) {
    let systemContent = `You're an assistant for V7's new tool, AGIDB.`;
    systemContent += isInProjectPage()
      ? `\nYou're currently in the project page.`
      : `\nYou're currently in the home page.`;
    if (isInProjectPage()) {
      systemContent += `\nProject information:`;
      systemContent += `\n\tFields: ${getProjectFields().join(", ")}`;
      const entities = getProjectEntities();
      systemContent += `\n\tEntities (Showing 50 at max, total is ${entities.length}):`;
      entities.slice(0, 50).forEach((entity) => {
        systemContent += `\n\t\t${entity[0]}: ${entity.slice(1).join(", ")}`;
      });
      systemContent += `\n\nThe user can ask you questions about the project.`;
    }

    const systemMessage: Message = {
      id: "0",
      role: "system",
      content: systemContent,
    };
    messages.value = [...initialMessages, systemMessage];
  }
});

/* Commands */
const { cmd, isMac } = usePlatform();
const { highlightedCommand, commands } = useCommandCenter({
  dialog,
  input,
  inputValue,
});

watchEffect(function controlHighlight() {
  input.value;
  if (!commands.value.length) {
    highlightedCommand.value = null;
  } else if (
    highlightedCommand.value &&
    highlightedCommand.value >= commands.value.length
  ) {
    highlightedCommand.value = commands.value.length - 1;
  } else if (highlightedCommand.value === null) {
    highlightedCommand.value = 0;
  }
});

function handleInputKeydown(e: KeyboardEvent) {
  const totalCommands = commands.value.length;

  if (panel.value === "default") {
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
          const command = commands.value[highlightedCommand.value];
          command?.callback();
          if (!command.keepOpen) {
            dialog.value?.close();
          }
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

    if (highlightedCommand.value !== null && ul.value) {
      const highlightedCommandEl = ul.value.children[
        highlightedCommand.value
      ] as HTMLLIElement;
      highlightedCommandEl.scrollIntoView({
        block: "nearest",
      });
    }
  } else if (panel.value === "ai") {
    switch (e.key) {
      case "Enter": {
        e.preventDefault();

        append({
          role: "user",
          content: inputValue.value,
        });
        inputValue.value = "";
        break;
      }
    }
  }
}
</script>

<template>
  <dialog ref="dialog">
    <div class="content">
      <input
        type="text"
        :placeholder="
          panel === 'default'
            ? 'Search for commands'
            : isLoading
            ? 'AI is thinking...'
            : 'Ask our AI'
        "
        :disabled="isLoading"
        ref="input"
        @keydown="handleInputKeydown"
        v-model="inputValue"
      />
      <hr />
      <div class="smooth-height" :style="`--height: ${smoothHeight}px`">
        <div
          class="immediate-height"
          :style="`height: ${smoothHeight}px`"
          ref="scrollContainer"
        >
          <div class="inner-content" ref="innerContent">
            <!-- Commands -->
            <template v-if="panel === 'default'">
              <ul v-if="commands.length" ref="ul">
                <li
                  class="command"
                  v-for="(command, i) in commands"
                  :data-highlighted="highlightedCommand === i"
                  @click="
                    () => {
                      command.callback();
                      if (!command.keepOpen) {
                        dialog?.close();
                      }
                    }
                  "
                  @mouseover="() => (highlightedCommand = i)"
                >
                  <div class="inner">
                    <div class="start">
                      <Icon :icon="command.icon" />
                      <span class="label">{{ command.label }}</span>
                    </div>
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
                        <template
                          v-for="(key, i) in command.shortcut.keys"
                          :key="i"
                        >
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
              </ul>
              <p class="empty" v-else>No results found</p>
            </template>
            <!-- AI -->
            <template v-else>
              <div class="messages" v-if="messages.length">
                <p
                  class="message"
                  :data-origin="message.role"
                  v-for="message in messages.filter(
                    ({ role }) => role !== 'system'
                  )"
                >
                  {{ message.content }}
                </p>
              </div>
              <p class="empty" v-else>Ask our AI a question!</p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
@use "sass:color";
@import "../../styles/colors.scss";

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
  margin-inline: auto;
  margin-block-start: min(30vh, 26.25rem);
  opacity: 0;
  --scale-from: 0.95;

  backdrop-filter: blur(32px);
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

.smooth-height {
  height: var(--height);
  transition: height 100ms ease;
  overflow-y: hidden;
}

.immediate-height {
  height: var(--height);
  overflow-y: auto;
}

ul {
  list-style: none;
  padding-block: 0.5rem;

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
    scroll-margin-block: 0.5rem;

    .inner {
      display: flex;
      justify-content: space-between;
      align-items: center;

      border-radius: 8px;

      padding-block: 0.75rem;
      padding-inline: 1rem;

      user-select: none;

      .start {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
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

.empty {
  text-align: center;
  color: $colar-gray-6;
  margin-block: 1rem;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-block: 2rem;
  padding-inline: 1rem;

  .message {
    $radius: 0.5rem;
    background-color: color.adjust($colar-gray-12, $alpha: -0.5);
    color: white;
    border-radius: $radius;
    border-bottom-left-radius: 0;
    padding: 1rem;
    font-size: 14px;

    max-width: min(80%, 25rem);

    &[data-origin="user"] {
      background-color: $colar-blue-8;
      border-bottom-left-radius: $radius;
      border-bottom-right-radius: 0;
      align-self: flex-end;
    }
  }
}
</style>
