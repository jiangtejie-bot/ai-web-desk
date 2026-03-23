<template>
  <div class="desktop">
    <div class="desktop-background"></div>
    <div class="desktop-grid"></div>
    
    <div class="desktop-icons">
      <div 
        v-for="app in apps" 
        :key="app.id"
        class="desktop-icon"
        :class="{ 
          selected: selectedApp === app.id,
          dragging: draggingApp === app.id
        }"
        :style="{ 
          left: app.iconX + 'px', 
          top: app.iconY + 'px'
        }"
        @dblclick="openApp(app)"
        @click="selectApp(app)"
        @mousedown="startDragIcon($event, app)"
      >
        <div class="icon-container">
          <Icon :icon="app.icon" :width="48" :height="48" />
        </div>
        <span class="icon-label">{{ app.name }}</span>
      </div>
    </div>

    <div class="windows-container">
      <window
        v-for="window in windows"
        :key="window.id"
        :title="window.title"
        :minimized="window.minimized"
        :maximized="window.maximized"
        :z-index="window.zIndex"
        :x="window.x"
        :y="window.y"
        :width="window.width"
        :height="window.height"
        @close="closeWindow(window.id)"
        @minimize="minimizeWindow(window.id)"
        @maximize="maximizeWindow(window.id)"
        @focus="focusWindow(window.id)"
        @mousedown="focusWindow(window.id)"
        @update:position="updateWindowPosition(window.id, $event)"
        @update:size="updateWindowSize(window.id, $event)"
        @content-resize="handleWindowContentResize(window.id)"
      >
        <component 
          :is="window.component" 
          v-bind="window.props"
          @openGame="handleOpenGame"
        />
      </window>
    </div>

    <taskbar 
      :windows="windows"
      @focus-window="focusWindow"
      @minimize-window="minimizeWindow"
      @close-window="closeWindow"
      @open-assistant="openAssistant"
      @open-app="openApp"
      @open-settings="openSettings"
      @power-off="lockScreen"
    />

    <lock-screen 
      v-if="isLocked"
      @login="handleLogin"
    />

    <assistant-dialog 
      v-if="showAssistant"
      @close="showAssistant = false"
    />

    <confirm-dialog
      v-if="showConfirmDialog"
      :title="confirmDialogConfig.title"
      :message="confirmDialogConfig.message"
      :type="confirmDialogConfig.type"
      :confirm-text="confirmDialogConfig.confirmText"
      :cancel-text="confirmDialogConfig.cancelText"
      @confirm="handleConfirm"
      @cancel="showConfirmDialog = false"
    />

    <div 
      class="fullscreen-prompt"
      v-if="showFullscreenPrompt"
    >
      <div class="fullscreen-prompt-content">
        <div class="fullscreen-prompt-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
            <path d="M8 21H5a2 2 0 0 0-2 2v-3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
          </svg>
        </div>
        <h3 class="fullscreen-prompt-title">是否全屏显示？</h3>
        <p class="fullscreen-prompt-text">全屏模式可以提供更好的浏览体验</p>
        <div class="fullscreen-prompt-actions">
          <button class="fullscreen-prompt-btn fullscreen-prompt-btn-primary" @click="acceptDesktopFullscreen">
            是，全屏显示
          </button>
          <button class="fullscreen-prompt-btn fullscreen-prompt-btn-secondary" @click="rejectDesktopFullscreen">
            否，保持当前状态
          </button>
        </div>
        <div class="fullscreen-prompt-remember">
          <input 
            type="checkbox" 
            id="rememberDesktopFullscreen" 
            v-model="rememberFullscreen"
          />
          <label for="rememberDesktopFullscreen">记住我的选择</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { apps } from '../config/apps.js'
import Window from './Window.vue'
import Taskbar from './Taskbar.vue'
import AssistantDialog from './AssistantDialog.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import LockScreen from './LockScreen.vue'
import { Icon } from '@iconify/vue'
import { storage } from '../utils/crypto'

