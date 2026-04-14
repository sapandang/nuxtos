# AI Handoff Guide

This project is a Nuxt 4 + Vue 3 desktop-style OS UI called **NuxtOS**.

## 1) Core architecture

Entry chain:

- `app/pages/index.vue` -> mounts `<DesktopShell />`
- `app/pages/admin/calculator.vue` -> example path-based deep link into desktop shell
- `app/components/os/DesktopShell.vue` -> orchestrates all OS UI surfaces
- `app/application/registry.ts` -> consumer app registry (metadata + component mapping)
- `app/application/desktop-layout.ts` -> structural grouping and mapping of apps to the desktop surface
- `app/plugins/os-boot.ts` -> boots the OS on startup by calling `useNuxtOS().boot()`
- `app/composables/useNuxtOS.ts` -> **agnostic OS state API** — the bridge between the Shell and consumer config
- `app/composables/useWindowManager.ts` -> window logic and interactions
- `app/composables/useOSSettings.ts` -> global configurable settings + persistence

Types:

- `app/types/window.ts` -> window, interaction, taskbar item, shortcut types
- `app/types/os-settings.ts` -> OS settings schema + defaults
- `app/types/application.ts` -> app registry contract types

## 2) UI components

Shell-level components:

- `app/components/os/DesktopShortcuts.vue`
- `app/components/os/WindowFrame.vue`
- `app/components/os/CommandMenu.vue` (Replaces StartMenu)
- `app/components/os/Taskbar.vue`

App content components:

- `app/application/explorer/AppRoot.vue`
- `app/application/browser/AppRoot.vue`
- `app/application/settings/AppRoot.vue`
- `app/application/calculator/AppRoot.vue`

## 3) Styling system

Global CSS entry:

- `app/assets/css/main.css`

Partials:

- `partials/base.css`
- `partials/desktop.css`
- `partials/windows.css`
- `partials/start-menu.css`
- `partials/taskbar.css`
- `partials/responsive.css`

Notes:

- Tailwind 4 + Iconify plugin are configured in `main.css`.
- The shell provides CSS variables:
  - `--os-taskbar-size`
  - `--os-taskbar-gap`

## 4) Runtime state ownership

### OS Boot API (`useNuxtOS`)

Owns:

- module-level `shallowRef` for the active app registry and desktop layout
- `boot({ apps, desktopLayout })` function called by `app/plugins/os-boot.ts` on startup
- `applicationsById` computed (keyed lookup for shell components)
- **This is the only place the Shell reads app data from** — it never imports `registry.ts` directly

### Window state (`useWindowManager`)

Owns:

- list of windows (`windows`)
- app-derived window initialization from `useNuxtOS().registry`
- z-index and active window
- open/minimize/maximize/close/focus actions
- drag + resize pointer interaction state
- computed taskbar apps + desktop shortcuts
- clock/date display state

### OS settings (`useOSSettings`)

Owns:

- global preferences such as taskbar position and maximize behavior
- sanitization and clamping of values
- `localStorage` persistence under `nuxtos:settings:v1`

## 5) Important behavior contracts

- Taskbar position supports: `bottom | left | right`.
- Desktop shell can accept route launch context:
  - `initialAppId` (open/focus app on boot)
  - `initialAppQuery` (pass route query into launched app)
- Maximize respects:
  - `reserveTaskbarSpaceOnMaximize`
  - `taskbarPosition`
  - `taskbarHeight`
  - `taskbarBottomGap`
  - `windowMaximizeMargin`
- Start menu anchor must follow taskbar position.
- Window dragging/resizing is custom pointer-based (not from external UI library).

## 6) Known intentional decisions

- `vue-draggable-resizable` package exists in `package.json`, but current UI does not rely on it.
- App registration is registry-driven (`app/application/registry.ts`).
- Desktop visibility and folders are defined exclusively in `app/application/desktop-layout.ts`.
- Settings is implemented as a registered app module (`app/application/settings/AppRoot.vue`).
- The OS Shell (`DesktopShell`, `useWindowManager`) **never imports from `app/application/` directly**. All data flows through `useNuxtOS`.
- `.playground/` is a reference consumer template — not executed by `pnpm dev`.
- **Node.js 20 LTS is required.** Node 22 causes an IPC crash in `@nuxt/vite-builder`. A `.nvmrc` file pins this at the repo root.

## 7) Safety rules for future edits

- Keep logic in composables; keep components presentation-focused.
- Prefer extending `types/` first when changing behavior.
- If adding settings, always:
  1. Update `OSSettings` + defaults.
  2. Normalize in `useOSSettings`.
  3. Apply behavior in `useWindowManager` and/or shell components.
  4. Expose controls in `SettingsApp` if user-configurable.
- Preserve taskbar/start-menu/window behavior parity across all three taskbar positions.

## 8) Validation checklist before finishing a change

1. `pnpm build` succeeds.
2. In app UI, verify:
   - open/minimize/maximize/restore/close
   - drag/resize constraints
   - taskbar interactions
   - start menu open/close and app launch
   - all taskbar positions (`bottom`, `left`, `right`)
   - settings persist after page reload

## 9) Quick debug map

- Windows not visible: check `DesktopShell.vue` wiring and `liveWindows` in `useWindowManager`.
- Route deep link not opening app: check `initialAppId` flow from route page -> `DesktopShell` -> `useWindowManager`.
- Query not reaching app: check `initialAppQuery` wiring and app `launchQuery` prop handling.
- Maximize overlap bugs: check `applyMaximizedBounds` in `useWindowManager`.
- Settings not persisting: check `useOSSettings` watch + storage key.
- Position styling issues: check `taskbar.css` and `start-menu.css` variant classes.
