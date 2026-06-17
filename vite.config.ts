import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const nitroPreset = process.env.NITRO_PRESET;

export default defineConfig(({ command }) => ({
  plugins: [
    tanstackStart({
      serverFns: { disableCsrfMiddlewareWarning: true },
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  nitro: { preset: nitroPreset || "vercel" },
  ssr: {
    noExternal: command === "build" ? true : undefined,
  },
}));
