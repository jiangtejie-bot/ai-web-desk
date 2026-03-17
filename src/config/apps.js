export const apps = [
  {
    id: 'browser',
    name: '浏览器控制',
    icon: 'BrowserIcon',
    component: () => import('../apps/browser/BrowserApp.vue'),
    defaultWidth: 1200,
    defaultHeight: 800,
    systemApp: false
  },
  {
    id: 'settings',
    name: '系统设置',
    icon: 'SettingsIcon',
    component: () => import('../apps/settings/SettingsApp.vue'),
    defaultWidth: 900,
    defaultHeight: 650,
    systemApp: true
  },
  {
    id: 'tv',
    name: '电视直播',
    icon: 'TVIcon',
    component: () => import('../apps/tv/TVApp.vue'),
    defaultWidth: 1200,
    defaultHeight: 800,
    systemApp: false
  },
  {
    id: 'bookmarks',
    name: '地球书签',
    icon: 'BookmarkIcon',
    component: () => import('../apps/bookmarks/BookmarksApp.vue'),
    defaultWidth: 1100,
    defaultHeight: 700,
    systemApp: false
  },
  {
    id: 'translator',
    name: '同声传译',
    icon: 'TranslatorIcon',
    component: () => import('../apps/translator/TranslatorApp.vue'),
    defaultWidth: 900,
    defaultHeight: 700,
    systemApp: false
  },
  {
    id: 'slacking',
    name: '上班摸鱼',
    icon: 'SlackingIcon',
    component: () => import('../apps/slacking/SlackingApp.vue'),
    defaultWidth: 1000,
    defaultHeight: 700,
    systemApp: false
  },
  {
    id: 'calculator',
    name: '计算器',
    icon: 'CalculatorIcon',
    component: () => import('../apps/calculator/CalculatorApp.vue'),
    defaultWidth: 320,
    defaultHeight: 480,
    systemApp: true
  }
]
