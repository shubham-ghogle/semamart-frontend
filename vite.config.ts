import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //here we are defining proxy to for our api url
  server: {
    proxy: {
      "/api/v2": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/baseUrl": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baseUrl/, ""),
      },
    },
  },
});
