export type WindowAppId = string

export type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export interface DesktopWindow {
  id: string // Unique Instance ID (UUID)
  appId: WindowAppId // Reference to Registry ID
  title: string
  subtitle: string
  iconClass: string
  params?: Record<string, any> // Launch parameters
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
  showInTaskbar?: boolean
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

export interface DesktopShortcutApp {
  type: 'app'
  id: WindowAppId
  title: string
  iconClass: string
}

export interface DesktopShortcutFolder {
  type: 'folder'
  id: string
  title: string
  children: DesktopShortcutApp[]
}

export type DesktopShortcut = DesktopShortcutApp | DesktopShortcutFolder

export type DesktopLayoutItemConfig = 
  | { type: 'app', id: WindowAppId }
  | { type: 'folder', id: string, title: string, children: { type: 'app', id: WindowAppId }[] }

export interface ResizeHandleDef {
  key: ResizeDir
  className: string
}
