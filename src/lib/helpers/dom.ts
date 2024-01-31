
export function isInputEvent(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (target.tagName === "COMMAND-CENTER") {
    return target.querySelector('dialog')?.open;
  }

  return ["INPUT", "TEXTAREA", "SELECT"].includes(
    (event.target as HTMLElement).tagName
  );
}
