<script setup lang="ts">
import type { OSSettings } from '~/types/os-settings'

defineProps<{
  settings: OSSettings
}>()

const emit = defineEmits<{
  updateSetting: [key: keyof OSSettings, value: OSSettings[keyof OSSettings]]
  resetSettings: []
}>()

function onToggleReserve(value: boolean) {
  emit('update-setting', 'reserveTaskbarSpaceOnMaximize', value)
}

function onTaskbarHeight(value: string) {
  emit('update-setting', 'taskbarHeight', Number.parseInt(value, 10) || 0)
}

function onTaskbarPosition(value: string) {
  if (value === 'bottom' || value === 'left' || value === 'right') {
    emit('update-setting', 'taskbarPosition', value)
  }
}

function onTaskbarBottomGap(value: string) {
  emit('update-setting', 'taskbarBottomGap', Number.parseInt(value, 10) || 0)
}

function onWindowMargin(value: string) {
  emit('update-setting', 'windowMaximizeMargin', Number.parseInt(value, 10) || 0)
}
</script>

<template>
  <div class="settings-grid">
    <article class="settings-tile settings-panel">
      <h3>Window Behavior</h3>
      <p>Control maximize area and taskbar reservation.</p>

      <label class="settings-switch-row">
        <span>Reserve taskbar space on maximize</span>
        <input
          type="checkbox"
          :checked="settings.reserveTaskbarSpaceOnMaximize"
          @change="onToggleReserve(($event.target as HTMLInputElement).checked)"
        >
      </label>

      <label class="settings-field-row">
        <span>Taskbar Position</span>
        <select :value="settings.taskbarPosition" @change="onTaskbarPosition(($event.target as HTMLSelectElement).value)">
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </label>

      <label class="settings-field-row">
        <span>Taskbar Height (px)</span>
        <input
          type="number"
          min="36"
          :value="settings.taskbarHeight"
          @change="onTaskbarHeight(($event.target as HTMLInputElement).value)"
        >
      </label>

      <label class="settings-field-row">
        <span>Taskbar Edge Gap (px)</span>
        <input
          type="number"
          min="0"
          :value="settings.taskbarBottomGap"
          @change="onTaskbarBottomGap(($event.target as HTMLInputElement).value)"
        >
      </label>

      <label class="settings-field-row">
        <span>Maximized Window Margin (px)</span>
        <input
          type="number"
          min="0"
          :value="settings.windowMaximizeMargin"
          @change="onWindowMargin(($event.target as HTMLInputElement).value)"
        >
      </label>

      <button class="settings-reset" @click="emit('reset-settings')">
        Reset to Defaults
      </button>
    </article>

    <article class="settings-tile">
      <h3>Personalization</h3>
      <p>Theme, lock screen and visual effects.</p>
    </article>
    <article class="settings-tile">
      <h3>System</h3>
      <p>Notifications, display and battery options.</p>
    </article>
  </div>
</template>
