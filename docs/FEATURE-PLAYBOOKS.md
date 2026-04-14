# Feature Playbooks

Use these patterns for common enhancements.

## A) Add a new app window

1. Create app module:
   - add `app/application/<new-app-id>/AppRoot.vue`.
2. Register app:
   - add entry in `app/application/registry.ts` with metadata, component, and default window config.
3. Verify shortcut/taskbar entries:
   - they are derived from registry-initialized windows and should appear automatically.
4. Optional boot launch:
   - set `launchOnBoot: true` in registry entry if needed.

## B) Add a new OS setting

1. Add field to `OSSettings` in `app/types/os-settings.ts`.
2. Add default in `DEFAULT_OS_SETTINGS`.
3. Add sanitization/validation in `normalizeSettings` (`useOSSettings.ts`).
4. Consume it where behavior lives:
   - usually `useWindowManager.ts` or shell/layout components.
5. Expose control in `app/application/settings/AppRoot.vue` if intended for users.
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

## F) Add path-based app deep link (example: `/admin/calculator`)

1. Create page route in `app/pages/...` that renders `DesktopShell`.
2. Pass `initial-app-id` to the shell.
3. If query is needed, pass route query as `initial-app-query`.
4. In app module `AppRoot.vue`, read `launchQuery` prop and initialize state.

Example:

- Route: `app/pages/admin/calculator.vue`
- URL: `/admin/calculator?value=123`
- App receives initial value through `launchQuery`.

## G) Keep code modular

- Business logic: composables
- Type contracts: `types/`
- Visual structure: `components/os/*`
- Styling by domain: CSS partials

## H) Definition of done for any feature

1. Behavior works in all taskbar positions.
2. No regression in drag/resize/window lifecycle.
3. Settings (if added) persist and sanitize correctly.
4. `pnpm build` passes.
5. Relevant docs in `docs/` are updated.
