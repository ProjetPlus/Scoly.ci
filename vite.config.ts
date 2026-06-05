// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  // Force Nitro on with the Vercel preset so `vercel build` produces a working SSR output
  // (.vercel/output/). Lovable's own sandbox/deploy keeps using Cloudflare via its detection.
  // On Vercel we ship a static client-only build (SPA fallback via vercel.json).
  // Lovable's own sandbox/deploy continues to use Cloudflare Workers SSR.
  nitro: process.env.VERCEL ? false : { preset: "cloudflare-module" },
});
