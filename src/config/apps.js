export const apps = [
  {
    id: 'browser',
    name: '浏览器控制',
    icon: 'BrowserIcon',
    component: () => import('../apps/browser/BrowserApp.vue'),
    defaultWidth: 1200,
    defaultHeight: 800
  },
  {
    id: 'settings',
    name: '系统设置',
    icon: 'SettingsIcon',
    component: () => import('../apps/settings/SettingsApp.vue'),
    defaultWidth: 900,
    defaultHeight: 650
  },
  {
    id: 'tv',
    name: '电视直播',
    icon: 'TVIcon',
    component: () => import('../apps/tv/TVApp.vue'),
    defaultWidth: 1200,
    defaultHeight: 800
  },
  {
    id: 'bookmarks',
    name: '地球书签',
    icon: 'BookmarkIcon',
    component: () => import('../apps/bookmarks/BookmarksApp.vue'),
    defaultWidth: 1100,
    defaultHeight: 700
  },
  {
    id: 'translator',
    name: '同声传译',
    icon: 'TranslatorIcon',
    component: () => import('../apps/translator/TranslatorApp.vue'),
    defaultWidth: 900,
    defaultHeight: 700
  },
  {
    id: 'slacking',
    name: '上班摸鱼',
    icon: 'SlackingIcon',
    component: () => import('../apps/slacking/SlackingApp.vue'),
    defaultWidth: 1000,
    defaultHeight: 700
  }
]
