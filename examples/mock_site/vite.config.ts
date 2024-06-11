import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import { MockPlugin } from "@rr-utils/vite-plugin-mock";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), MockPlugin(path.resolve(__dirname, "./mock/index.ts"))],
});
