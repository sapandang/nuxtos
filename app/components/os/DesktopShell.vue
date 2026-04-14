<script setup lang="ts">
import { ref } from 'vue'
import BrowserApp from '~/components/os/apps/BrowserApp.vue'
import DesktopShortcuts from '~/components/os/DesktopShortcuts.vue'
import ExplorerApp from '~/components/os/apps/ExplorerApp.vue'
import SettingsApp from '~/components/os/apps/SettingsApp.vue'
import StartMenu from '~/components/os/StartMenu.vue'
import Taskbar from '~/components/os/Taskbar.vue'
import WindowFrame from '~/components/os/WindowFrame.vue'
import { useWindowManager } from '~/composables/useWindowManager'
import type { WindowAppId } from '~/types/window'

const stageRef = ref<HTMLElement | null>(null)

const {
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
} = useWindowManager(stageRef)

const appComponents: Record<WindowAppId, unknown> = {
  explorer: ExplorerApp,
  browser: BrowserApp,
  settings: SettingsApp
}
</script>

<template>
  <div class="win11-desktop" @pointerdown="onDesktopPointerDown">
    <div class="ambient-layer"></div>

    <DesktopShortcuts :shortcuts="desktopShortcuts" @open="openWindow" />

    <div ref="stageRef" class="window-stage">
      <WindowFrame
        v-for="windowItem in liveWindows"
        :key="windowItem.id"
        :window-item="windowItem"
        :is-active="windowItem.id === activeWindowId"
        :style-value="windowStyle(windowItem)"
        :resize-handles="resizeHandles"
        @focus="bringToFront"
        @start-drag="startDrag"
        @start-resize="startResize"
        @minimize="minimizeWindow"
        @maximize="maximizeWindow"
        @close="closeWindow"
      >
        <component :is="appComponents[windowItem.id]" />
      </WindowFrame>
    </div>

    <StartMenu :is-open="startMenuOpen" :apps="desktopShortcuts" @open-app="openWindow" />

    <Taskbar
      :apps="taskbarApps"
      :current-time="currentTime"
      :current-date="currentDate"
      @app-click="onTaskbarAppClick"
      @toggle-start="startMenuOpen = !startMenuOpen"
    />
  </div>
</template>
