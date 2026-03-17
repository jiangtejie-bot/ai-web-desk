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
          <component :is="app.icon" />
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
        :width="window.width"
        :height="window.height"
        :style="!window.maximized ? { 
          left: window.x + 'px', 
          top: window.y + 'px'
        } : {}"
        @close="closeWindow(window.id)"
        @minimize="minimizeWindow(window.id)"
        @maximize="maximizeWindow(window.id)"
        @focus="focusWindow(window.id)"
        @mousedown="focusWindow(window.id)"
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
    />

    <assistant-dialog 
      v-if="showAssistant"
      @close="showAssistant = false"
    />
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { apps } from '../config/apps.js'
import Window from './Window.vue'
import Taskbar from './Taskbar.vue'
import AssistantDialog from './AssistantDialog.vue'
import BrowserIcon from '../apps/browser/icons/BrowserIcon.vue'
import SettingsIcon from '../apps/settings/icons/SettingsIcon.vue'
import TVIcon from '../apps/tv/icons/TVIcon.vue'
import BookmarkIcon from '../apps/bookmarks/icons/BookmarkIcon.vue'
import TranslatorIcon from '../apps/translator/icons/TranslatorIcon.vue'
import SlackingIcon from '../apps/slacking/icons/SlackingIcon.vue'

export default {
  name: 'Desktop',
  components: {
    Window,
    Taskbar,
    AssistantDialog,
    BrowserIcon,
    SettingsIcon,
    TVIcon,
    BookmarkIcon,
    TranslatorIcon,
    SlackingIcon
  },
  data() {
    return {
      apps: apps.map((app, index) => ({
        ...app,
        iconX: 0,
        iconY: index * 110
      })),
      selectedApp: null,
      windows: [],
      windowIdCounter: 0,
      zIndexCounter: 100,
      showAssistant: false,
      draggingApp: null,
      dragOffset: { x: 0, y: 0 },
      gridSize: 110,
      iconWidth: 100,
      iconHeight: 100,
      isDragging: false,
      dragStartTime: 0
    }
  },
  mounted() {
    document.addEventListener('mousemove', this.onDragIcon)
    document.addEventListener('mouseup', this.stopDragIcon)
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.onDragIcon)
    document.removeEventListener('mouseup', this.stopDragIcon)
  },
  methods: {
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
        savedState: null
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
    openAssistant() {
      this.showAssistant = true
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
</style>
