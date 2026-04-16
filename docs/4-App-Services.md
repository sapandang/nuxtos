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

## 3. Streaming / Continuous Events
If you need an app to send *continuous* streams of data (like a live progress bar, file upload percentage, or real-time preview), the standard Promise won't work because Promises only resolve once.

Instead, you can pass a **callback function** inside the `params` payload!

**The Parent:**
```typescript
const result = await os.openWindow('color-service', { 
  params: { 
    onPreview: (color: string) => {
      console.log(`STREAM: User is currently hovering over ${color}...`)
    }
  } 
})
```

**The Child:**
```typescript
const props = defineProps(['instanceId', 'params'])

function hoverEvent(color: string) {
  // Send data continuously without resolving the final Promise!
  if (props.params?.onPreview) {
    props.params.onPreview(color)
  }
}
```

## 4. Multi-Instance Support
By default, standard apps are single-instance. If you want an app (like a File Picker or Calculator) to support multiple windows simultaneously, set the `allowMultiInstance` flag in your `registry.ts`:

```typescript
{
  id: 'my-service',
  title: 'Service Provider',
  allowMultiInstance: true, // Enables Promise-based isolation and UUID generation
  component: markRaw(MyComponent),
  window: { ... }
}
```
