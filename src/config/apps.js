export const apps = [
  {
    id: 'browser',
    name: '浏览器控制',
    icon: 'lucide:globe',
    component: () => import('../apps/browser/BrowserApp.vue'),
    defaultWidth: 1200,
    defaultHeight: 800,
    systemApp: false
  },
  {
    id: 'settings',
    name: '系统设置',
    icon: 'lucide:settings',
    component: () => import('../apps/settings/SettingsApp.vue'),
    defaultWidth: 900,
    defaultHeight: 650,
    systemApp: true
  },
  {
    id: 'tv',
    name: '电视直播',
    icon: 'lucide:tv',
    component: () => import('../apps/tv/TVApp.vue'),
    defaultWidth: 1200,
    defaultHeight: 800,
    systemApp: false
  },
  {
    id: 'bookmarks',
    name: '地球书签',
    icon: 'lucide:bookmark',
    component: () => import('../apps/bookmarks/BookmarksApp.vue'),
    defaultWidth: 1100,
    defaultHeight: 700,
    systemApp: false
  },

  {
    id: 'slacking',
    name: '上班摸鱼',
    icon: 'lucide:message-square',
    component: () => import('../apps/slacking/SlackingApp.vue'),
    defaultWidth: 1000,
    defaultHeight: 700,
    systemApp: false
  },
  {
    id: 'calculator',
    name: '计算器',
    icon: 'lucide:calculator',
    component: () => import('../apps/calculator/CalculatorApp.vue'),
    defaultWidth: 320,
    defaultHeight: 480,
    systemApp: true
  },
  {
    id: 'devtools',
    name: '开发工具',
    icon: 'lucide:code-2',
    component: () => import('../apps/devtools/DevToolsApp.vue'),
    defaultWidth: 1100,
    defaultHeight: 750,
    systemApp: false
  }
]
