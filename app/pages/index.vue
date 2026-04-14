<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type WindowAppId = 'explorer' | 'browser' | 'settings'
type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

interface DesktopWindow {
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

interface InteractionState {
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

const MAXIMIZED_GAP = 10

const windows = ref<DesktopWindow[]>([
  {
    id: 'explorer',
    title: 'File Explorer',
    subtitle: 'Quick access and folders',
    iconClass: 'icon-[material-symbols--folder-rounded]',
    x: 92,
    y: 66,
    w: 540,
    h: 360,
    minWidth: 360,
    minHeight: 260,
    z: 3,
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    restoreX: 92,
    restoreY: 66,
    restoreW: 540,
    restoreH: 360
  },
  {
    id: 'browser',
    title: 'Edge Browser',
    subtitle: 'Nuxt docs',
    iconClass: 'icon-[mdi--microsoft-edge]',
    x: 220,
    y: 100,
    w: 600,
    h: 380,
    minWidth: 380,
    minHeight: 280,
    z: 2,
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    restoreX: 220,
    restoreY: 100,
    restoreW: 600,
    restoreH: 380
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Personalization',
    iconClass: 'icon-[material-symbols--settings-rounded]',
    x: 158,
    y: 144,
    w: 500,
    h: 340,
    minWidth: 340,
    minHeight: 240,
    z: 1,
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    restoreX: 158,
    restoreY: 144,
    restoreW: 500,
    restoreH: 340
  }
])

const resizeHandles: Array<{ key: ResizeDir; className: string }> = [
  { key: 'n', className: 'resize-handle n' },
  { key: 's', className: 'resize-handle s' },
  { key: 'e', className: 'resize-handle e' },
  { key: 'w', className: 'resize-handle w' },
  { key: 'ne', className: 'resize-handle ne' },
  { key: 'nw', className: 'resize-handle nw' },
  { key: 'se', className: 'resize-handle se' },
  { key: 'sw', className: 'resize-handle sw' }
]

const stageRef = ref<HTMLElement | null>(null)
const interaction = ref<InteractionState | null>(null)

const startMenuOpen = ref(false)
const nextZ = ref(10)
const activeWindowId = ref<WindowAppId | null>('explorer')

const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | null = null

const taskbarApps = computed(() =>
  windows.value.map((windowItem) => ({
    id: windowItem.id,
    title: windowItem.title,
    iconClass: windowItem.iconClass,
    running: windowItem.isOpen,
    active: windowItem.id === activeWindowId.value && windowItem.isOpen && !windowItem.isMinimized
  }))
)

const desktopShortcuts = computed(() =>
  windows.value.map((windowItem) => ({
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

  windowItem.x = MAXIMIZED_GAP
  windowItem.y = MAXIMIZED_GAP
  windowItem.w = Math.max(windowItem.minWidth, width - MAXIMIZED_GAP * 2)
  windowItem.h = Math.max(windowItem.minHeight, height - MAXIMIZED_GAP * 2)
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

function onWindowPointerDown(id: WindowAppId) {
  bringToFront(id)
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
})

onBeforeUnmount(() => {
  if (clockTimer) {
    clearInterval(clockTimer)
  }

  window.removeEventListener('pointermove', onGlobalPointerMove)
  window.removeEventListener('pointerup', onGlobalPointerUp)
  window.removeEventListener('pointercancel', onGlobalPointerUp)
  window.removeEventListener('resize', onViewportResize)
})
</script>

<template>
  <div class="win11-desktop" @pointerdown="onDesktopPointerDown">
    <div class="ambient-layer"></div>

    <div class="desktop-shortcuts">
      <button
        v-for="shortcut in desktopShortcuts"
        :key="shortcut.id"
        class="desktop-shortcut"
        @click.stop="openWindow(shortcut.id)"
      >
        <span :class="['desktop-shortcut-icon', shortcut.iconClass]"></span>
        <span class="desktop-shortcut-label">{{ shortcut.title }}</span>
      </button>
    </div>

    <div ref="stageRef" class="window-stage">
      <article
        v-for="windowItem in liveWindows"
        :key="windowItem.id"
        class="desktop-window window-shell"
        :class="{
          'desktop-window-active': windowItem.id === activeWindowId,
          maximized: windowItem.isMaximized
        }"
        :style="windowStyle(windowItem)"
        @pointerdown.stop="onWindowPointerDown(windowItem.id)"
      >
        <header class="window-titlebar" @pointerdown.stop="startDrag($event, windowItem.id)">
          <div class="window-title-wrap">
            <span :class="['window-icon', windowItem.iconClass]"></span>
            <div>
              <p class="window-title">{{ windowItem.title }}</p>
              <p class="window-subtitle">{{ windowItem.subtitle }}</p>
            </div>
          </div>

          <div class="window-controls" @pointerdown.stop>
            <button class="window-control" @click.stop="minimizeWindow(windowItem.id)">
              <span class="icon-[mdi--window-minimize]"></span>
            </button>
            <button class="window-control" @click.stop="maximizeWindow(windowItem.id)">
              <span :class="windowItem.isMaximized ? 'icon-[mdi--window-restore]' : 'icon-[mdi--window-maximize]'"></span>
            </button>
            <button class="window-control close" @click.stop="closeWindow(windowItem.id)">
              <span class="icon-[mdi--close]"></span>
            </button>
          </div>
        </header>

        <section class="window-content">
          <template v-if="windowItem.id === 'explorer'">
            <div class="content-card-grid">
              <article class="content-card">
                <span class="icon-[material-symbols--description-outline-rounded]"></span>
                <div>
                  <h3>Project Notes</h3>
                  <p>NuxtOS launch checklist and app ideas.</p>
                </div>
              </article>
              <article class="content-card">
                <span class="icon-[material-symbols--folder-zip-outline-rounded]"></span>
                <div>
                  <h3>Assets</h3>
                  <p>Wallpapers, icons and sound packs.</p>
                </div>
              </article>
              <article class="content-card">
                <span class="icon-[material-symbols--code-rounded]"></span>
                <div>
                  <h3>Source</h3>
                  <p>Nuxt pages and OS components.</p>
                </div>
              </article>
            </div>
          </template>

          <template v-else-if="windowItem.id === 'browser'">
            <div class="browser-shell">
              <div class="browser-bar">
                <span class="icon-[mdi--lock-outline]"></span>
                <p>https://nuxt.com/docs</p>
              </div>
              <div class="browser-page">
                <h3>NuxtOS Development Hub</h3>
                <p>Use this area as your browser canvas for docs, notes, or embedded apps.</p>
                <button class="primary-action">Open Workspace</button>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="settings-grid">
              <article class="settings-tile">
                <h3>Personalization</h3>
                <p>Theme, lock screen and visual effects.</p>
              </article>
              <article class="settings-tile">
                <h3>System</h3>
                <p>Notifications, display and battery options.</p>
              </article>
              <article class="settings-tile">
                <h3>Accounts</h3>
                <p>Profile, sign-in and sync preferences.</p>
              </article>
            </div>
          </template>
        </section>

        <template v-if="!windowItem.isMaximized">
          <button
            v-for="handle in resizeHandles"
            :key="`${windowItem.id}-${handle.key}`"
            :class="handle.className"
            :aria-label="`Resize ${handle.key}`"
            @pointerdown="startResize($event, windowItem.id, handle.key)"
          ></button>
        </template>
      </article>
    </div>

    <transition name="start-menu-fade">
      <div v-if="startMenuOpen" class="start-menu" @click.stop>
        <header class="start-header">
          <h2>Pinned</h2>
          <button>All apps</button>
        </header>

        <div class="start-app-grid">
          <button
            v-for="app in desktopShortcuts"
            :key="app.id"
            class="start-app"
            @click="openWindow(app.id)"
          >
            <span :class="['start-app-icon', app.iconClass]"></span>
            <span>{{ app.title }}</span>
          </button>
        </div>
      </div>
    </transition>

    <footer class="taskbar" @click.stop>
      <div class="taskbar-center">
        <button class="taskbar-btn start-btn" @click="startMenuOpen = !startMenuOpen">
          <span class="icon-[mdi--microsoft-windows]"></span>
        </button>

        <button
          v-for="app in taskbarApps"
          :key="app.id"
          class="taskbar-btn app-btn"
          :class="{ active: app.active }"
          :title="app.title"
          @click="onTaskbarAppClick(app.id)"
        >
          <span :class="['taskbar-icon', app.iconClass]"></span>
          <span v-if="app.running" class="running-dot"></span>
        </button>
      </div>

      <div class="taskbar-right">
        <p>{{ currentTime }}</p>
        <p>{{ currentDate }}</p>
      </div>
    </footer>
  </div>
</template>
