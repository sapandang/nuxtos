# 1. Setup Guide

NuxtOS is architected as a **Nuxt Layer**. This means you don't fork or clone it directly to build your products—you consume it as a framework dependency!

## Installation

1. Create a brand new, empty Nuxt 4 project.
2. Install the required CSS dependencies:
   ```bash
   npm i -D tailwindcss @iconify/tailwind4 @iconify/json
   ```
3. In your new project's `nuxt.config.ts`, extend the NuxtOS layer repository:
   ```typescript
   export default defineNuxtConfig({
     extends: [
       'github:sapandang/nuxtos'    
     ]
   })
   ```
4. **Copy the OS configurations!** To get a completely functioning OS out of the box, simply copy the `app/application/`, `app/pages/`, and `app/plugins/` folders directly from the `.playground/` directory of the NuxtOS repo into your new project's root `app/` directory.

## Booting the OS
NuxtOS is completely agnostic and expects you to deliberately "inject" your app registry and layout configuration upon boot. This is done via your local `app/plugins/os-boot.ts`:

```typescript
import { defineNuxtPlugin } from '#app'
import { useNuxtOS } from '~/composables/useNuxtOS'
import { applicationsRegistry } from '~/application/registry'
import { defaultDesktopLayout } from '~/application/desktop-layout'

export default defineNuxtPlugin({
  name: 'my-os:boot',
  enforce: 'pre', // MUST run before UI mounts
  async setup() {
    const os = useNuxtOS()
    
    // Inject your apps natively into the OS Engine!
    os.boot({
      apps: applicationsRegistry,
      desktopLayout: defaultDesktopLayout
    })
  }
})
```
