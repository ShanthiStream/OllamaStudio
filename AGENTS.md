<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Ollama Studio — Agent Guide

## Stack (non-obvious details)

- **Next.js 16** (App Router) — `"next": "16.2.10"` in package.json. Uses the next TS plugin (`plugins: [{ name: "next" }]` in tsconfig.json).
- **Tailwind CSS v4** — CSS-first config. No `tailwind.config.ts`. Theme vars defined via `@theme inline {}` in `src/app/globals.css`. Uses `@import "tailwindcss"` + `@tailwindcss/postcss` plugin.
- **shadcn/ui** — style is `"base-nova"`. Run `npx shadcn` to add components. Components live in `src/components/ui/`.
- **ESLint v9 flat config** — `eslint.config.mjs` uses `defineConfig` from `eslint/config`. Run: `npm run lint`.
- **State** — Zustand (client, persisted to localStorage key `ollama-studio-storage`) + TanStack React Query (server state, staleTime 5s).
- **Animations** — Framer Motion + `tw-animate-css`.
- **@ alias** — `@/*` maps to `src/*` (tsconfig paths).

## Two servers

| Process | Command | Port | Required? |
|---------|---------|------|-----------|
| Next.js app | `npm run dev` | 3000 | Yes |
| System monitor backend | `node server/index.js` | 3001 | Optional (degrades gracefully) |

The Express backend needs `sudo` for `powermetrics` on macOS (CPU temp, GPU usage). Add a sudoers exception for passwordless use.

## Commands

```bash
npm run dev      # Next.js dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (flat config, v9)
```

No test runner or typecheck script configured.

## Architecture

- `src/app/` — App Router pages (each feature is a route: chat, models, benchmarks, system, etc.)
- `src/components/` — UI primitives, shared layout, charts, feature-specific components
- `src/services/` — Ollama REST client + system monitor client
- `src/stores/appStore.ts` — Single Zustand store (theme, settings, conversations, favorites, templates)
- `src/hooks/` — `useOllama`, `useHardwareMonitor`, `useTheme`, `useSearch`
- `src/app/providers.tsx` — Wraps app in QueryClientProvider + MainLayout + ErrorBoundary (no theme provider imported yet despite `src/theme/` dir existing empty)
- `server/index.js` — Monolithic Express file, macOS-focused system monitoring

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_OLLAMA_API_URL` | `http://localhost:11434` | Ollama API |
| `NEXT_PUBLIC_SYSTEM_API_URL` | `http://localhost:3001` | System monitor backend |

`.env*` files are gitignored.

## Key details

- Zustand persist key: `ollama-studio-storage` (localStorage)
- Inline `@utility` CSS in globals.css: `glass`, `glass-card`, `glass-hover`, `text-gradient`
- `src/hooks/useReducedMotion.ts` — shared hook respecting `prefers-reduced-motion`. Used by: CanvasSparkline, ChatStreamVisualizer, TiltCard, MainLayout, Sidebar
- `src/hooks/useViewTransition.ts` — wraps `router.push` in `document.startViewTransition()`. Only fires if API available (Chrome 111+, Safari 18.2+)
- No tests, no CI, no pre-commit hooks, no deployment config
- Depends on `@base-ui/react` + `@radix-ui/*` + `cmdk` + `vaul` + `sonner` + `shiki`

### Hydration safety

- Portal-based components (`@base-ui/react` Select, Popover) only render after `mounted` useState flips to `true` in useEffect. Wrapped in `{mounted && (...)}` blocks on chat page and any page using portal-based UI.
- Flash-prevention inline script in `layout.tsx` reads localStorage before React hydrates to set `.dark` class
- `MainLayout.tsx` uses mounted state pattern (`initial={mounted ? {...} : false}`) to skip initial animation on first mount
