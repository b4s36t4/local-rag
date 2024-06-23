import { defineConfig } from 'astro/config';
import wasm from "vite-plugin-wasm"
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  vite: {
    plugins: [wasm()]
  }
});