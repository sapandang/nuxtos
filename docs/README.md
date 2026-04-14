# NuxtOS Docs

This folder is the working documentation for the NuxtOS prototype.

If you are an AI model or a new developer, start here:

1. `docs/AI-HANDOFF.md` - fast onboarding, architecture map, and guardrails.
2. `docs/FEATURE-PLAYBOOKS.md` - step-by-step instructions for common changes.

## Current status (April 2026)

- Custom window manager implemented in Vue (no UI dependency on `vue-draggable-resizable`).
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
