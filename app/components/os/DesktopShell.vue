<script setup lang="ts">
import { computed, ref } from 'vue'
import { applicationsById } from '~/application/registry'
import DesktopShortcuts from '~/components/os/DesktopShortcuts.vue'
import StartMenu from '~/components/os/StartMenu.vue'
import Taskbar from '~/components/os/Taskbar.vue'
import WindowFrame from '~/components/os/WindowFrame.vue'
import { useOSSettings } from '~/composables/useOSSettings'
import { useWindowManager } from '~/composables/useWindowManager'
import type { LocationQuery } from 'vue-router'
import type { WindowAppId } from '~/types/window'

const props = defineProps<{
  initialAppId?: WindowAppId
  initialAppQuery?: LocationQuery
}>()

const stageRef = ref<HTMLElement | null>(null)
const { settings } = useOSSettings()

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
} = useWindowManager(stageRef, settings, props.initialAppId ?? null)

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
        <component
          :is="applicationsById[windowItem.id]?.component"
          v-bind="windowItem.id === (props.initialAppId ?? '') ? { launchQuery: props.initialAppQuery } : {}"
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
