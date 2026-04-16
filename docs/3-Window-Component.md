# 3. Multi-Window Modals (`<OSWindow>`)

The ultimate power of NuxtOS lies in its capability for native sub-window generation! You can gracefully spawn independent floating windows and interactive dialogs directly inside your applications using the internal `<OSWindow>` wrapper.

Because `<OSWindow>` automatically acts as a `<Teleport>`, you **do not** need to arbitrarily register your Popups or Action Dialog boxes in `registry.ts`. You instantiate them organically right from your everyday Vue templates!

## The Component
```vue
<template>
  <div>
    <button @click="showDialog = true">Open Popup</button>

    <!-- It mounts as a genuine OS Window floating over the desktop! -->
    <OSWindow 
      v-model="showDialog" 
      title="Advanced Settings" 
      icon-class="icon-[mdi--cog]"
      :width="400"
      :height="500"
      :show-in-taskbar="false"
      :minimize-with-parent="true"
      @closed="handleClose"
    >
      <div class="p-6 h-full flex flex-col gap-4">
         <p>Because I am teleported, I automatically have a 
            Window Frame, 8 Resize Handles, and native Draggability!!</p>
         
         <button @click="$emit('customCallback')">Save Settings</button>
      </div>
    </OSWindow>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import OSWindow from '~/components/os/OSWindow.vue'

const showDialog = ref(false)

function handleClose() {
  console.log("The user clicked [X] on the OS Window titlebar!")
}
</script>
```

## Advanced Props
By leveraging `<OSWindow>`, you get seamless integration with the OS Manager.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `v-model` | `Boolean` | `false` | Controls whether the window visually exists. Closing automatically wipes it dynamically from OS RAM. |
| `v-model:minimized` | `Boolean` | `false` | Syncs the OS `isMinimized` state fully gracefully to your parent vue wrapper. |
| `:minimize-with-parent` | `Boolean` | `false` | If `true`, when the user minimizes your absolute parent App in the Taskbar, this child popup will securely minimize globally alongside it natively. |
| `:show-in-taskbar` | `Boolean` | `false` | If `true`, this dynamically spawned window gets an independent Icon automatically clustered in the OS Taskbar queue! |

### Programmatic Focusing
If your sub-window ends up minimized deep in the Taskbar, and the end-user clicks a button inside your main app asking to see it again, you can programmatically instruct the Taskbar to unminimize the Window and securely whip it perfectly to the front of the Z-index by executing `.bringToFront()`!

```vue
<OSWindow :ref="(el) => { if (el) myWindow = el }" ... />

<script setup>
const myWindow = ref(null)

function focusMyWindow() {
  myWindow.value.bringToFront()
}
</script>
```

---

# 4. App-to-App Callbacks (`Awaitable Apps`)

NuxtOS supports a sophisticated "Service Request" pattern where one application can launch another, pass configuration parameters, and asynchronously wait for a response.

## 1. Requesting a Service
Use the `os.openWindow` API, which now returns a **Promise**. Open any app from the registry and `await` its result!

```typescript
const os = useNuxtOS()

async function selectColor() {
  // 1. Launch the app with custom params
  // 2. The code pauses here...
  const result = await os.openWindow('color-service', { 
    params: { initialColor: 'Amber' } 
  })
  
  // 3. ...and resumes once the other app emits data!
  if (result) {
    console.log("User picked:", result)
  }
}
```

## 2. Providing a Service (The Callee)
Apps that are designed to be "Providers" should look for `instanceId` and `params` in their props and use the `emitResult` method.

```vue
<script setup>
const props = defineProps(['instanceId', 'params'])
const os = useNuxtOS() // or inject('os-window-manager')

function onConfirm(data) {
  // Sends data back to the specific instance that called us
  os.emitResult(props.instanceId, data)
  
  // You decide when to close the window
  os.closeWindow(props.instanceId)
}
</script>
```

## 3. Multi-Instance Support
By default, standard apps are single-instance. If you want an app (like a File Picker or Calculator) to support multiple windows, set the flag in your `registry.ts`:

```typescript
{
  id: 'my-service',
  title: 'Service Provider',
  allowMultiInstance: true, // Enables Promise-based isolation
  component: markRaw(MyComponent),
  window: { ... }
}
```
