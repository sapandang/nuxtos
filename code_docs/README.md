# NuxtOS Docs

This folder is the working documentation for the NuxtOS prototype.

If you are an AI model or a new developer, start here:

1. `docs/AI-HANDOFF.md` - fast onboarding, architecture map, and guardrails.
2. `docs/FEATURE-PLAYBOOKS.md` - step-by-step instructions for common changes.

## Current status (April 2026)

- Custom window manager implemented in Vue (no external drag/resize library).
- App registry system at `app/application/registry.ts` — single source of truth for installed apps.
- Desktop layout and folder grouping defined at `app/application/desktop-layout.ts`.
- App modules live in `app/application/<app-id>/AppRoot.vue`.
- Calculator, Browser, Explorer, Settings apps included as reference implementations.
- Path-based deep-link routing: `/admin/calculator?value=123`.
- `CommandMenu.vue` — Spotlight-style launcher (replaces legacy StartMenu).
- iOS-style desktop folder grouping with 2x2 mini-grid previews and modal expansion.
- Configurable taskbar positions: `bottom`, `left`, `right`.
- OS settings persisted in `localStorage`.
- **`useNuxtOS()` composable** — agnostic boot API. Decouples the OS shell from any specific app registry, enabling future multi-tenant / RBAC-driven dynamic layouts.
- **`.playground/`** — reference consumer template. Shows how a new product (e.g. an SMS or HRMS) would extend NuxtOS with its own registry and layout.

## Requirements

- **Node.js 20 LTS** (required — Node 22 has a known IPC incompatibility with `@nuxt/vite-builder`).
- Use `.nvmrc` at repo root: run `nvm use` to automatically switch.

## Run

```bash
nvm use          # ensure Node 20
pnpm install
pnpm dev
```

Build check:

```bash
pnpm build
```
