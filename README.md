# Key 7

## Description

Key 7 is a command center built for V7's internal use. It is a web-component built with Vue.js that can be injected into V7's web applications.

## Features

- AI-powered search with project context
- Project navigation
- Context-aware commands
- Keyboard shortcuts

## Tech Stack

- Vue
- Typescript
- SCSS

### Libraries used

- Vercel AI SDK
- Vue Use

## Usage

Copy-paste this in your browser's console:

```javascript
var script = document.createElement("script");
script.setAttribute(
  "src",
  "https://cdn.jsdelivr.net/npm/key-7@0.0.36/dist/key-7.js"
);
script.setAttribute("type", "module");
script.setAttribute("id", "key-7");
document.head.appendChild(script);

script.addEventListener("load", function () {
  window.registerKey7();
  const el = document.createElement("command-center");
  const app = document.querySelector("#app");
  app.prepend(el);
  console.log("Key 7 loaded!");
});
```
