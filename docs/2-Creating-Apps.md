# 2. Creating & Registering Apps

Applications in NuxtOS are standard Vue components that the Core OS Engine dynamically renders inside its frosted-glass Window Frames.

## 1. Build your App Component
First, create your application anywhere (e.g. `app/application/my-app/AppRoot.vue`).
It can be as simple as:
```vue
<template>
  <div class="h-full bg-white p-4">
    <h1>Hello World!</h1>
  </div>
</template>
```

> **Note:** The OS Window provides the outer frame, titlebar, shadow, and bounds. Your component purely dictates the *content* area and should generally use `h-full` to fill its window natively.

## 2. Register your App
Once your component is built, you must declare it in your `registry.ts` file. This tells the OS its default dimensions, icon, and text!

```typescript
import { markRaw } from 'vue'
import MyAppRoot from '~/application/my-app/AppRoot.vue'
import type { RegisteredApplication } from '~/types/application'

export const applicationsRegistry: RegisteredApplication[] = [
  {
    id: 'my-app',
    title: 'My Custom App',
    subtitle: 'It does something cool',
    iconClass: 'icon-[mdi--star]',
    component: markRaw(MyAppRoot), // CRUCIAL: markRaw prevents Nuxt SSR proxy crashes!
    launchOnBoot: true,
    defaultPinnedToTaskbar: true,
    window: {
      x: 100, y: 100, 
      w: 800, h: 600,
      minWidth: 400, minHeight: 400
    }
  }
]
```

## 3. Place it on the Desktop
To make your app physically appear as an interactive icon on the user's Desktop, simply add it to your `desktop-layout.ts`:
```typescript
export const defaultDesktopLayout = [
  { type: 'app', id: 'my-app' }
]
```

You can even cluster it into interactive desktop folders:
```typescript
{
  type: 'folder',
  id: 'group-tools',
  title: 'Tools',
  children: [ 
     { type: 'app', id: 'my-app' } 
  ]
}
```
