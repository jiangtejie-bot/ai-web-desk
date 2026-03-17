export const modules = [
  {
    id: 'browser',
    title: '浏览器控制',
    description: '多窗口浏览器控制，支持6个并发窗口，可独立加载和操作',
    icon: 'BrowserIcon',
    tags: ['浏览器', '多窗口', '自动化'],
    route: '/browser'
  },
  {
    id: 'script',
    title: '脚本管理',
    description: '可视化脚本编辑器，支持步骤录制、编辑和执行',
    icon: 'ScriptIcon',
    tags: ['脚本', '自动化', '可视化'],
    route: '/script'
  },
  {
    id: 'task',
    title: '任务队列',
    description: '批量任务管理，支持定时任务和并发执行',
    icon: 'TaskIcon',
    tags: ['任务', '队列', '调度'],
    route: '/task'
  },
  {
    id: 'data',
    title: '数据中心',
    description: '数据采集和分析，支持多种数据导出格式',
    icon: 'DataIcon',
    tags: ['数据', '分析', '导出'],
    route: '/data'
  },
  {
    id: 'settings',
    title: '系统设置',
    description: '全局配置管理，包括API、代理和界面设置',
    icon: 'SettingsIcon',
    tags: ['设置', '配置', '管理'],
    route: '/settings'
  }
];
