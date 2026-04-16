<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, watch, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  subtitle?: string
  iconClass?: string
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  showInTaskbar?: boolean
  minimized?: boolean
  minimizeWithParent?: boolean
  params?: any
}>(), {
  title: 'Window',
  subtitle: '',
  iconClass: 'icon-[mdi--window-maximize]',
  width: 500,
  height: 400,
  minWidth: 300,
  minHeight: 200,
  showInTaskbar: false,
  minimized: false,
  minimizeWithParent: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:minimized': [value: boolean]
  closed: []
}>()

// Generate a unique ID for this dynamic window instance
const windowId = `dynamic-${Math.random().toString(36).substring(2, 9)}`

// Tap into the global window manager exposed by DesktopShell
const windowManager = inject<any>('os-window-manager')
const parentWindow = inject<any>('parent-window', null)

function injectWindow() {
  if (!windowManager) return
  windowManager.spawnDynamicWindow({
    id: windowId,
    title: props.title,
    subtitle: props.subtitle,
    iconClass: props.iconClass,
    w: props.width,
    h: props.height,
    minWidth: props.minWidth,
    minHeight: props.minHeight,
    showInTaskbar: props.showInTaskbar,
    params: props.params
  })
}

function removeWindow() {
  if (!windowManager) return
  windowManager.destroyDynamicWindow(windowId)
}

// Watch for the specific dynamic window item to sync its `isOpen` state back to v-model
// Because a user might click the "X" button on the WindowFrame directly!
const windowItem = computed(() => {
  if (!windowManager) return null
  return windowManager.windows.value.find((w: any) => w.id === windowId)
})

watch(() => parentWindow?.isMinimized, (parentMin) => {
  if (props.minimizeWithParent && windowItem.value) {
    if (parentMin && !windowItem.value.isMinimized) {
      windowManager.minimizeWindow(windowId)
    } else if (!parentMin && windowItem.value.isMinimized) {
      windowItem.value.isMinimized = false
      windowManager.bringToFront(windowId)
    }
  }
})

watch(() => windowItem.value?.isMinimized, (isMin) => {
  emit('update:minimized', isMin ?? false)
})

function handleClose() {
  if (!windowManager) return
  windowManager.closeWindow(windowId)
  removeWindow()
  emit('update:modelValue', false)
  emit('closed')
}

function bringToFront() {
  if (!windowManager) return
  const w = windowItem.value
  if (w) {
    w.isMinimized = false
    windowManager.bringToFront(windowId)
  }
}

defineExpose({ bringToFront })

watch(() => windowItem.value?.isOpen, (isOpen) => {
  if (isOpen === false) {
    handleClose()
  }
})

// Reactively spawn or destroy when v-model changes from parent
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    injectWindow()
  } else {
    removeWindow()
    emit('closed')
  }
})

onMounted(() => {
  if (props.modelValue) {
    injectWindow()
  }
})

onBeforeUnmount(() => {
  removeWindow()
})
</script>

<template>
  <Teleport defer to="#os-window-stage">
    <!-- 
      We render the `<WindowFrame>` right inside the teleport target.
      This allows us to pass all window bounds directly from `windowItem`
      AND inject our own `<slot>` into the window!
    -->
    <WindowFrame
      v-if="props.modelValue && windowItem"
      v-show="!windowItem.isMinimized"
      :window-item="windowItem"
      :is-active="windowManager.activeWindowId.value === windowId"
      :style-value="windowManager.windowStyle(windowItem)"
      :resize-handles="windowManager.resizeHandles"
      @focus="windowManager.bringToFront(windowId)"
      @start-drag="(ev: PointerEvent) => windowManager.startDrag(ev, windowId)"
      @start-resize="(ev: PointerEvent, id: string, dir: any) => windowManager.startResize(ev, windowId, dir)"
      @minimize="windowManager.minimizeWindow(windowId)"
      @maximize="windowManager.maximizeWindow(windowId)"
      @close="handleClose"
    >
      <slot />
    </WindowFrame>
  </Teleport>
</template>
