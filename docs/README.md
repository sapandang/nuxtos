# NuxtOS Docs

This folder is the working documentation for the NuxtOS prototype.

If you are an AI model or a new developer, start here:

1. `docs/AI-HANDOFF.md` - fast onboarding, architecture map, and guardrails.
2. `docs/FEATURE-PLAYBOOKS.md` - step-by-step instructions for common changes.

## Current status (April 2026)

- Custom window manager implemented in Vue (no UI dependency on `vue-draggable-resizable`).
- App registry system added at `app/application/registry.ts`.
- App modules live in `app/application/<app-id>/AppRoot.vue`.
- Calculator app added as a registry-driven sample app.
- Path-based deep-link example added: `/admin/calculator`.
- Query passthrough example added: `/admin/calculator?value=123`.
- Configurable taskbar positions: `bottom`, `left`, `right`.
- Maximize bounds respect OS settings (taskbar reservation + margins).
- OS settings are persisted in `localStorage`.

## Run

```bash
pnpm dev
```

Build check:

```bash
pnpm build
```
