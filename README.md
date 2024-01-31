# Key 7

### Usage

Copy-paste this in your browser's console:

```javascript
var script = document.createElement("script");
script.setAttribute("src", "https://cdn.jsdelivr.net/npm/key-7/dist/key-7.js");
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
