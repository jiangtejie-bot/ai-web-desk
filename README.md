# AI Web Desk

一个基于 Vue 3 的桌面风格 Web 应用平台，提供多种实用工具和娱乐功能，采用 Windows 桌面设计理念，支持多窗口、拖拽、任务栏管理等桌面特性。

## ✨ 核心特性

- 🖥️ **桌面风格界面** - 模拟 Windows 桌面体验，支持桌面图标、多窗口管理
- 🪟 **完整窗口系统** - 支持窗口拖拽、缩放、最小化、最大化、层级控制
- 🔐 **用户登录系统** - 用户名密码登录，密码加密存储
- 🔒 **数据加密** - 所有本地存储数据自动加密保护
- 📊 **多浏览器控制** - 6窗口并发控制，集成 PageAgent AI 自动化
- 🎬 **电视直播** - 支持多种直播源，流畅的视频播放体验
- 🔖 **地球书签** - 分类管理书签，快速访问常用网站
- 🎮 **上班摸鱼** - 聊天室和游戏中心（卧底游戏、狼人杀游戏）
- ⚙️ **系统设置** - 界面、模型、信息等系统配置

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 📁 项目结构

```
src/
├── components/           # 核心组件
│   ├── Desktop.vue      # 桌面主界面
│   ├── Window.vue       # 窗口组件（支持拖拽、缩放、最小化、最大化）
│   ├── Taskbar.vue      # 任务栏组件
│   ├── LockScreen.vue   # 锁屏组件
│   ├── ConfirmDialog.vue # 确认对话框组件
│   └── ...
│
├── views/               # 页面视图
│   └── Login.vue        # 登录页面
│
├── apps/               # 应用程序目录（每个应用独立文件夹）
│   ├── browser/        # 浏览器控制应用
│   ├── settings/       # 系统设置应用
│   ├── tv/             # 电视直播应用
│   ├── bookmarks/      # 地球书签应用
│   └── slacking/       # 上班摸鱼应用
│       ├── components/
│       │   ├── ChatRoom.vue
│       │   └── GameCenter.vue
│       └── games/
│           ├── UndercoverGame.vue
│           └── WerewolfGame.vue
│
├── config/             # 配置文件
│   ├── apps.js        # 应用配置（集中管理所有应用）
│   ├── modules.js     # 模块配置
│   └── pageagent.js   # PageAgent 配置
│
├── router/             # 路由配置
│   └── index.js       # 路由定义（包含登录守卫）
│
├── utils/              # 工具函数
│   ├── crypto.js      # 数据加密工具
│   └── worker.js      # Web Worker
│
├── App.vue             # 应用根组件
├── AppMain.vue         # 主应用入口
├── main.js             # 应用启动文件
└── style.css           # 全局样式
```

## 🎯 核心功能介绍

### 用户登录系统
- 用户名密码登录（密码暂时为 12138）
- 路由守卫确保用户必须登录才能访问系统
- 登录状态持久化存储

### 数据加密
- 使用 AES 加密算法保护本地存储数据
- 统一的加密存储接口
- 自动加密/解密数据

### 浏览器控制
- 支持 6 个浏览器窗口并发控制
- 集成 PageAgent AI 自动化
- 脚本序列执行
- 页面变化监听
- 开发者工具支持

### 电视直播
- 支持添加自定义直播源
- 基于 Video.js 的流畅播放
- 直播源分类管理

### 地球书签
- 书签分类管理
- 快速添加和编辑书签
- 一键访问常用网站

### 上班摸鱼
- 聊天室功能
- 游戏中心
  - 卧底游戏
  - 狼人杀游戏

### 系统设置
- 界面主题设置
- AI 模型配置
- 系统信息查看

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - Vue.js 官方路由管理器
- **CryptoJS** - 数据加密库
- **PageAgent** - AI 自动化工具
- **Puppeteer** - 无头浏览器自动化
- **Playwright** - 浏览器自动化测试
- **Video.js** - HTML5 视频播放器

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

## 🎨 设计理念

采用 Windows 桌面风格设计，每个功能模块作为一个独立的"应用程序"，可以在桌面上通过双击图标打开，在窗口中运行，支持多窗口、拖拽、最小化、最大化等功能。

## 🔒 安全特性

- **用户认证**：强制登录才能访问系统
- **数据加密**：所有本地存储数据自动加密
- **路由守卫**：防止未授权访问
- **密码验证**：确保只有授权用户才能登录

## 📝 许可证

本项目基于 MIT 许可证开源。

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [PageAgent 文档](https://pageagent.dev/)
- [CryptoJS 文档](https://cryptojs.gitbook.io/docs/)