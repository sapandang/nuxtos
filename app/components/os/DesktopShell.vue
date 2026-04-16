<script setup lang="ts">
import { computed, ref, provide } from 'vue'
import { useNuxtOS } from '~/composables/useNuxtOS'
import DesktopShortcuts from '~/components/os/DesktopShortcuts.vue'
import CommandMenu from '~/components/os/CommandMenu.vue'
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

const os = useNuxtOS()
const applicationsById = os.applicationsById

const windowManager = useWindowManager(stageRef, settings, props.initialAppId ?? null)
provide('os-window-manager', windowManager)

const {
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
  resizeHandles
} = windowManager

const desktopStyle = computed(() => ({
  '--os-taskbar-size': `${settings.value.taskbarHeight}px`,
  '--os-taskbar-gap': `${settings.value.taskbarBottomGap}px`
}))

</script>

<template>
  <div class="win11-desktop" :class="`pos-${settings.taskbarPosition}`" :style="desktopStyle" @pointerdown="onDesktopPointerDown">
    <div class="ambient-layer"></div>

    <DesktopShortcuts :shortcuts="desktopShortcuts" @open="openWindow" />

    <div ref="stageRef" id="os-window-stage" class="window-stage">
      <WindowFrame
        v-for="windowItem in openWindows"
        v-show="!windowItem.isMinimized"
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
          :is="applicationsById[windowItem.appId]?.component"
          v-bind="{
            instanceId: windowItem.id,
            params: windowItem.params,
            ...(windowItem.appId === props.initialAppId ? { launchQuery: props.initialAppQuery } : {})
          }"
        />
      </WindowFrame>
    </div>

    <CommandMenu
      :is-open="startMenuOpen"
      :apps="allApps"
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
