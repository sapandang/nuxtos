<script setup lang="ts">
import { ref, inject } from 'vue'

const props = defineProps<{
  instanceId: string
  params?: {
    // Standard primitive parameter passing
    initialColor?: string
    // Complex parameter passing (Functions for continuous streams!)
    onPreview?: (color: string) => void
  }
}>()

const windowManager = inject<any>('os-window-manager')

const colors = [
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Green', class: 'bg-green-500' },
  { name: 'Amber', class: 'bg-amber-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Slate', class: 'bg-slate-500' }
]

const selected = ref(props.params?.initialColor || '')

function pick(color: string) {
  selected.value = color
  
  // ---------------------------------------------------------
  // PATTERN 1: The "Final Promise" Resolver.
  // This finishes the `await os.openWindow()` call in the parent
  // and completely un-registers the callback listener.
  // ---------------------------------------------------------
  windowManager.emitResult(props.instanceId, color)
}

function preview(color: string) {
  // ---------------------------------------------------------
  // PATTERN 2: The "Continuous Stream" Callback.
  // By executing a function passed through `params`, we can
  // send unlimited real-time events to the parent App WITHOUT
  // resolving or destroying the final Promise!
  // ---------------------------------------------------------
  if (props.params?.onPreview) {
    props.params.onPreview(color)
  }
}

function close() {
  windowManager.closeWindow(props.instanceId)
}
</script>

<template>
  <div class="h-full bg-slate-50 dark:bg-slate-900 p-6 flex flex-col gap-6">
    <header>
      <h2 class="text-xl font-bold dark:text-white">Color Service</h2>
      <p class="text-slate-500 text-sm">Select a color to return to the requester. Instance: <span class="font-mono text-xs opacity-50">{{ instanceId }}</span></p>
    </header>

    <div class="grid grid-cols-3 gap-3">
      <button 
        v-for="color in colors" 
        :key="color.name"
        class="aspect-square rounded-xl border-4 transition transform hover:scale-105 active:scale-95"
        :class="[color.class, selected === color.name ? 'border-white dark:border-slate-400 shadow-lg' : 'border-transparent']"
        :title="color.name"
        @mouseenter="preview(color.name)"
        @click="pick(color.name)"
      />
    </div>

    <div class="mt-auto flex flex-col gap-2">
      <p v-if="selected" class="text-center font-bold text-lg" :style="{ color: selected.toLowerCase() }">
        Selected: {{ selected }}
      </p>
      <button 
        class="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-700 transition"
        @click="close"
      >
        Finish & Close
      </button>
    </div>
  </div>
</template>
