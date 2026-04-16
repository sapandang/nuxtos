import type { DesktopLayoutItemConfig } from '~/types/window'

export const defaultDesktopLayout: DesktopLayoutItemConfig[] = [
  { type: 'app', id: 'pos' },
  { type: 'app', id: 'explorer' },
  { type: 'app', id: 'browser' },
  {
    type: 'folder',
    id: 'group-utilities',
    title: 'Utilities',
    children: [
      { type: 'app', id: 'settings' },
      { type: 'app', id: 'calculator' }
    ]
  }
]
