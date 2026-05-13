# Feature Playbooks

Use these patterns for common enhancements.

## A) Add a new app window

1. Create app module:
   - add `app/application/<new-app-id>/AppRoot.vue`.
2. Register app:
   - add entry in `app/application/registry.ts` with metadata, component, and default window config.
   - **wrap the component in `markRaw()`** (e.g. `component: markRaw(MyAppRoot)`) to prevent Vue from deep-proxying the component tree during SSR.
3. Add to Desktop (Optional):
   - add entry in `app/application/desktop-layout.ts` (either standalone or inside a folder grouping).
4. Optional boot launch:
   - set `launchOnBoot: true` in registry entry if needed.

## B) Boot the OS with a dynamic registry (RBAC / multi-tenant)

The OS shell is fully decoupled from the registry file. The `useNuxtOS().boot()` function is the only way to inject apps into the shell — you can call it with any data source.

Pattern in a consumer plugin (e.g., after a login API call):

```typescript
// app/plugins/os-boot.ts (consumer side)
export default defineNuxtPlugin({
  name: 'myapp:boot',
  enforce: 'pre',
  async setup() {
    const userData = await myBackend.login()
    const permittedApps = await myBackend.fetchPermittedApps(userData.role)
    const layout = await myBackend.fetchDesktopLayout(userData.role)

    const os = useNuxtOS()
    os.boot({
      apps: permittedApps.map(a => ({ ...a, component: markRaw(a.component) })),
      desktopLayout: layout
    })
  }
})
```

This powers RBAC: only apps returned by the backend are registered. The Shell will never render or surface an unauthorized app.

## C) Add a new OS setting

1. Add field to `OSSettings` in `app/types/os-settings.ts`.
2. Add default in `DEFAULT_OS_SETTINGS`.
3. Add sanitization/validation in `normalizeSettings` (`useOSSettings.ts`).
4. Consume it where behavior lives:
   - usually `useWindowManager.ts` or shell/layout components.
5. Expose control in `app/application/settings/AppRoot.vue` if intended for users.
6. Confirm persistence after reload.

## D) Modify maximize behavior

Primary function:

- `applyMaximizedBounds(windowItem)` in `app/composables/useWindowManager.ts`

Guidelines:

- Keep all taskbar positions working.
- Keep margins and reserved space math in one place.
- Ensure changes are triggered by settings and viewport resize.

## E) Add a new taskbar mode or dock behavior

1. Extend `TaskbarPosition` in `app/types/os-settings.ts`.
2. Update normalization in `useOSSettings.ts`.
3. Update maximize math in `useWindowManager.ts`.
4. Add new class variants in:
   - `app/assets/css/partials/taskbar.css`
   - `app/assets/css/partials/start-menu.css`
   - optional updates in `desktop.css` / `responsive.css`
5. Add option in `SettingsApp.vue`.

## F) Add keyboard shortcuts

Best location:

- `useWindowManager.ts` (single state owner)

Suggested approach:

- add global keydown listeners in `onMounted` and cleanup in `onBeforeUnmount`
- route shortcut actions to existing functions (`maximizeWindow`, `minimizeWindow`, etc.)

## G) Add path-based app deep link (example: `/admin/calculator`)

1. Create page route in `app/pages/...` that renders `DesktopShell`.
2. Pass `initial-app-id` to the shell.
3. If query is needed, pass route query as `initial-app-query`.
4. In app module `AppRoot.vue`, read `launchQuery` prop and initialize state.

Example:

- Route: `app/pages/admin/calculator.vue`
- URL: `/admin/calculator?value=123`
- App receives initial value through `launchQuery`.

## H) Keep code modular

- Business logic: composables
- Type contracts: `types/`
- Visual structure: `components/os/*`
- Styling by domain: CSS partials

## I) Definition of done for any feature

1. Behavior works in all taskbar positions.
2. No regression in drag/resize/window lifecycle.
3. Settings (if added) persist and sanitize correctly.
4. `pnpm build` passes (run with **Node 20 LTS** — see `.nvmrc`).
5. Relevant docs in `docs/` are updated.
