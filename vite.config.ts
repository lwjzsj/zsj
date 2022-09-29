import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path, { resolve } from 'path'
function _resolve(dir: string) {
  return path.resolve(__dirname, dir)
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, 'src'), // 路径别名
    },
  },
  // Vite optons tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host:"0.0.0.0",
    proxy: {
      "218.63.232.11:10004/": {
        target: `http://218.63.232.11:10004`,
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/serve/, "/"),
      },
      "218.63.232.11:10002": {
        target: `http://218.63.232.11:10002`,
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/upload/, "/"),
      }
    }
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: ["es2021", "chrome100", "safari13"],
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
