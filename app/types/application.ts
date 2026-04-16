import type { Component } from 'vue'
import type { WindowAppId } from '~/types/window'

export interface ApplicationWindowDefaults {
  x: number
  y: number
  w: number
  h: number
  minWidth: number
  minHeight: number
}

export interface RegisteredApplication {
  id: WindowAppId
  title: string
  subtitle: string
  iconClass: string
  component: Component
  window: ApplicationWindowDefaults
  launchOnBoot?: boolean
  defaultPinnedToTaskbar?: boolean
  allowMultiInstance?: boolean
}
