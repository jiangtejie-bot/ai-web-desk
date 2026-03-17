<template>
  <div class="taskbar">
    <div class="taskbar-start">
      <button class="start-btn" @click="$emit('start-menu')">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
        </svg>
      </button>
    </div>

    <div class="taskbar-search">
      <div class="search-box" @click="$emit('open-assistant')">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <span class="search-placeholder">智能助手</span>
      </div>
    </div>

    <div class="taskbar-windows">
      <div 
        v-for="window in windows" 
        :key="window.id"
        class="taskbar-window"
        @click="handleWindowClick(window)"
        :class="{ 
          active: window.zIndex === maxZIndex && !window.minimized,
          minimized: window.minimized
        }"
      >
        <div class="window-icon">
          <component :is="window.app.icon" />
        </div>
        <span class="window-title">{{ window.title }}</span>
        <button 
          class="window-close" 
          @click.stop="$emit('close-window', window.id)"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="1" y1="1" x2="11" y2="11"/>
            <line x1="1" y1="11" x2="11" y2="1"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="taskbar-tray">
      <div class="tray-clock" @click="showCalendar = !showCalendar">
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>
    </div>

    <calendar-dialog 
      v-if="showCalendar"
      @close="showCalendar = false"
    />
  </div>
</template>

<script>
import CalendarDialog from './CalendarDialog.vue'

export default {
  name: 'Taskbar',
  components: {
    CalendarDialog
  },
  props: {
    windows: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentTime: '',
      currentDate: '',
      showCalendar: false,
      timerInterval: null
    }
  },
  computed: {
    maxZIndex() {
      return Math.max(...this.windows.map(w => w.zIndex), 0)
    }
  },
  mounted() {
    this.updateTime()
    this.timerInterval = setInterval(this.updateTime, 1000)
  },
  beforeDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval)
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      this.currentDate = now.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    },
    handleWindowClick(window) {
      if (window.minimized) {
        this.$emit('minimize-window', window.id)
      } else {
        this.$emit('focus-window', window.id)
      }
    }
  }
}
</script>

<style scoped>
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 8px;
  z-index: 9999;
}

.taskbar-start {
  display: flex;
  align-items: center;
}

.start-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.start-btn svg {
  width: 20px;
  height: 20px;
  color: white;
}

.taskbar-search {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.search-box {
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-box:hover {
  background: rgba(0, 0, 0, 0.08);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: #999;
}

.search-placeholder {
  font-size: 13px;
  color: #999;
}

.taskbar-windows {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding: 0 8px;
}

.taskbar-window {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 0;
  max-width: 200px;
  background: rgba(0, 0, 0, 0.03);
}

.taskbar-window:hover {
  background: rgba(0, 0, 0, 0.08);
}

.taskbar-window.active {
  background: rgba(102, 126, 234, 0.15);
  border-bottom: 2px solid #667eea;
}

.taskbar-window.minimized {
  background: rgba(102, 126, 234, 0.1);
  border-bottom: 2px solid #667eea;
}

.window-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.window-icon svg {
  width: 16px;
  height: 16px;
}

.window-title {
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.window-close {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.taskbar-window:hover .window-close {
  opacity: 1;
}

.window-close:hover {
  background: rgba(255, 95, 87, 0.2);
}

.window-close svg {
  width: 10px;
  height: 10px;
  color: #ff5f57;
}

.taskbar-tray {
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.tray-clock {
  text-align: right;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
  cursor: pointer;
}

.tray-clock:hover {
  background: rgba(0, 0, 0, 0.05);
}

.time {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.date {
  font-size: 11px;
  color: #666;
}
</style>
