import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { applicationsRegistry } from '~/application/registry'
import type { OSSettings } from '~/types/os-settings'
import type {
  DesktopShortcut,
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
  const windows = ref<DesktopWindow[]>(
    applicationsRegistry.map((app, index, allApps) => ({
      id: app.id,
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
  const activeWindowId = ref<WindowAppId | null>(applicationsRegistry.find((app) => app.launchOnBoot)?.id ?? null)

  const now = ref(new Date())
  let clockTimer: ReturnType<typeof setInterval> | null = null

  const taskbarApps = computed<TaskbarApp[]>(() =>
    windows.value
      .filter((windowItem) => {
        const app = applicationsRegistry.find((a) => a.id === windowItem.id)
        const isPinned = app?.defaultPinnedToTaskbar !== false
        return isPinned || windowItem.isOpen
      })
      .map((windowItem) => ({
        id: windowItem.id,
        title: windowItem.title,
        iconClass: windowItem.iconClass,
        running: windowItem.isOpen,
        active: windowItem.id === activeWindowId.value && windowItem.isOpen && !windowItem.isMinimized
      }))
  )

  const desktopShortcuts = computed<DesktopShortcut[]>(() =>
    windows.value
      .filter((windowItem) => {
        const app = applicationsRegistry.find((a) => a.id === windowItem.id)
        return app?.defaultShowInDesktop !== false
      })
      .map((windowItem) => ({
        id: windowItem.id,
        title: windowItem.title,
        iconClass: windowItem.iconClass
      }))
  )

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

  function getWindowById(id: WindowAppId) {
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

  function bringToFront(id: WindowAppId) {
    const windowItem = getWindowById(id)
    if (!windowItem || !windowItem.isOpen) {
      return
    }

    windowItem.z = nextZ.value
    nextZ.value += 1
    activeWindowId.value = id
  }

  function setFallbackActive(excludedId: WindowAppId) {
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

  function openWindow(id: WindowAppId) {
    const windowItem = getWindowById(id)
    if (!windowItem) {
      return
    }

    windowItem.isOpen = true
    windowItem.isMinimized = false

    if (windowItem.isMaximized) {
      applyMaximizedBounds(windowItem)
    } else {
      clampWindowInStage(windowItem)
    }

    bringToFront(id)
    startMenuOpen.value = false
  }

  function closeWindow(id: WindowAppId) {
    const windowItem = getWindowById(id)
    if (!windowItem) {
      return
    }

    windowItem.isOpen = false
    windowItem.isMinimized = false

    if (activeWindowId.value === id) {
      setFallbackActive(id)
    }
  }

  function minimizeWindow(id: WindowAppId) {
    const windowItem = getWindowById(id)
    if (!windowItem || !windowItem.isOpen) {
      return
    }

    windowItem.isMinimized = true

    if (activeWindowId.value === id) {
      setFallbackActive(id)
    }
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

  function maximizeWindow(id: WindowAppId) {
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

  function onTaskbarAppClick(id: WindowAppId) {
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

  function startDrag(event: PointerEvent, id: WindowAppId) {
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

  function startResize(event: PointerEvent, id: WindowAppId, dir: ResizeDir) {
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
    activeWindowId,
    currentDate,
    currentTime,
    desktopShortcuts,
    liveWindows,
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
    resizeHandles
  }
}