export default {
  name: 'Desktop',
  components: {
    Window,
    Taskbar,
    AssistantDialog,
    ConfirmDialog,
    LockScreen,
    Icon
  },
  data() {
    return {
      apps: apps.filter(app => !app.systemApp).map((app, index) => ({
        ...app,
        iconX: 0,
        iconY: index * 110
      })),
      selectedApp: null,
      windows: [],
      windowIdCounter: 0,
      zIndexCounter: 100,
      showAssistant: false,
      showConfirmDialog: false,
      isLocked: false,
      currentUser: storage.getItem('currentUser') || '',
      confirmDialogConfig: {
        title: '',
        message: '',
        type: 'warning',
        confirmText: '确定',
        cancelText: '取消'
      },
      confirmCallback: null,
      draggingApp: null,
      dragOffset: { x: 0, y: 0 },
      gridSize: 110,
      iconWidth: 100,
      iconHeight: 100,
      isDragging: false,
      dragStartTime: 0,
      fullscreenState: {
        isFullscreen: false
      },
      autoFullscreen: storage.getItem('desktopAutoFullscreen') === 'true',
      showFullscreenPrompt: false,
      rememberFullscreen: false
    }
  },
  mounted() {
    console.log('Desktop mounted')
    document.addEventListener('mousemove', this.onDragIcon)
    document.addEventListener('mouseup', this.stopDragIcon)

    this.checkFullscreenStatus()
    document.addEventListener('fullscreenchange', this.handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange)

    this.checkFullscreenPreference()
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.onDragIcon)
    document.removeEventListener('mouseup', this.stopDragIcon)

    document.removeEventListener('fullscreenchange', this.handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange)
  },
  methods: {
    checkFullscreenStatus() {
      this.fullscreenState.isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      console.log('Desktop checkFullscreenStatus - isFullscreen:', this.fullscreenState.isFullscreen)
    },
    handleFullscreenChange() {
      this.checkFullscreenStatus()
      console.log('Desktop handleFullscreenChange - isFullscreen:', this.fullscreenState.isFullscreen)
    },
    enterFullscreen(element = document.documentElement) {
      console.log('Desktop enterFullscreen')
      try {
        if (element?.requestFullscreen) {
          return element.requestFullscreen()
        }
        if (element?.webkitRequestFullscreen) {
          return element.webkitRequestFullscreen()
        }
        if (element?.mozRequestFullScreen) {
          return element.mozRequestFullScreen()
        }
        if (element?.msRequestFullscreen) {
          return element.msRequestFullscreen()
        }
      } finally {
        // 让 UI 及时更新（最终状态以 fullscreenchange 为准）
        this.checkFullscreenStatus()
      }
    },
    exitFullscreen() {
      console.log('Desktop exitFullscreen')
      try {
        if (document.exitFullscreen) {
          return document.exitFullscreen()
        }
        if (document.webkitExitFullscreen) {
          return document.webkitExitFullscreen()
        }
        if (document.mozCancelFullScreen) {
          return document.mozCancelFullScreen()
        }
        if (document.msExitFullscreen) {
          return document.msExitFullscreen()
        }
      } finally {
        this.checkFullscreenStatus()
      }
    },
    toggleFullscreen() {
      if (this.fullscreenState.isFullscreen) {
        return this.exitFullscreen()
      }
      return this.enterFullscreen()
    },
    checkFullscreenPreference() {
      const shouldFullscreen = storage.getItem('desktopAutoFullscreen') === 'true'
      console.log('Desktop checkFullscreenPreference - shouldFullscreen:', shouldFullscreen, 'isFullscreen:', this.fullscreenState.isFullscreen)
      if (shouldFullscreen && !this.fullscreenState.isFullscreen) {
        // 桌面首次进入时，根据偏好自动全屏
        this.$nextTick(() => {
          this.enterFullscreen()
        })
      } else if (!shouldFullscreen && !this.fullscreenState.isFullscreen) {
        this.showFullscreenPromptIfNeeded()
      }
    },
    showFullscreenPromptIfNeeded() {
      const hasPreference = storage.getItem('desktopAutoFullscreen') !== null
      console.log('Desktop showFullscreenPromptIfNeeded - hasPreference:', hasPreference, 'isFullscreen:', this.fullscreenState.isFullscreen)
      if (!hasPreference && !this.fullscreenState.isFullscreen) {
        setTimeout(() => {
          console.log('Desktop showing fullscreen prompt')
          this.showFullscreenPrompt = true
        }, 800)
      }
    },
    acceptDesktopFullscreen() {
      console.log('Desktop acceptDesktopFullscreen - rememberFullscreen:', this.rememberFullscreen)
      if (this.rememberFullscreen) {
        storage.setItem('desktopAutoFullscreen', 'true')
        this.autoFullscreen = true
      }
      this.showFullscreenPrompt = false
      this.enterFullscreen()
    },
    rejectDesktopFullscreen() {
      console.log('Desktop rejectDesktopFullscreen - rememberFullscreen:', this.rememberFullscreen)
      if (this.rememberFullscreen) {
        storage.setItem('desktopAutoFullscreen', 'false')
        this.autoFullscreen = false
      }
      this.showFullscreenPrompt = false
    },
    selectApp(app) {
      this.selectedApp = app.id
    },
    startDragIcon(event, app) {
      if (event.button !== 0) return
      
      this.draggingApp = app.id
      this.dragOffset = {
        x: event.clientX - app.iconX,
        y: event.clientY - app.iconY
      }
      this.dragStartTime = Date.now()
      this.isDragging = false
    },
    onDragIcon(event) {
      if (!this.draggingApp) return
      
      const app = this.apps.find(a => a.id === this.draggingApp)
      if (!app) return
      
      const moveDistance = Math.abs(event.clientX - (app.iconX + this.dragOffset.x)) + 
                          Math.abs(event.clientY - (app.iconY + this.dragOffset.y))
      
      if (moveDistance > 5) {
        this.isDragging = true
      }
      
      let newX = event.clientX - this.dragOffset.x
      let newY = event.clientY - this.dragOffset.y
      
      const desktopWidth = window.innerWidth
      const desktopHeight = window.innerHeight - 48
      
      newX = Math.max(0, Math.min(newX, desktopWidth - this.iconWidth))
      newY = Math.max(0, Math.min(newY, desktopHeight - this.iconHeight))
      
      app.iconX = newX
      app.iconY = newY
    },
    stopDragIcon() {
      if (!this.draggingApp) return
      
      const dragDuration = Date.now() - this.dragStartTime
      
      if (!this.isDragging && dragDuration < 200) {
        const app = this.apps.find(a => a.id === this.draggingApp)
        if (app) {
          this.selectApp(app)
        }
      } else {
        const app = this.apps.find(a => a.id === this.draggingApp)
        if (app) {
          const desktopWidth = window.innerWidth
          const desktopHeight = window.innerHeight - 48
          
          const maxGridX = Math.floor((desktopWidth - this.iconWidth) / this.gridSize)
          const maxGridY = Math.floor((desktopHeight - this.iconHeight) / this.gridSize)
          
          let gridX = Math.round(app.iconX / this.gridSize)
          let gridY = Math.round(app.iconY / this.gridSize)
          
          gridX = Math.max(0, Math.min(gridX, maxGridX))
          gridY = Math.max(0, Math.min(gridY, maxGridY))
          
          app.iconX = gridX * this.gridSize
          app.iconY = gridY * this.gridSize
        }
      }
      
      this.draggingApp = null
      this.isDragging = false
    },
    async openApp(app) {
      const existingWindow = this.windows.find(w => w.appId === app.id && !w.minimized)
      if (existingWindow) {
        this.focusWindow(existingWindow.id)
        return
      }

      const minimizedWindow = this.windows.find(w => w.appId === app.id && w.minimized)
      if (minimizedWindow) {
        this.minimizeWindow(minimizedWindow.id)
        return
      }

      this.windowIdCounter++
      this.zIndexCounter++

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const windowWidth = app.defaultWidth || 800
      const windowHeight = app.defaultHeight || 600
      
      const component = await app.component()
      
      const newWindow = {
        id: this.windowIdCounter,
        appId: app.id,
        app: app,
        component: markRaw(component.default),
        title: app.name,
        minimized: false,
        maximized: false,
        zIndex: this.zIndexCounter,
        x: Math.floor((viewportWidth - windowWidth) / 2),
        y: Math.floor((viewportHeight - windowHeight) / 2),
        width: windowWidth,
        height: windowHeight,
        savedState: null,
        props: app.id === 'browser'
          ? {
              fullscreenState: this.fullscreenState,
              fullscreenActions: {
                toggle: () => this.toggleFullscreen(),
                enter: () => this.enterFullscreen(),
                exit: () => this.exitFullscreen()
              }
            }
          : {}
      }

      this.windows.push(newWindow)
    },
    closeWindow(windowId) {
      const index = this.windows.findIndex(w => w.id === windowId)
      if (index !== -1) {
        this.windows.splice(index, 1)
      }
    },
    minimizeWindow(windowId) {
      const window = this.windows.find(w => w.id === windowId)
      if (window) {
        window.minimized = !window.minimized
      }
    },
    maximizeWindow(windowId) {
      const window = this.windows.find(w => w.id === windowId)
      if (window) {
        if (!window.maximized) {
          window.savedState = {
            x: window.x,
            y: window.y,
            width: window.width,
            height: window.height
          }
        } else {
          if (window.savedState) {
            window.x = window.savedState.x
            window.y = window.savedState.y
            window.width = window.savedState.width
            window.height = window.savedState.height
          }
        }
        window.maximized = !window.maximized
        this.focusWindow(windowId)
      }
    },
    focusWindow(windowId) {
      const window = this.windows.find(w => w.id === windowId)
      if (window) {
        this.zIndexCounter++
        window.zIndex = this.zIndexCounter
        window.minimized = false
      }
    },
    updateWindowPosition(windowId, position) {
      const window = this.windows.find(w => w.id === windowId)
      if (window && !window.maximized) {
        window.x = position.x
        window.y = position.y
      }
    },
    updateWindowSize(windowId, size) {
      const window = this.windows.find(w => w.id === windowId)
      if (window && !window.maximized) {
        window.width = size.width
        window.height = size.height
      }
    },
    handleWindowContentResize(windowId) {
      const window = this.windows.find(w => w.id === windowId)
      if (window && window.appId === 'slacking') {
        this.$nextTick(() => {
          const windowEl = document.querySelector(`.window[data-window-id="${windowId}"]`)
          if (windowEl) {
            const contentEl = windowEl.querySelector('.window-content')
            if (contentEl) {
              const event = new CustomEvent('window-resize', {
                detail: { height: contentEl.clientHeight },
                bubbles: true,
                composed: true
              })
              contentEl.dispatchEvent(event)
            }
          }
        })
      }
    },
    openAssistant() {
      this.showAssistant = true
    },
    openCalculator() {
      const calculatorApp = {
        id: 'calculator',
        name: '计算器',
        component: () => import('../apps/calculator/CalculatorApp.vue'),
        defaultWidth: 320,
        defaultHeight: 480
      }
      this.openApp(calculatorApp)
    },
    openSettings() {
      const settingsApp = this.apps.find(app => app.id === 'settings')
      if (settingsApp) {
        this.openApp(settingsApp)
      }
    },
    lockScreen() {
      this.isLocked = true
    },
    handleLogin(username) {
      this.currentUser = username
      storage.setItem('currentUser', username)
      this.isLocked = false
    },
    powerOff() {
      this.confirmDialogConfig = {
        title: '确认关机',
        message: '确定要关闭系统吗？所有未保存的数据可能会丢失。',
        type: 'danger',
        confirmText: '关机',
        cancelText: '取消'
      }
      this.confirmCallback = () => {
        alert('系统关机中...')
      }
      this.showConfirmDialog = true
    },
    handleConfirm() {
      if (this.confirmCallback) {
        this.confirmCallback()
      }
      this.showConfirmDialog = false
    },
    async handleOpenGame(gameId) {
      const gameApps = {
        'werewolf': {
          id: 'werewolf',
          name: '狼人杀',
          component: () => import('../apps/slacking/games/WerewolfGame.vue'),
          defaultWidth: 800,
          defaultHeight: 600
        },
        'undercover': {
          id: 'undercover',
          name: '谁是卧底',
          component: () => import('../apps/slacking/games/UndercoverGame.vue'),
          defaultWidth: 800,
          defaultHeight: 600
        }
      }
      
      const gameApp = gameApps[gameId]
      if (!gameApp) return
      
      this.windowIdCounter++
      this.zIndexCounter++
      
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const windowWidth = gameApp.defaultWidth || 800
      const windowHeight = gameApp.defaultHeight || 600
      
      const component = await gameApp.component()
      
      const newWindow = {
        id: this.windowIdCounter,
        appId: 'game-' + gameId,
        app: gameApp,
        component: markRaw(component.default),
        title: gameApp.name,
        minimized: false,
        maximized: false,
        zIndex: this.zIndexCounter,
        x: Math.floor((viewportWidth - windowWidth) / 2) + 50,
        y: Math.floor((viewportHeight - windowHeight) / 2) + 50,
        width: windowWidth,
        height: windowHeight,
        savedState: null
      }
      
      this.windows.push(newWindow)
    }
  }
}
</script>

