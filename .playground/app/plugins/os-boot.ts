import { applicationsRegistry } from '~/application/registry'
import { defaultDesktopLayout } from '~/application/desktop-layout'

export default defineNuxtPlugin({
  name: 'nuxtos:boot',
  enforce: 'pre',
  setup() {
    const os = useNuxtOS()
    os.boot({
      apps: applicationsRegistry,
      desktopLayout: defaultDesktopLayout
    })
  }
})
