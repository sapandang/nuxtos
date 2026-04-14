import { computed, shallowRef } from 'vue'
import type { RegisteredApplication } from '~/types/application'
import type { DesktopLayoutItemConfig } from '~/types/window'

// Module-level state — safe to read anywhere, no Nuxt context required
const _registry = shallowRef<RegisteredApplication[]>([])
const _layout = shallowRef<DesktopLayoutItemConfig[]>([])

export function useNuxtOS() {
  const applicationsById = computed(() => {
    return _registry.value.reduce<Record<string, RegisteredApplication>>((acc, app) => {
      acc[app.id] = app
      return acc
    }, {})
  })

  function boot(config: { apps: RegisteredApplication[], desktopLayout: DesktopLayoutItemConfig[] }) {
    _registry.value = config.apps
    _layout.value = config.desktopLayout
  }

  return {
    registry: _registry,
    applicationsById,
    layout: _layout,
    boot
  }
}