<style scoped>
.desktop {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.desktop-background {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.desktop-grid {
  position: absolute;
  inset: 0;
  bottom: 48px;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 110px 110px;
  pointer-events: none;
  z-index: 0;
}

.desktop-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 48px;
  z-index: 1;
}

.desktop-icon {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s;
  width: 100px;
  height: 100px;
  user-select: none;
  box-sizing: border-box;
}

.desktop-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.desktop-icon.selected {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.desktop-icon.dragging {
  opacity: 0.8;
  cursor: grabbing;
}

.icon-container {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.icon-container svg {
  width: 40px;
  height: 40px;
  color: white;
}

.icon-label {
  font-size: 12px;
  color: white;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  word-break: break-word;
}

.windows-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.windows-container :deep(.window) {
  pointer-events: auto;
}

.fullscreen-prompt {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fullscreen-prompt-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fullscreen-prompt-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.fullscreen-prompt-icon svg {
  width: 32px;
  height: 32px;
}

.fullscreen-prompt-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.fullscreen-prompt-text {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px;
}

.fullscreen-prompt-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.fullscreen-prompt-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.fullscreen-prompt-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.fullscreen-prompt-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.fullscreen-prompt-btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.fullscreen-prompt-btn-secondary:hover {
  background: #e8e8e8;
}

.fullscreen-prompt-remember {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.fullscreen-prompt-remember input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #667eea;
}

.fullscreen-prompt-remember label {
  cursor: pointer;
  user-select: none;
}
</style>
