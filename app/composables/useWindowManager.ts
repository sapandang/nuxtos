import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useNuxtOS } from '~/composables/useNuxtOS'
import type { OSSettings } from '~/types/os-settings'
import type {
  DesktopShortcut,
  DesktopShortcutApp,
  DesktopWindow,
  InteractionState,
  ResizeDir,
  ResizeHandleDef,
  TaskbarApp,
  WindowAppId
} from '~/types/window'

export function useWindowManager(
  stageRef: Ref<HTMLElement | null>,
  osSettings: Ref<OSSettings>,
  initialAppId: WindowAppId | null = null
) {
  const os = useNuxtOS()
  const callbacks = new Map<string, (result: any) => void>()

  const activeWindowId = ref<string | null>(null)

  const windows = ref<DesktopWindow[]>(
    os.registry.value.map((app, index, allApps) => ({
      id: app.id, // Primary instance ID matches appId for boot apps
      appId: app.id,
      title: app.title,
      subtitle: app.subtitle,
      iconClass: app.iconClass,
      x: app.window.x,
      y: app.window.y,
      w: app.window.w,
      h: app.window.h,
      minWidth: app.window.minWidth,
      minHeight: app.window.minHeight,
      z: allApps.length - index,
      isOpen: Boolean(app.launchOnBoot),
      isMinimized: false,
      isMaximized: false,
      restoreX: app.window.x,
      restoreY: app.window.y,
      restoreW: app.window.w,
      restoreH: app.window.h
    }))
  )

  const resizeHandles: ResizeHandleDef[] = [
    { key: 'n', className: 'resize-handle n' },
    { key: 's', className: 'resize-handle s' },
    { key: 'e', className: 'resize-handle e' },
    { key: 'w', className: 'resize-handle w' },
    { key: 'ne', className: 'resize-handle ne' },
    { key: 'nw', className: 'resize-handle nw' },
    { key: 'se', className: 'resize-handle se' },
    { key: 'sw', className: 'resize-handle sw' }
  ]

  const interaction = ref<InteractionState | null>(null)

  const startMenuOpen = ref(false)
  const nextZ = ref(10)

  // Immediately compute an active component based on boot requirement, or update later
  activeWindowId.value = os.registry.value.find((app) => app.launchOnBoot)?.id ?? null

  const now = ref(new Date())
  let clockTimer: ReturnType<typeof setInterval> | null = null

  const taskbarApps = computed<TaskbarApp[]>(() =>
    windows.value
      .filter((windowItem) => {
        const app = os.applicationsById.value[windowItem.appId]
        
        // If explicitly set to false on a dynamic window, hide it completely.
        if (windowItem.showInTaskbar === false) return false

        const isPinned = app?.defaultPinnedToTaskbar !== false
        // For multi-instance, only open windows show in taskbar if they aren't pinned
        return isPinned || windowItem.isOpen
      })
      .map((windowItem) => ({
        id: windowItem.id,
        appId: windowItem.appId,
        title: windowItem.title,
        iconClass: windowItem.iconClass,
        running: windowItem.isOpen,
        active: windowItem.id === activeWindowId.value && windowItem.isOpen && !windowItem.isMinimized
      })) as (TaskbarApp & { appId: string })[]
  )

  const allApps = computed<DesktopShortcutApp[]>(() =>
    os.registry.value.map((app) => ({
      type: 'app',
      id: app.id,
      title: app.title,
      iconClass: app.iconClass
    }))
  )

  const desktopShortcuts = computed<DesktopShortcut[]>(() => {
    return os.layout.value.map((config): DesktopShortcut => {
      if (config.type === 'folder') {
        const populatedChildren = config.children.map(childApp => {
          const w = windows.value.find(win => win.id === childApp.id)
          return {
            type: 'app',
            id: childApp.id,
            title: w?.title || childApp.id,
            iconClass: w?.iconClass || 'icon-[material-symbols--help]'
          } as DesktopShortcutApp
        })
        return {
          type: 'folder',
          id: config.id,
          title: config.title,
          children: populatedChildren
        }
      }
      
      const w = windows.value.find(win => win.id === config.id)
      return {
        type: 'app',
        id: config.id,
        title: w?.title || config.id,
        iconClass: w?.iconClass || 'icon-[material-symbols--help]'
      }
    })
  })

  // Open windows bypasses the minimized check so we don't destroy actual DOM nodes
  const openWindows = computed(() => windows.value.filter((windowItem) => windowItem.isOpen))
  
  const liveWindows = computed(() => windows.value.filter((windowItem) => windowItem.isOpen && !windowItem.isMinimized))

  const currentTime = computed(() =>
    now.value.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    })
  )

  const currentDate = computed(() =>
    now.value.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    })
  )

  function getWindowById(id: string) {
    return windows.value.find((entry) => entry.id === id)
  }

  function getStageSize() {
    const stageElement = stageRef.value

    if (!stageElement) {
      return { width: 0, height: 0 }
    }

    return {
      width: stageElement.clientWidth,
      height: stageElement.clientHeight
    }
  }

  function bringToFront(id: string) {
    const windowItem = getWindowById(id)
    if (!windowItem || !windowItem.isOpen) {
      return
    }

    windowItem.z = nextZ.value
    nextZ.value += 1
    activeWindowId.value = id
  }

  function setFallbackActive(excludedId: string) {
    const fallback = windows.value
      .filter((entry) => entry.isOpen && !entry.isMinimized && entry.id !== excludedId)
      .sort((a, b) => b.z - a.z)[0]

    activeWindowId.value = fallback?.id ?? null
  }

  function clampWindowInStage(windowItem: DesktopWindow) {
    const { width, height } = getStageSize()
    if (!width || !height || windowItem.isMaximized) {
      return
    }

    if (windowItem.w > width) {
      windowItem.w = width
    }

    if (windowItem.h > height) {
      windowItem.h = height
    }

    windowItem.x = Math.min(Math.max(0, windowItem.x), Math.max(0, width - windowItem.w))
    windowItem.y = Math.min(Math.max(0, windowItem.y), Math.max(0, height - windowItem.h))
  }

  function openWindow(appId: WindowAppId, options?: { params?: Record<string, any> }) {
    const app = os.applicationsById.value[appId]
    if (!app) return Promise.resolve(null)

    // Find existing window if multi-instance is not allowed
    let windowItem = windows.value.find(w => w.appId === appId && !app.allowMultiInstance)
    
    if (!windowItem) {
      // Create new instance
      const id = `${appId}-${Math.random().toString(36).substring(2, 9)}`
      windowItem = {
        id,
        appId: app.id,
        title: app.title,
        subtitle: app.subtitle,
        iconClass: app.iconClass,
        params: options?.params,
        x: app.window.x + (Math.random() * 40 - 20), // Offset slightly
        y: app.window.y + (Math.random() * 40 - 20),
        w: app.window.w,
        h: app.window.h,
        minWidth: app.window.minWidth,
        minHeight: app.window.minHeight,
        z: nextZ.value++,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        restoreX: app.window.x,
        restoreY: app.window.y,
        restoreW: app.window.w,
        restoreH: app.window.h
      }
      windows.value.push(windowItem)
    }

    const targetId = windowItem.id

    windowItem.isOpen = true
    windowItem.isMinimized = false

    if (windowItem.isMaximized) {
      applyMaximizedBounds(windowItem)
    } else {
      clampWindowInStage(windowItem)
    }

    bringToFront(targetId)
    startMenuOpen.value = false

    return new Promise((resolve) => {
      callbacks.set(targetId, resolve)
    })
  }

  function closeWindow(id: string) {
    const windowItem = getWindowById(id)
    if (!windowItem) {
      return
    }

    windowItem.isOpen = false
    windowItem.isMinimized = false

    // Clean up callback if it was never resolved
    if (callbacks.has(id)) {
      const resolve = callbacks.get(id)
      resolve?.(null)
      callbacks.delete(id)
    }

    if (activeWindowId.value === id) {
      setFallbackActive(id)
    }
    
    // If it's a dynamic instance (not a boot app), remove it completely
    const app = os.applicationsById.value[windowItem.appId]
    if (app && app.allowMultiInstance) {
       destroyDynamicWindow(id)
    }
  }

  function minimizeWindow(id: string) {
    const windowItem = getWindowById(id)
    if (!windowItem || !windowItem.isOpen) {
      return
    }

    windowItem.isMinimized = true

    if (activeWindowId.value === id) {
      setFallbackActive(id)
    }
  }

  function spawnDynamicWindow(config: { id: string, appId?: string, title?: string, subtitle?: string, w?: number, h?: number, minWidth?: number, minHeight?: number, iconClass?: string, showInTaskbar?: boolean, params?: any }) {
    if (getWindowById(config.id)) return // Already exists
    
    windows.value.push({
      id: config.id,
      appId: config.appId || 'dynamic',
      title: config.title || 'Window',
      subtitle: config.subtitle || '',
      iconClass: config.iconClass || '',
      params: config.params,
      x: 100 + (Math.random() * 50),
      y: 100 + (Math.random() * 50),
      w: config.w || 500,
      h: config.h || 400,
      minWidth: config.minWidth || 300,
      minHeight: config.minHeight || 200,
      z: nextZ.value++,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      restoreX: 100,
      restoreY: 100,
      restoreW: config.w || 500,
      restoreH: config.h || 400,
      showInTaskbar: config.showInTaskbar ?? true
    })
    
    // Automatically focus
    activeWindowId.value = config.id
  }

  function destroyDynamicWindow(id: string) {
    if (activeWindowId.value === id) {
      setFallbackActive(id)
    }
    windows.value = windows.value.filter(w => w.id !== id)
  }

  function applyMaximizedBounds(windowItem: DesktopWindow) {
    const { width, height } = getStageSize()
    if (!width || !height) {
      return
    }

    const margin = osSettings.value.windowMaximizeMargin
    const reservedTaskbarSpace = osSettings.value.reserveTaskbarSpaceOnMaximize
      ? osSettings.value.taskbarHeight + osSettings.value.taskbarBottomGap
      : 0
    const position = osSettings.value.taskbarPosition

    let x = margin
    let y = margin
    let availableWidth = Math.max(0, width - margin * 2)
    let availableHeight = Math.max(0, height - margin * 2)

    if (reservedTaskbarSpace > 0) {
      if (position === 'bottom') {
        availableHeight -= reservedTaskbarSpace
      } else if (position === 'left') {
        x += reservedTaskbarSpace
        availableWidth -= reservedTaskbarSpace
      } else if (position === 'right') {
        availableWidth -= reservedTaskbarSpace
      }
    }

    windowItem.x = x
    windowItem.y = y
    windowItem.w = Math.max(windowItem.minWidth, availableWidth)
    windowItem.h = Math.max(windowItem.minHeight, availableHeight)
  }

  function maximizeWindow(id: string) {
    const windowItem = getWindowById(id)
    if (!windowItem || !windowItem.isOpen) {
      return
    }

    if (windowItem.isMaximized) {
      windowItem.isMaximized = false
      windowItem.x = windowItem.restoreX
      windowItem.y = windowItem.restoreY
      windowItem.w = windowItem.restoreW
      windowItem.h = windowItem.restoreH
      clampWindowInStage(windowItem)
      bringToFront(id)
      return
    }

    windowItem.restoreX = windowItem.x
    windowItem.restoreY = windowItem.y
    windowItem.restoreW = windowItem.w
    windowItem.restoreH = windowItem.h
    windowItem.isMaximized = true

    applyMaximizedBounds(windowItem)
    bringToFront(id)
  }

  function onTaskbarAppClick(id: string) {
    const windowItem = getWindowById(id)
    if (!windowItem) {
      return
    }

    if (!windowItem.isOpen) {
      openWindow(id)
      return
    }

    if (windowItem.isMinimized) {
      windowItem.isMinimized = false
      if (windowItem.isMaximized) {
        applyMaximizedBounds(windowItem)
      }
      bringToFront(id)
      return
    }

    if (activeWindowId.value === id) {
      minimizeWindow(id)
      return
    }

    bringToFront(id)
  }

  function onDesktopPointerDown() {
    startMenuOpen.value = false
  }

  function updateWindowFromInteraction(windowItem: DesktopWindow, currentPointerX: number, currentPointerY: number) {
    const state = interaction.value
    if (!state) {
      return
    }

    const { width: stageWidth, height: stageHeight } = getStageSize()
    if (!stageWidth || !stageHeight) {
      return
    }

    const dx = currentPointerX - state.startPointerX
    const dy = currentPointerY - state.startPointerY

    if (state.mode === 'drag') {
      const nextX = Math.min(Math.max(0, state.startX + dx), Math.max(0, stageWidth - windowItem.w))
      const nextY = Math.min(Math.max(0, state.startY + dy), Math.max(0, stageHeight - windowItem.h))

      windowItem.x = nextX
      windowItem.y = nextY
      return
    }

    let x = state.startX
    let y = state.startY
    let w = state.startW
    let h = state.startH
    const dir = state.dir

    if (!dir) {
      return
    }

    if (dir.includes('e')) {
      w = state.startW + dx
    }

    if (dir.includes('s')) {
      h = state.startH + dy
    }

    if (dir.includes('w')) {
      x = state.startX + dx
      w = state.startW - dx
    }

    if (dir.includes('n')) {
      y = state.startY + dy
      h = state.startH - dy
    }

    if (w < windowItem.minWidth) {
      if (dir.includes('w')) {
        x = state.startX + (state.startW - windowItem.minWidth)
      }
      w = windowItem.minWidth
    }

    if (h < windowItem.minHeight) {
      if (dir.includes('n')) {
        y = state.startY + (state.startH - windowItem.minHeight)
      }
      h = windowItem.minHeight
    }

    if (x < 0) {
      if (dir.includes('w')) {
        w += x
      }
      x = 0
    }

    if (y < 0) {
      if (dir.includes('n')) {
        h += y
      }
      y = 0
    }

    if (x + w > stageWidth) {
      if (dir.includes('e')) {
        w = stageWidth - x
      } else {
        x = stageWidth - w
      }
    }

    if (y + h > stageHeight) {
      if (dir.includes('s')) {
        h = stageHeight - y
      } else {
        y = stageHeight - h
      }
    }

    if (w < windowItem.minWidth) {
      w = windowItem.minWidth
    }

    if (h < windowItem.minHeight) {
      h = windowItem.minHeight
    }

    windowItem.x = Math.max(0, x)
    windowItem.y = Math.max(0, y)
    windowItem.w = w
    windowItem.h = h

    windowItem.restoreX = windowItem.x
    windowItem.restoreY = windowItem.y
    windowItem.restoreW = windowItem.w
    windowItem.restoreH = windowItem.h
  }

  function onGlobalPointerMove(event: PointerEvent) {
    const state = interaction.value
    if (!state) {
      return
    }

    const windowItem = getWindowById(state.id)
    if (!windowItem) {
      interaction.value = null
      return
    }

    event.preventDefault()
    updateWindowFromInteraction(windowItem, event.clientX, event.clientY)
  }

  function onGlobalPointerUp() {
    interaction.value = null
  }

  function startDrag(event: PointerEvent, id: string) {
    if (event.button !== 0) {
      return
    }

    const windowItem = getWindowById(id)
    if (!windowItem || !windowItem.isOpen || windowItem.isMaximized) {
      return
    }

    bringToFront(id)

    interaction.value = {
      mode: 'drag',
      id,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: windowItem.x,
      startY: windowItem.y,
      startW: windowItem.w,
      startH: windowItem.h
    }
  }

  function startResize(event: PointerEvent, id: string, dir: ResizeDir) {
    if (event.button !== 0) {
      return
    }

    const windowItem = getWindowById(id)
    if (!windowItem || !windowItem.isOpen || windowItem.isMaximized) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    bringToFront(id)

    interaction.value = {
      mode: 'resize',
      id,
      dir,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: windowItem.x,
      startY: windowItem.y,
      startW: windowItem.w,
      startH: windowItem.h
    }
  }

  function emitResult(id: string, data: any) {
    const resolve = callbacks.get(id)
    if (resolve) {
      resolve(data)
      callbacks.delete(id)
    }
  }

  function onViewportResize() {
    for (const windowItem of windows.value) {
      if (!windowItem.isOpen || windowItem.isMinimized) {
        continue
      }

      if (windowItem.isMaximized) {
        applyMaximizedBounds(windowItem)
        continue
      }

      clampWindowInStage(windowItem)
    }
  }

  function windowStyle(windowItem: DesktopWindow) {
    return {
      left: `${windowItem.x}px`,
      top: `${windowItem.y}px`,
      width: `${windowItem.w}px`,
      height: `${windowItem.h}px`,
      zIndex: windowItem.z
    }
  }

  onMounted(() => {
    clockTimer = setInterval(() => {
      now.value = new Date()
    }, 1000)

    window.addEventListener('pointermove', onGlobalPointerMove)
    window.addEventListener('pointerup', onGlobalPointerUp)
    window.addEventListener('pointercancel', onGlobalPointerUp)
    window.addEventListener('resize', onViewportResize)

    onViewportResize()

    if (initialAppId) {
      const targetApp = getWindowById(initialAppId)
      if (targetApp) {
        openWindow(initialAppId)
      }
    }
  })

  watch(
    () => [
      osSettings.value.reserveTaskbarSpaceOnMaximize,
      osSettings.value.taskbarPosition,
      osSettings.value.taskbarHeight,
      osSettings.value.taskbarBottomGap,
      osSettings.value.windowMaximizeMargin
    ],
    () => {
      onViewportResize()
    }
  )

  onBeforeUnmount(() => {
    if (clockTimer) {
      clearInterval(clockTimer)
    }

    window.removeEventListener('pointermove', onGlobalPointerMove)
    window.removeEventListener('pointerup', onGlobalPointerUp)
    window.removeEventListener('pointercancel', onGlobalPointerUp)
    window.removeEventListener('resize', onViewportResize)
  })

  return {
    windows,
    activeWindowId,
    allApps,
    currentDate,
    currentTime,
    desktopShortcuts,
    liveWindows,
    openWindows,
    onDesktopPointerDown,
    onTaskbarAppClick,
    openWindow,
    startDrag,
    startMenuOpen,
    startResize,
    taskbarApps,
    windowStyle,
    bringToFront,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    resizeHandles,
    spawnDynamicWindow,
    destroyDynamicWindow,
    emitResult
  }
}
