import { onMounted, watch } from 'vue'
import type { OSSettings, TaskbarPosition } from '~/types/os-settings'
import { DEFAULT_OS_SETTINGS, OS_SETTINGS_STORAGE_KEY } from '~/types/os-settings'

function clampNumber(value: unknown, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  return value
}

function normalizeSettings(input: Partial<OSSettings> | null | undefined): OSSettings {
  const taskbarPosition = input?.taskbarPosition
  const safeTaskbarPosition: TaskbarPosition =
    taskbarPosition === 'left' || taskbarPosition === 'right' || taskbarPosition === 'bottom'
      ? taskbarPosition
      : DEFAULT_OS_SETTINGS.taskbarPosition

  return {
    reserveTaskbarSpaceOnMaximize:
      typeof input?.reserveTaskbarSpaceOnMaximize === 'boolean'
        ? input.reserveTaskbarSpaceOnMaximize
        : DEFAULT_OS_SETTINGS.reserveTaskbarSpaceOnMaximize,
    taskbarPosition: safeTaskbarPosition,
    taskbarHeight: Math.max(36, clampNumber(input?.taskbarHeight, DEFAULT_OS_SETTINGS.taskbarHeight)),
    taskbarBottomGap: Math.max(0, clampNumber(input?.taskbarBottomGap, DEFAULT_OS_SETTINGS.taskbarBottomGap)),
    windowMaximizeMargin: Math.max(0, clampNumber(input?.windowMaximizeMargin, DEFAULT_OS_SETTINGS.windowMaximizeMargin))
  }
}

export function useOSSettings() {
  const settings = useState<OSSettings>('os-settings', () => ({ ...DEFAULT_OS_SETTINGS }))
  const initialized = useState<boolean>('os-settings-initialized', () => false)

  if (import.meta.client && !initialized.value) {
    initialized.value = true

    onMounted(() => {
      const raw = localStorage.getItem(OS_SETTINGS_STORAGE_KEY)
      if (!raw) {
        settings.value = normalizeSettings(settings.value)
        return
      }

      try {
        const parsed = JSON.parse(raw) as Partial<OSSettings>
        settings.value = normalizeSettings(parsed)
      } catch {
        settings.value = normalizeSettings(settings.value)
      }
    })

    watch(
      settings,
      (value) => {
        localStorage.setItem(OS_SETTINGS_STORAGE_KEY, JSON.stringify(normalizeSettings(value)))
      },
      { deep: true }
    )
  }

  function updateSetting<K extends keyof OSSettings>(key: K, value: OSSettings[K]) {
    settings.value = normalizeSettings({
      ...settings.value,
      [key]: value
    })
  }

  function resetSettings() {
    settings.value = { ...DEFAULT_OS_SETTINGS }
  }

  return {
    settings,
    updateSetting,
    resetSettings
  }
}
