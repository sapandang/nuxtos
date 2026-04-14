export type TaskbarPosition = 'bottom' | 'left' | 'right'

export interface OSSettings {
  reserveTaskbarSpaceOnMaximize: boolean
  taskbarPosition: TaskbarPosition
  taskbarHeight: number
  taskbarBottomGap: number
  windowMaximizeMargin: number
}

export const DEFAULT_OS_SETTINGS: OSSettings = {
  reserveTaskbarSpaceOnMaximize: true,
  taskbarPosition: 'bottom',
  taskbarHeight: 58,
  taskbarBottomGap: 10,
  windowMaximizeMargin: 10
}

export const OS_SETTINGS_STORAGE_KEY = 'nuxtos:settings:v1'
