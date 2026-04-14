<script setup lang="ts">
import { computed, ref } from 'vue'
import BrowserApp from '~/components/os/apps/BrowserApp.vue'
import DesktopShortcuts from '~/components/os/DesktopShortcuts.vue'
import ExplorerApp from '~/components/os/apps/ExplorerApp.vue'
import SettingsApp from '~/components/os/apps/SettingsApp.vue'
import StartMenu from '~/components/os/StartMenu.vue'
import Taskbar from '~/components/os/Taskbar.vue'
import WindowFrame from '~/components/os/WindowFrame.vue'
import { useOSSettings } from '~/composables/useOSSettings'
import { useWindowManager } from '~/composables/useWindowManager'
import type { OSSettings } from '~/types/os-settings'

const stageRef = ref<HTMLElement | null>(null)
const { settings, updateSetting, resetSettings } = useOSSettings()

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
} = useWindowManager(stageRef, settings)

function onUpdateSetting(key: keyof OSSettings, value: OSSettings[keyof OSSettings]) {
  updateSetting(key, value)
}

const desktopStyle = computed(() => ({
  '--os-taskbar-size': `${settings.value.taskbarHeight}px`,
  '--os-taskbar-gap': `${settings.value.taskbarBottomGap}px`
}))

</script>

<template>
  <div class="win11-desktop" :class="`pos-${settings.taskbarPosition}`" :style="desktopStyle" @pointerdown="onDesktopPointerDown">
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
        <ExplorerApp v-if="windowItem.id === 'explorer'" />
        <BrowserApp v-else-if="windowItem.id === 'browser'" />
        <SettingsApp
          v-else
          :settings="settings"
          @update-setting="onUpdateSetting"
          @reset-settings="resetSettings"
        />
      </WindowFrame>
    </div>

    <StartMenu
      :is-open="startMenuOpen"
      :apps="desktopShortcuts"
      :position="settings.taskbarPosition"
      @open-app="openWindow"
    />

    <Taskbar
      :apps="taskbarApps"
      :current-time="currentTime"
      :current-date="currentDate"
      :position="settings.taskbarPosition"
      @app-click="onTaskbarAppClick"
      @toggle-start="startMenuOpen = !startMenuOpen"
    />
  </div>
</template>
