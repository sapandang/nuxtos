<script setup lang="ts">
import type { DesktopShortcut, WindowAppId } from '~/types/window'

defineProps<{
  shortcuts: DesktopShortcut[]
}>()

const emit = defineEmits<{
  open: [id: WindowAppId]
}>()
</script>

<template>
  <div class="desktop-shortcuts">
    <button
      v-for="shortcut in shortcuts"
      :key="shortcut.id"
      class="desktop-shortcut"
      @click.stop="emit('open', shortcut.id)"
    >
      <span :class="['desktop-shortcut-icon', shortcut.iconClass]"></span>
      <span class="desktop-shortcut-label">{{ shortcut.title }}</span>
    </button>
  </div>
</template>
