
export function isInputEvent(event: KeyboardEvent) {
  return ["INPUT", "TEXTAREA", "SELECT", "COMMAND-CENTER"].includes(
    (event.target as HTMLElement).tagName
  );
}
