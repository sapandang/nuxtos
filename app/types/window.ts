export type WindowAppId = string

export type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export interface DesktopWindow {
  id: WindowAppId
  title: string
  subtitle: string
  iconClass: string
  x: number
  y: number
  w: number
  h: number
  minWidth: number
  minHeight: number
  z: number
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  restoreX: number
  restoreY: number
  restoreW: number
  restoreH: number
}

export interface InteractionState {
  mode: 'drag' | 'resize'
  id: WindowAppId
  dir?: ResizeDir
  startPointerX: number
  startPointerY: number
  startX: number
  startY: number
  startW: number
  startH: number
}

export interface TaskbarApp {
  id: WindowAppId
  title: string
  iconClass: string
  running: boolean
  active: boolean
}

export interface DesktopShortcut {
  id: WindowAppId
  title: string
  iconClass: string
}

export interface ResizeHandleDef {
  key: ResizeDir
  className: string
}
