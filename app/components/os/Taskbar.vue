<script setup lang="ts">
import { computed } from 'vue'
import type { TaskbarPosition } from '~/types/os-settings'
import type { TaskbarApp, WindowAppId } from '~/types/window'

const props = defineProps<{
  apps: TaskbarApp[]
  currentTime: string
  currentDate: string
  position: TaskbarPosition
}>()

const emit = defineEmits<{
  appClick: [id: WindowAppId]
  toggleStart: []
}>()

const taskbarClass = computed(() => `pos-${props.position}`)
</script>

<template>
  <footer class="taskbar" :class="taskbarClass" @click.stop>
    <div class="taskbar-center">
      <button class="taskbar-btn start-btn" @click="emit('toggleStart')">
        <span class="icon-[mdi--microsoft-windows]"></span>
      </button>

      <div class="taskbar-apps-scroll">
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
    </div>

    <div class="taskbar-right">
      <p>{{ currentTime }}</p>
      <p>{{ currentDate }}</p>
    </div>
  </footer>
</template>
