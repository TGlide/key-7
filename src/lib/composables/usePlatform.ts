import { computed, onMounted, ref } from "vue";
import { isMac as getIsMac } from "@/lib/helpers/platform";

export function usePlatform() {
  const isMac = ref(false);

  onMounted(() => {
    isMac.value = getIsMac()
  })

  return {
    isMac,
    isWindows: computed(() => !isMac.value),
    cmd: computed(() => {
      if (isMac.value) {
        return { label: "⌘", get: (e: KeyboardEvent) => e.metaKey }
      }
      return { label: "Ctrl", get: (e: KeyboardEvent) => e.ctrlKey }
    })
  }
}