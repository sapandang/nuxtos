<script setup lang="ts">
import { ref } from 'vue'
import type { DesktopShortcut, DesktopShortcutFolder, WindowAppId } from '~/types/window'

defineProps<{
  shortcuts: DesktopShortcut[]
}>()

const emit = defineEmits<{
  open: [id: WindowAppId]
}>()

const openFolder = ref<DesktopShortcutFolder | null>(null)

function handleShortcutClick(shortcut: DesktopShortcut) {
  if (shortcut.type === 'folder') {
    openFolder.value = shortcut
  } else {
    emit('open', shortcut.id)
  }
}

function handleOverlayAppClick(id: WindowAppId) {
  emit('open', id)
  openFolder.value = null
}
</script>

<template>
  <div class="desktop-shortcuts">
    <button
      v-for="shortcut in shortcuts"
      :key="shortcut.id"
      class="desktop-shortcut"
      @click.stop="handleShortcutClick(shortcut)"
    >
      <template v-if="shortcut.type === 'app'">
        <span :class="['desktop-shortcut-icon', shortcut.iconClass]"></span>
      </template>
      <template v-else>
        <div class="desktop-folder-icon-wrapper">
          <div class="folder-mini-grid">
            <span 
              v-for="child in shortcut.children.slice(0, 4)" 
              :key="child.id" 
              :class="['folder-mini-icon', child.iconClass]"
            ></span>
          </div>
        </div>
      </template>
      <span class="desktop-shortcut-label">{{ shortcut.title }}</span>
    </button>
  </div>

  <transition name="folder-fade">
    <div v-if="openFolder" class="folder-overlay" @click="openFolder = null">
      <div class="folder-modal" @click.stop>
        <h3 class="folder-title">{{ openFolder.title }}</h3>
        <div class="folder-app-grid">
          <button
            v-for="app in openFolder.children"
            :key="app.id"
            class="folder-app-btn"
            @click="handleOverlayAppClick(app.id)"
          >
            <span :class="['folder-app-icon', app.iconClass]"></span>
            <span class="folder-app-label">{{ app.title }}</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.desktop-shortcuts {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 10;
}

.desktop-shortcut {
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 5rem;
  cursor: pointer;
  border-radius: 0.25rem;
  padding: 0.25rem;
  transition: background-color 0.15s ease;
}

.desktop-shortcut:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.desktop-shortcut-icon {
  font-size: 3rem;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
}

.desktop-shortcut-label {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  font-size: 0.75rem;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* FOLDER ICON (Grid of 4) */
.desktop-folder-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 20%;
  border: 1px solid rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  margin-bottom: 0.25rem;
}

.folder-mini-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 4px;
  width: 2.2rem;
  height: 2.2rem;
}

.folder-mini-icon {
  font-size: 1rem;
  color: white;
  place-self: center;
}

/* OVERLAY MODAL */
.folder-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-modal {
  width: 24rem;
  max-width: 90vw;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(25px);
  border-radius: 2rem;
  border: 1px solid rgba(255,255,255,0.4);
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (prefers-color-scheme: dark) {
  .folder-modal {
    background: rgba(30, 30, 30, 0.6);
    border: 1px solid rgba(255,255,255,0.1);
  }
}

.folder-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 500;
  color: #1e293b;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  .folder-title {
    color: #f1f5f9;
  }
}

.folder-app-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem 1rem;
}

.folder-app-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.1s ease;
}

.folder-app-btn:hover {
  transform: scale(1.05);
}

.folder-app-icon {
  font-size: 3rem;
  color: #1e293b;
}

@media (prefers-color-scheme: dark) {
  .folder-app-icon {
    color: #e2e8f0;
  }
}

.folder-app-label {
  font-size: 0.8rem;
  color: #334155;
  text-align: center;
  line-height: 1.1;
}

@media (prefers-color-scheme: dark) {
  .folder-app-label {
    color: #cbd5e1;
  }
}

.folder-fade-enter-active,
.folder-fade-leave-active {
  transition: opacity 0.25s ease;
}

.folder-fade-enter-from,
.folder-fade-leave-to {
  opacity: 0;
}

.folder-fade-enter-active .folder-modal {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.folder-fade-leave-active .folder-modal {
  transition: transform 0.2s ease;
}

.folder-fade-enter-from .folder-modal {
  transform: scale(0.9);
}

.folder-fade-leave-to .folder-modal {
  transform: scale(0.95);
}
</style>
