<script setup lang="ts">
import { provide } from 'vue'
import type { DesktopWindow, ResizeDir, ResizeHandleDef } from '~/types/window'

const props = defineProps<{
  windowItem: DesktopWindow
  isActive: boolean
  styleValue: Record<string, string | number>
  resizeHandles: ResizeHandleDef[]
}>()

provide('parent-window', props.windowItem)

const emit = defineEmits<{
  focus: [id: DesktopWindow['id']]
  startDrag: [event: PointerEvent, id: DesktopWindow['id']]
  startResize: [event: PointerEvent, id: DesktopWindow['id'], dir: ResizeDir]
  minimize: [id: DesktopWindow['id']]
  maximize: [id: DesktopWindow['id']]
  close: [id: DesktopWindow['id']]
}>()
</script>

<template>
  <article
    class="desktop-window window-shell"
    :class="{
      'desktop-window-active': isActive,
      maximized: windowItem.isMaximized
    }"
    :style="styleValue"
    @pointerdown.stop="emit('focus', windowItem.id)"
  >
    <header class="window-titlebar" @pointerdown.stop="emit('startDrag', $event, windowItem.id)">
      <div class="window-title-wrap">
        <span :class="['window-icon', windowItem.iconClass]"></span>
        <div>
          <p class="window-title">{{ windowItem.title }}</p>
          <p class="window-subtitle">{{ windowItem.subtitle }}</p>
        </div>
      </div>

      <div class="window-controls" @pointerdown.stop>
        <button class="window-control" @click.stop="emit('minimize', windowItem.id)">
          <span class="icon-[mdi--window-minimize]"></span>
        </button>
        <button class="window-control" @click.stop="emit('maximize', windowItem.id)">
          <span :class="windowItem.isMaximized ? 'icon-[mdi--window-restore]' : 'icon-[mdi--window-maximize]'" />
        </button>
        <button class="window-control close" @click.stop="emit('close', windowItem.id)">
          <span class="icon-[mdi--close]"></span>
        </button>
      </div>
    </header>

    <section class="window-content">
      <slot />
    </section>

    <template v-if="!windowItem.isMaximized">
      <button
        v-for="handle in resizeHandles"
        :key="`${windowItem.id}-${handle.key}`"
        :class="handle.className"
        :aria-label="`Resize ${handle.key}`"
        @pointerdown="emit('startResize', $event, windowItem.id, handle.key)"
      ></button>
    </template>
  </article>
</template>
