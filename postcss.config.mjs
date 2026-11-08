import { fileURLToPath } from "node:url";

const config = {
  plugins: {
    // Resolve from this config rather than Turbopack's generated worker directory.
    [fileURLToPath(new URL("./node_modules/@tailwindcss/postcss/dist/index.js", import.meta.url))]: {},
  },
};
export default config;
