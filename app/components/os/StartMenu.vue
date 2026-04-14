<script setup lang="ts">
import type { DesktopShortcut, WindowAppId } from '~/types/window'

defineProps<{
  isOpen: boolean
  apps: DesktopShortcut[]
}>()

const emit = defineEmits<{
  openApp: [id: WindowAppId]
}>()
</script>

<template>
  <transition name="start-menu-fade">
    <div v-if="isOpen" class="start-menu" @click.stop>
      <header class="start-header">
        <h2>Pinned</h2>
        <button>All apps</button>
      </header>

      <div class="start-app-grid">
        <button
          v-for="app in apps"
          :key="app.id"
          class="start-app"
          @click="emit('openApp', app.id)"
        >
          <span :class="['start-app-icon', app.iconClass]"></span>
          <span>{{ app.title }}</span>
        </button>
      </div>
    </div>
  </transition>
</template>
