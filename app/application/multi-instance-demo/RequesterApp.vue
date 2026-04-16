<script setup lang="ts">
import { ref, inject } from 'vue'

const requesterId = ref(Math.random().toString(36).substring(7))
const log = ref<{time: string, msg: string}[]>([])

const windowManager = inject<any>('os-window-manager')

async function requestColor(initial?: string) {
  addLog(`Requesting color from Service (initial: ${initial || 'none'})...`)
  
  // ---------------------------------------------------------
  // ADVANCED API: Awaitable Windows + Streaming Callbacks!
  // 1. Launch a unique instance of `color-service`.
  // 2. Pass standard primitive state (`initialColor`).
  // 3. Pass a function (`onPreview`) to act as a continuous event stream.
  // 4. `await` the final resolution for when the user submits their choice!
  // ---------------------------------------------------------
  /* 
    BASIC PROMISE EXAMPLE (If you didn't need the stream):
    const result = await windowManager.openWindow('color-service', { 
      params: { initialColor: initial } 
    })
  */
  const result = await windowManager.openWindow('color-service', { 
    params: { 
      initialColor: initial,
      onPreview: (color: string) => {
        addLog(`STREAM: User currently previewing ${color}...`)
      }
    } 
  })
  
  if (result) {
    addLog(`SUCCESS: Received color "${result}"`)
  } else {
    addLog(`CANCELLED: Service closed without result.`)
  }
}

function addLog(msg: string) {
  log.value.unshift({
    time: new Date().toLocaleTimeString(),
    msg
  })
}
</script>

<template>
  <div class="h-full bg-white dark:bg-slate-800 flex flex-col">
    <div class="p-6 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <h1 class="text-2xl font-bold dark:text-white">Service Requester</h1>
      <p class="text-slate-500 italic mt-1">Demonstrates Multi-Instance Callbacks via Awaitable Windows</p>
    </div>

    <div class="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
      <div class="grid grid-cols-2 gap-4">
        <button 
          class="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition flex flex-col items-center gap-2"
          @click="requestColor()"
        >
          <span class="icon-[mdi--palette] text-3xl"></span>
          <span class="font-bold">Pick New Color</span>
          <span class="text-xs opacity-75">Spawns brand new instance</span>
        </button>

        <button 
          class="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition flex flex-col items-center gap-2"
          @click="requestColor('Amber')"
        >
          <span class="icon-[mdi--refresh] text-3xl"></span>
          <span class="font-bold">Edit Color: Amber</span>
          <span class="text-xs opacity-75">Passes context params</span>
        </button>
      </div>

      <div class="flex-1 flex flex-col bg-slate-900 rounded-xl overflow-hidden min-h-[200px]">
        <header class="px-4 py-2 bg-slate-800 text-slate-400 text-xs font-mono uppercase tracking-widest flex justify-between">
          <span>Callback Event Log</span>
          <button @click="log = []" class="hover:text-white">Clear</button>
        </header>
        <div class="flex-1 p-4 font-mono text-sm text-green-400 overflow-y-auto">
          <div v-if="log.length === 0" class="text-slate-700 italic">Waiting for requests...</div>
          <div v-for="(item, idx) in log" :key="idx" class="mb-1">
            <span class="text-slate-500">[{{ item.time }}]</span> {{ item.msg }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
