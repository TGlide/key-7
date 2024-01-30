import vue from "@vitejs/plugin-vue";
import * as path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "Key7",
      fileName: "key-7",
    },
    // rollupOptions: {
    //   external: ["vue"],
    //   output: {
    //     globals: {
    //       vue: "Vue",
    //     },
    //   },
    // },
    
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
