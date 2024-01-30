<script setup lang="ts">
import { onMounted, ref } from "vue";

const dialog = ref<HTMLDialogElement | null>(null);
const isMac = ref<boolean>(false);

onMounted(() => {
  isMac.value = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  window.addEventListener("keydown", (e) => {
    // Toggle on Cmd K
    if (e.metaKey && e.key === "k") {
      const isOpen = dialog.value?.open;
      if (isOpen) {
        dialog.value?.close();
      } else {
        dialog.value?.showModal();
      }
    }

    if (e.key === "Escape") {
      dialog.value?.close();
    }
  });

  dialog.value?.addEventListener("pointerdown", (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "DIALOG") {
      dialog.value?.close();
    }
  });
});

type Command = {
  label: string;
  shortcut?: string;
};

type CommandGroup = {
  label: string;
  commands: Command[];
};

const commands: CommandGroup[] = [
  {
    label: "General",
    commands: [
      {
        label: "Add new entity",
        shortcut: "A+E",
      },
      {
        label: "Add new field",
        shortcut: "A+F",
      },
    ],
  },
];
</script>

<template>
  <dialog ref="dialog">
    <div class="content">
      <input type="text" placeholder="Search for commands or fields" />
      <hr />
      <ul>
        <template v-for="group in commands">
          <li class="group">{{ group.label }}</li>
          <li class="command" v-for="command in group.commands">
            <div class="inner">
              <span class="label">{{ command.label }}</span>
              <span class="shortcut" v-if="command.shortcut">
                {{ command.shortcut }}
              </span>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
@import "./colors.scss";

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
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pop-out {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(var(--scale-from));
      opacity: 0;
    }
  }

  display: block;
  opacity: 0;
  --scale-from: 0.95;

  border: none;

  animation: pop-out 150ms ease-in-out forwards;
  pointer-events: none;
  outline: none;

  &[open] {
    animation-name: pop-in;
    pointer-events: auto;
  }

  &::backdrop {
    backdrop-filter: blur(0.25rem);
  }
}

.content {
  width: 40rem;
  max-height: min(100vh, 30rem);
  background-color: $colar-gray-11;
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
    &:hover .inner {
      background-color: $colar-gray-10;
    }
  }
}
</style>
