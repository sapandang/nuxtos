<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DesktopShortcutApp, WindowAppId } from '~/types/window'

const props = defineProps<{
  isOpen: boolean
  apps: DesktopShortcutApp[]
}>()

const emit = defineEmits<{
  openApp: [id: WindowAppId]
}>()

const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

watch(() => props.isOpen, (open) => {
  if (open) {
    searchQuery.value = ''
    setTimeout(() => searchInput.value?.focus(), 100)
  }
})

const filteredApps = computed(() => {
  if (!searchQuery.value.trim()) return props.apps
  const q = searchQuery.value.toLowerCase()
  return props.apps.filter(app => app.title.toLowerCase().includes(q))
})

function handleAppClick(id: WindowAppId) {
  emit('openApp', id)
}
</script>

<template>
  <transition name="command-menu-fade">
    <div v-if="isOpen" class="command-overlay" @click.stop>
      <div class="command-container">
        <div class="command-search-bar">
          <span class="icon-[material-symbols--search-rounded] search-icon"></span>
          <input 
            v-model="searchQuery" 
            ref="searchInput"
            type="text" 
            placeholder="Search applications..." 
            class="search-input"
            autofocus
          />
        </div>
        <div class="command-app-grid">
          <button
            v-for="app in filteredApps"
            :key="app.id"
            class="command-app-btn"
            @click="handleAppClick(app.id)"
          >
            <div class="command-app-icon-wrapper">
              <span :class="['command-app-icon', app.iconClass]"></span>
            </div>
            <span class="command-app-title">{{ app.title }}</span>
          </button>
          
          <div v-if="filteredApps.length === 0" class="no-results">
            No applications found
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.command-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  padding: 1rem;
}

.command-container {
  width: 100%;
  max-width: 640px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (prefers-color-scheme: dark) {
  .command-container {
    background: rgba(30, 30, 30, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.command-search-bar {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
  .command-search-bar {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.search-icon {
  font-size: 1.5rem;
  color: #64748b;
  margin-right: 1rem;
}

@media (prefers-color-scheme: dark) {
  .search-icon {
    color: #94a3b8;
  }
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  outline: none;
  color: #0f172a;
}

@media (prefers-color-scheme: dark) {
  .search-input {
    color: #f8fafc;
  }
}

.search-input::placeholder {
  color: #94a3b8;
}

@media (prefers-color-scheme: dark) {
  .search-input::placeholder {
    color: #64748b;
  }
}

.command-app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  max-height: 50vh;
  overflow-y: auto;
}

.command-app-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 0.5rem;
  border-radius: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.command-app-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

@media (prefers-color-scheme: dark) {
  .command-app-btn:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.command-app-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20%;
  background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2));
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

@media (prefers-color-scheme: dark) {
  .command-app-icon-wrapper {
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
  }
}

.command-app-icon {
  font-size: 2rem;
  color: #0f172a;
}

@media (prefers-color-scheme: dark) {
  .command-app-icon {
    color: #f8fafc;
  }
}

.command-app-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .command-app-title {
    color: #cbd5e1;
  }
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 1rem;
}

.command-menu-fade-enter-active,
.command-menu-fade-leave-active {
  transition: opacity 0.2s ease;
}

.command-menu-fade-enter-from,
.command-menu-fade-leave-to {
  opacity: 0;
}

.command-menu-fade-enter-active .command-container {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.command-menu-fade-leave-active .command-container {
  transition: transform 0.2s ease;
}

.command-menu-fade-enter-from .command-container {
  transform: scale(0.95) translateY(10px);
}

.command-menu-fade-leave-to .command-container {
  transform: scale(0.95);
}
</style>
