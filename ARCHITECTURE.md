# WebAuto Studio - 桌面风格架构说明

## 🎨 设计理念

采用 Windows 桌面风格设计，每个功能模块作为一个独立的"应用程序"，可以在桌面上通过双击图标打开，在窗口中运行，支持多窗口、拖拽、最小化、最大化等功能。

## 📁 项目结构

```
src/
├── components/           # 核心组件
│   ├── Desktop.vue      # 桌面主界面
│   ├── Window.vue       # 窗口组件（支持拖拽、缩放、最小化、最大化）
│   └── Taskbar.vue      # 任务栏组件
│
├── apps/               # 应用程序目录（每个应用独立文件夹）
│   ├── browser/        # 浏览器控制应用
│   │   ├── BrowserApp.vue
│   │   └── icons/
│   │       └── BrowserIcon.vue
│   ├── script/         # 脚本管理应用
│   │   ├── ScriptApp.vue
│   │   └── icons/
│   │       └── ScriptIcon.vue
│   ├── task/           # 任务队列应用
│   │   ├── TaskApp.vue
│   │   └── icons/
│   │       └── TaskIcon.vue
│   ├── data/           # 数据中心应用
│   │   ├── DataApp.vue
│   │   └── icons/
│   │       └── DataIcon.vue
│   └── settings/       # 系统设置应用
│       ├── SettingsApp.vue
│       └── icons/
│           └── SettingsIcon.vue
│
├── config/             # 配置文件
│   └── apps.js        # 应用配置（集中管理所有应用）
│
├── router/             # 路由配置
│   └── index.js       # 路由定义
│
├── AppMain.vue        # 主应用入口
├── main.js            # 应用启动文件
└── style.css          # 全局样式
```

## 🚀 核心功能

### 1. 桌面系统 (Desktop.vue)
- 桌面图标展示
- 双击打开应用
- 应用窗口管理
- 窗口层级管理

### 2. 窗口系统 (Window.vue)
- 拖拽移动
- 调整大小
- 最小化/最大化/关闭
- 窗口层级控制

### 3. 任务栏 (Taskbar.vue)
- 应用快捷启动
- 窗口切换
- 时间显示
- 窗口状态管理

## 📱 应用开发指南

### 添加新应用

1. **创建应用文件夹**
```
src/apps/your-app/
├── YourApp.vue
└── icons/
    └── YourAppIcon.vue
```

2. **创建应用组件**
```vue
<template>
  <div class="your-app">
    <!-- 应用内容 -->
  </div>
</template>

<script>
export default {
  name: 'YourApp'
}
</script>

<style scoped>
.your-app {
  /* 应用样式 */
}
</style>
```

3. **创建应用图标**
```vue
<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <!-- 图标路径 -->
  </svg>
</template>

<script>
export default {
  name: 'YourAppIcon'
}
</script>
```

4. **注册应用**
在 `src/config/apps.js` 中添加：
```javascript
{
  id: 'your-app',
  name: '你的应用',
  icon: 'YourAppIcon',
  component: () => import('../apps/your-app/YourApp.vue'),
  defaultWidth: 800,
  defaultHeight: 600
}
```

5. **在 Desktop.vue 中导入图标**
```javascript
import YourAppIcon from '../apps/your-app/icons/YourAppIcon.vue'
```

## 🎯 特性

- ✅ 桌面风格界面
- ✅ 多窗口支持
- ✅ 窗口拖拽和缩放
- ✅ 任务栏管理
- ✅ 应用独立文件夹
- ✅ 模块化架构
- ✅ 高度可扩展

## 📝 注意事项

1. 每个应用应该独立管理自己的状态
2. 窗口大小和位置由桌面系统管理
3. 应用图标需要导入到 Desktop.vue 组件中
4. 应用配置集中在 `config/apps.js` 中管理

## 🔄 迁移说明

原有的浏览器控制功能已经迁移到 `src/apps/browser/BrowserApp.vue`，保留了所有原有功能：
- 6窗口多浏览器控制
- PageAgent 集成
- 脚本序列执行
- 页面变化监听
