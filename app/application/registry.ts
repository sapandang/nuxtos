import type { RegisteredApplication } from '~/types/application'
import BrowserAppRoot from '~/application/browser/AppRoot.vue'
import CalculatorAppRoot from '~/application/calculator/AppRoot.vue'
import ExplorerAppRoot from '~/application/explorer/AppRoot.vue'
import SettingsAppRoot from '~/application/settings/AppRoot.vue'

export const applicationsRegistry: RegisteredApplication[] = [
  {
    id: 'explorer',
    title: 'File Explorer',
    subtitle: 'Quick access and folders',
    iconClass: 'icon-[material-symbols--folder-rounded]',
    component: ExplorerAppRoot,
    launchOnBoot: true,
    window: {
      x: 92,
      y: 66,
      w: 540,
      h: 360,
      minWidth: 360,
      minHeight: 260
    }
  },
  {
    id: 'browser',
    title: 'Edge Browser',
    subtitle: 'Nuxt docs',
    iconClass: 'icon-[mdi--microsoft-edge]',
    component: BrowserAppRoot,
    launchOnBoot: true,
    window: {
      x: 220,
      y: 100,
      w: 600,
      h: 380,
      minWidth: 380,
      minHeight: 280
    }
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Personalization',
    iconClass: 'icon-[material-symbols--settings-rounded]',
    component: SettingsAppRoot,
    launchOnBoot: true,
    window: {
      x: 158,
      y: 144,
      w: 500,
      h: 340,
      minWidth: 340,
      minHeight: 240
    }
  },
  {
    id: 'calculator',
    title: 'Calculator',
    subtitle: 'Quick math utility',
    iconClass: 'icon-[mdi--calculator-variant-outline]',
    component: CalculatorAppRoot,
    launchOnBoot: false,
    defaultPinnedToTaskbar: false,
    window: {
      x: 290,
      y: 128,
      w: 320,
      h: 420,
      minWidth: 300,
      minHeight: 380
    }
  }
]

export const applicationsById = applicationsRegistry.reduce<Record<string, RegisteredApplication>>((acc, app) => {
  acc[app.id] = app
  return acc
}, {})
