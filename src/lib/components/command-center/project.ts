export function isInProjectPage() {
  const projectPattern = /https:\/\/agidb\.v7labs\.com\/.*?\/projects\/.+/;
  return !!window.location.href.match(projectPattern);
}

export function getProjectFields() {
  const fields = document.querySelectorAll('[data-test="property-header"]');
  return Array.from(fields).map((entity) => {
    const el = entity as HTMLElement;
    return el?.innerText;
  }).filter(Boolean);
}

export function getProjectEntities() {
  const entities = document.querySelectorAll('[data-test^="row-"]');
  return Array.from(entities).map((entity) => {
    const el = entity as HTMLElement;
    return el?.innerText.split("\n")
  }).filter(Boolean);
}