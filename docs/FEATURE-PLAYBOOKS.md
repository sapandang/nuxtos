# Feature Playbooks

Use these patterns for common enhancements.

## A) Add a new app window

1. Extend app ID type:
   - update `WindowAppId` in `app/types/window.ts`.
2. Add window seed data:
   - add object in `windows` array in `app/composables/useWindowManager.ts`.
3. Create app component:
   - add `app/components/os/apps/<NewApp>.vue`.
4. Render in shell:
   - update conditional render block in `app/components/os/DesktopShell.vue`.
5. Verify shortcut/taskbar entries:
   - they are derived from `windows`, so they appear automatically.

## B) Add a new OS setting

1. Add field to `OSSettings` in `app/types/os-settings.ts`.
2. Add default in `DEFAULT_OS_SETTINGS`.
3. Add sanitization/validation in `normalizeSettings` (`useOSSettings.ts`).
4. Consume it where behavior lives:
   - usually `useWindowManager.ts` or shell/layout components.
5. Expose control in `SettingsApp.vue` if intended for users.
6. Confirm persistence after reload.

## C) Modify maximize behavior

Primary function:

- `applyMaximizedBounds(windowItem)` in `app/composables/useWindowManager.ts`

Guidelines:

- Keep all taskbar positions working.
- Keep margins and reserved space math in one place.
- Ensure changes are triggered by settings and viewport resize.

## D) Add a new taskbar mode or dock behavior

1. Extend `TaskbarPosition` in `app/types/os-settings.ts`.
2. Update normalization in `useOSSettings.ts`.
3. Update maximize math in `useWindowManager.ts`.
4. Add new class variants in:
   - `app/assets/css/partials/taskbar.css`
   - `app/assets/css/partials/start-menu.css`
   - optional updates in `desktop.css` / `responsive.css`
5. Add option in `SettingsApp.vue`.

## E) Add keyboard shortcuts

Best location:

- `useWindowManager.ts` (single state owner)

Suggested approach:

- add global keydown listeners in `onMounted` and cleanup in `onBeforeUnmount`
- route shortcut actions to existing functions (`maximizeWindow`, `minimizeWindow`, etc.)

## F) Keep code modular

- Business logic: composables
- Type contracts: `types/`
- Visual structure: `components/os/*`
- Styling by domain: CSS partials

## G) Definition of done for any feature

1. Behavior works in all taskbar positions.
2. No regression in drag/resize/window lifecycle.
3. Settings (if added) persist and sanitize correctly.
4. `pnpm build` passes.
5. Relevant docs in `docs/` are updated.
