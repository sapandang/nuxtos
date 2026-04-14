<script setup lang="ts">
import type { TaskbarApp, WindowAppId } from '~/types/window'

defineProps<{
  apps: TaskbarApp[]
  currentTime: string
  currentDate: string
}>()

const emit = defineEmits<{
  appClick: [id: WindowAppId]
  toggleStart: []
}>()
</script>

<template>
  <footer class="taskbar" @click.stop>
    <div class="taskbar-center">
      <button class="taskbar-btn start-btn" @click="emit('toggleStart')">
        <span class="icon-[mdi--microsoft-windows]"></span>
      </button>

      <button
        v-for="app in apps"
        :key="app.id"
        class="taskbar-btn app-btn"
        :class="{ active: app.active }"
        :title="app.title"
        @click="emit('appClick', app.id)"
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
</template>
