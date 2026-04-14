# AI Handoff Guide

This project is a Nuxt 4 + Vue 3 desktop-style OS UI called **NuxtOS**.

## 1) Core architecture

Entry chain:

- `app/pages/index.vue` -> mounts `<DesktopShell />`
- `app/components/os/DesktopShell.vue` -> orchestrates all OS UI surfaces
- `app/composables/useWindowManager.ts` -> window logic and interactions
- `app/composables/useOSSettings.ts` -> global configurable settings + persistence

Types:

- `app/types/window.ts` -> window, interaction, taskbar item, shortcut types
- `app/types/os-settings.ts` -> OS settings schema + defaults

## 2) UI components

Shell-level components:

- `app/components/os/DesktopShortcuts.vue`
- `app/components/os/WindowFrame.vue`
- `app/components/os/StartMenu.vue`
- `app/components/os/Taskbar.vue`

App content components:

- `app/components/os/apps/ExplorerApp.vue`
- `app/components/os/apps/BrowserApp.vue`
- `app/components/os/apps/SettingsApp.vue`

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

### Window state (`useWindowManager`)

Owns:

- list of windows (`windows`)
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
- Desktop shell currently maps app IDs with conditional rendering in `DesktopShell.vue`.
- Settings app is the place where user-facing OS preferences are exposed.

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
- Maximize overlap bugs: check `applyMaximizedBounds` in `useWindowManager`.
- Settings not persisting: check `useOSSettings` watch + storage key.
- Position styling issues: check `taskbar.css` and `start-menu.css` variant classes.
