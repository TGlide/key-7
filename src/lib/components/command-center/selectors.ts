export const selectors = {
  selectAll:
    "div:nth-child(1) > div:nth-child(1) > label:nth-child(1) > button",
  selectBox: "div.rounded-xl:nth-child(3)",
  addEntity: '[data-test="add-entity"]',
  createProject: "div.shrink-0:nth-child(2)",
  lastEntity: '[data-test^="row-"]:last-child',
  deleteSelected: '[data-test="action-bar-delete-button"]',
  prompt: "[aria-label='Set a prompt']",
  fieldName: "input[aria-label='Name']",
} as const;

export function getEl(selector: keyof typeof selectors) {
  return document.querySelector(selectors[selector]) as HTMLElement | null;
}

export function exists(selector: keyof typeof selectors) {
  return !!getEl(selector);
}
