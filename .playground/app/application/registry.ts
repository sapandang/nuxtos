import { markRaw } from 'vue'
import type { RegisteredApplication } from '~/types/application'
import BrowserAppRoot from '~/application/browser/AppRoot.vue'
import CalculatorAppRoot from '~/application/calculator/AppRoot.vue'
import ExplorerAppRoot from '~/application/explorer/AppRoot.vue'
import SettingsAppRoot from '~/application/settings/AppRoot.vue'
import POSAppRoot from '~/application/pos/AppRoot.vue'
import ShowcaseAppRoot from '~/application/window-showcase/AppRoot.vue'
import PickerAppRoot from '~/application/multi-instance-demo/PickerApp.vue'
import RequesterAppRoot from '~/application/multi-instance-demo/RequesterApp.vue'

export const applicationsRegistry: RegisteredApplication[] = [
  {
    id: 'explorer',
    title: 'File Explorer',
    subtitle: 'Quick access and folders',
    iconClass: 'icon-[material-symbols--folder-rounded]',
    component: markRaw(ExplorerAppRoot),
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
    component: markRaw(BrowserAppRoot),
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
    component: markRaw(SettingsAppRoot),
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
    component: markRaw(CalculatorAppRoot),
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
  },
  {
    id: 'pos',
    title: 'Point of Sale',
    subtitle: 'Order management',
    iconClass: 'icon-[carbon--shopping-cart]',
    component: markRaw(POSAppRoot),
    launchOnBoot: false,
    window: {
      x: 100,
      y: 100,
      w: 800,
      h: 600,
      minWidth: 400,
      minHeight: 400
    }
  },
  {
    id: 'showcase',
    title: 'OS Showcase',
    subtitle: 'Capabilities Demo',
    iconClass: 'icon-[mdi--window-restore]',
    component: markRaw(ShowcaseAppRoot),
    launchOnBoot: false,
    window: {
      x: 120,
      y: 100,
      w: 950,
      h: 650,
      minWidth: 800,
      minHeight: 500
    }
  },
  {
    id: 'color-service',
    title: 'Color Service',
    subtitle: 'App Callback Provider',
    iconClass: 'icon-[mdi--palette]',
    component: markRaw(PickerAppRoot),
    allowMultiInstance: true, // IMPORTANT
    window: {
      x: 300, y: 150,
      w: 400, h: 450,
      minWidth: 300, minHeight: 300
    }
  },
  {
    id: 'instance-tester',
    title: 'Service Tester',
    subtitle: 'Multi-Instance Demo',
    iconClass: 'icon-[mdi--test-tube]',
    component: markRaw(RequesterAppRoot),
    allowMultiInstance: false,
    window: {
      x: 200, y: 120,
      w: 600, h: 500,
      minWidth: 400, minHeight: 400
    }
  }
]

export const applicationsById = applicationsRegistry.reduce<Record<string, RegisteredApplication>>((acc, app) => {
  acc[app.id] = app
  return acc
}, {})
