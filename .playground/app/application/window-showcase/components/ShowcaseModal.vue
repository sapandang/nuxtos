<script setup lang="ts">
import { ref } from 'vue'
import OSWindow from '~/components/os/OSWindow.vue'

const props = defineProps<{
  modelValue: boolean
  minimized?: boolean
  title: string
  minimizeWithParent?: boolean
  showInTaskbar?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:minimized': [value: boolean]
  closed: [message: string]
  reply: [text: string]
}>()

const replyText = ref('')
const osWindowRef = ref<InstanceType<typeof OSWindow> | null>(null)

function focus() {
  if (osWindowRef.value) {
    osWindowRef.value.bringToFront()
  }
}

function handleClose() {
  emit('closed', `The window "${props.title}" was permanently closed!`)
}

defineExpose({ focus })
</script>

<template>
  <OSWindow
    :ref="(el: any) => { if (el) osWindowRef = el }"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :minimized="minimized"
    @update:minimized="emit('update:minimized', $event)"
    :title="title"
    :minimize-with-parent="minimizeWithParent"
    :show-in-taskbar="showInTaskbar"
    :width="420"
    :height="400"
    @closed="handleClose"
  >
    <div class="h-full p-6 flex flex-col gap-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm dark:text-slate-300">
        <h4 class="font-bold mb-2">Configuration State:</h4>
        <div class="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1">
          <span>Minimize With Parent:</span> 
          <strong :class="minimizeWithParent ? 'text-green-500' : 'text-red-500'">{{ minimizeWithParent ? 'YES' : 'NO' }}</strong>
          
          <span>Show In Taskbar:</span> 
          <strong :class="showInTaskbar ? 'text-green-500' : 'text-red-500'">{{ showInTaskbar ? 'YES' : 'NO' }}</strong>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-2">
        <label class="text-sm font-semibold dark:text-white font-mono text-blue-500">Parent Callback Tester</label>
        <div class="flex gap-2">
          <input 
             v-model="replyText" 
             type="text" 
             placeholder="Type message..." 
             class="border rounded-lg px-3 py-2 flex-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500" 
          />
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
            @click="emit('reply', replyText); replyText = ''"
          >
            Send
          </button>
        </div>
      </div>
      
      <div class="mt-auto">
        <button 
          class="w-full bg-slate-200 hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:hover:bg-red-500 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-lg transition font-medium"
          @click="emit('update:modelValue', false); handleClose()"
        >
          Programmatically Close from Child
        </button>
      </div>
    </div>
  </OSWindow>
</template>
