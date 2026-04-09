import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
 
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
      "/images": {
      target: "http://localhost:8000",
      changeOrigin: true,
    },
     "/videos": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
