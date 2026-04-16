<script setup lang="ts">
import { ref } from 'vue'
import ShowcaseModal from './components/ShowcaseModal.vue'

// Define references to hold all three independent state blocks
const win1 = ref({ isOpen: false, isMinimized: false,  ref: null as any })
const win2 = ref({ isOpen: false, isMinimized: false,  ref: null as any })
const win3 = ref({ isOpen: false, isMinimized: false,  ref: null as any })

// Demonstration Callback Event Log
const callbackLog = ref<string[]>([])

function onCallback(eventFrom: string, msg: string) {
  const timestamp = new Date().toLocaleTimeString()
  callbackLog.value.unshift(`[${timestamp}] [${eventFrom}] -> ${msg}`)
  if (callbackLog.value.length > 20) callbackLog.value.pop()
}

function clearLogs() {
  callbackLog.value = []
}
</script>

<template>
  <div class="h-full bg-slate-100 dark:bg-slate-800 p-6 flex flex-col gap-6 overflow-y-auto">
    <header>
      <h1 class="text-2xl font-bold dark:text-white flex items-center gap-2">
        <span class="icon-[mdi--window-restore] text-blue-500"></span> OS Window Showcase
      </h1>
      <p class="text-slate-500 mt-1">This app demonstrates the advanced lifecycle hooks, state passthroughs, and teleport logic of the native `OSWindow` engine.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Panel 1: Linked Standard Window -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm flex flex-col">
        <h2 class="font-bold mb-2 dark:text-white text-lg">1. Linked Standard</h2>
        <ul class="text-sm text-slate-500 mb-6 list-disc pl-4 space-y-2">
          <li><strong>Minimizes seamlessly when this parent window minimizes.</strong></li>
          <li>Appears as standalone app icon in the OS Taskbar.</li>
          <li>Full parent-child callback event bus support.</li>
        </ul>

        <div class="mt-auto flex flex-col gap-3">
          <button 
             class="rounded-lg p-2.5 font-medium transition" 
             :class="win1.isOpen ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'"
             @click="win1.isOpen = true"
             :disabled="win1.isOpen"
          >
             {{ win1.isOpen ? 'Window is Active' : 'Spawn Window' }}
          </button>
          
          <div class="flex gap-2" :class="{'opacity-50 pointer-events-none': !win1.isOpen}">
             <button 
               class="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-lg p-2.5 flex-1 transition font-medium" 
               @click="win1.ref?.focus()"
             >
                {{ win1.isMinimized ? 'Restore (Un-min)' : 'Focus Window' }}
             </button>
             <button class="bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-500/20 dark:hover:bg-red-500 dark:text-white text-red-600 rounded-lg p-2.5 flex-1 transition font-medium" @click="win1.isOpen = false">
                Close Active
             </button>
          </div>
        </div>

        <ShowcaseModal 
          :ref="el => { if (el) win1.ref = el }"
          v-model="win1.isOpen"
          v-model:minimized="win1.isMinimized"
          title="Linked Modal"
          :minimize-with-parent="true"
          :show-in-taskbar="true"
          @reply="(text) => onCallback('Linked Modal', text)"
          @closed="(msg) => onCallback('System', msg)"
        />
      </section>

      <!-- Panel 2: Floating Detached Window -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm flex flex-col">
        <h2 class="font-bold mb-2 dark:text-white text-lg">2. Detached Floater</h2>
        <ul class="text-sm text-slate-500 mb-6 list-disc pl-4 space-y-2">
          <li><strong>Ignores parent minimizes completely (stays permanently on screen!).</strong></li>
          <li>Great for persistent toolbars or detached video players.</li>
          <li>Appears as standalone app in Taskbar.</li>
        </ul>

        <div class="mt-auto flex flex-col gap-3">
          <button 
             class="rounded-lg p-2.5 font-medium transition" 
             :class="win2.isOpen ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'"
             @click="win2.isOpen = true"
             :disabled="win2.isOpen"
          >
             {{ win2.isOpen ? 'Window is Active' : 'Spawn Window' }}
          </button>
          
          <div class="flex gap-2" :class="{'opacity-50 pointer-events-none': !win2.isOpen}">
             <button 
               class="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-lg p-2.5 flex-1 transition font-medium" 
               @click="win2.ref?.focus()"
             >
                {{ win2.isMinimized ? 'Restore (Un-min)' : 'Focus Window' }}
             </button>
             <button class="bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-500/20 dark:hover:bg-red-500 dark:text-white text-red-600 rounded-lg p-2.5 flex-1 transition font-medium" @click="win2.isOpen = false">
                Close Active
             </button>
          </div>
        </div>

        <ShowcaseModal 
          :ref="el => { if (el) win2.ref = el }"
          v-model="win2.isOpen"
          v-model:minimized="win2.isMinimized"
          title="Detached Modal"
          :minimize-with-parent="false"
          :show-in-taskbar="true"
          @reply="(text) => onCallback('Detached Floater', text)"
          @closed="(msg) => onCallback('System', msg)"
        />
      </section>

      <!-- Panel 3: Silent Transient Modal -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm flex flex-col">
        <h2 class="font-bold mb-2 dark:text-white text-lg">3. Pure Transient</h2>
        <ul class="text-sm text-slate-500 mb-6 list-disc pl-4 space-y-2">
          <li><strong>Hidden from the OS Taskbar completely.</strong></li>
          <li>Acts exactly like a traditional Vue Dialog Popup.</li>
          <li>Minimizes faithfully with parent.</li>
        </ul>

        <div class="mt-auto flex flex-col gap-3">
          <button 
             class="rounded-lg p-2.5 font-medium transition" 
             :class="win3.isOpen ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'"
             @click="win3.isOpen = true"
             :disabled="win3.isOpen"
          >
             {{ win3.isOpen ? 'Window is Active' : 'Spawn Window' }}
          </button>
          
          <div class="flex gap-2" :class="{'opacity-50 pointer-events-none': !win3.isOpen}">
             <button 
               class="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-lg p-2.5 flex-1 transition font-medium" 
               @click="win3.ref?.focus()"
             >
                {{ win3.isMinimized ? 'Restore (Un-min)' : 'Focus Window' }}
             </button>
             <button class="bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-500/20 dark:hover:bg-red-500 dark:text-white text-red-600 rounded-lg p-2.5 flex-1 transition font-medium" @click="win3.isOpen = false">
                Close Active
             </button>
          </div>
        </div>

        <ShowcaseModal 
          :ref="el => { if (el) win3.ref = el }"
          v-model="win3.isOpen"
          v-model:minimized="win3.isMinimized"
          title="Transient Modal"
          :minimize-with-parent="true"
          :show-in-taskbar="false"
          @reply="(text) => onCallback('Transient Modal', text)"
          @closed="(msg) => onCallback('System', msg)"
        />
      </section>
      
    </div>

    <!-- Callback Activity Tray -->
    <div class="mt-2 shrink-0 flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
      <header class="bg-slate-100 dark:bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
         <h3 class="font-bold flex items-center gap-2 dark:text-slate-200">
            <span class="icon-[mdi--bell-ring] text-blue-500"></span> Event Bus Log
         </h3>
         <button @click="clearLogs" class="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium">Clear Logs</button>
      </header>

      <div class="bg-slate-900 text-green-400 font-mono text-sm p-4 h-40 overflow-y-auto">
        <div v-if="callbackLog.length === 0" class="text-slate-600">Waiting for emitted messages from child windows...</div>
        <div v-for="(log, idx) in callbackLog" :key="idx" class="mb-1">> {{ log }}</div>
      </div>
    </div>
  </div>
</template>
