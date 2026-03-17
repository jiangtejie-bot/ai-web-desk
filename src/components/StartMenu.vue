<template>
  <div class="start-menu-overlay" @click="$emit('close')">
    <div class="start-menu" @click.stop>
      <div class="start-menu-header">
        <div class="user-info">
          <div class="user-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="user-name">用户</div>
        </div>
      </div>

      <div class="start-menu-content">
        <div class="menu-section">
          <div class="section-title">应用</div>
          <div class="app-grid">
            <div 
              v-for="app in apps" 
              :key="app.id"
              class="app-item"
              @click="openApp(app)"
            >
              <div class="app-icon">
                <component :is="app.icon" />
              </div>
              <span class="app-name">{{ app.name }}</span>
            </div>
          </div>
        </div>

        <div class="menu-section">
          <div class="section-title">工具</div>
          <div class="tool-list">
            <div class="tool-item">
              <div class="tool-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <span class="tool-name">日历</span>
            </div>
            <div class="tool-item">
              <div class="tool-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span class="tool-name">时钟</span>
            </div>
          </div>
        </div>
      </div>

      <div class="start-menu-footer">
        <button class="footer-btn" @click="$emit('open-settings')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>设置</span>
        </button>
        <button class="footer-btn power-btn" @click="$emit('power-off')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
            <line x1="12" y1="2" x2="12" y2="12"/>
          </svg>
          <span>关机</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { apps } from '../config/apps.js'
import BrowserIcon from '../apps/browser/icons/BrowserIcon.vue'
import SettingsIcon from '../apps/settings/icons/SettingsIcon.vue'
import TVIcon from '../apps/tv/icons/TVIcon.vue'
import BookmarkIcon from '../apps/bookmarks/icons/BookmarkIcon.vue'
import TranslatorIcon from '../apps/translator/icons/TranslatorIcon.vue'
import SlackingIcon from '../apps/slacking/icons/SlackingIcon.vue'
import CalculatorIcon from '../apps/calculator/icons/CalculatorIcon.vue'

export default {
  name: 'StartMenu',
  components: {
    BrowserIcon,
    SettingsIcon,
    TVIcon,
    BookmarkIcon,
    TranslatorIcon,
    SlackingIcon,
    CalculatorIcon
  },
  data() {
    return {
      apps: apps.map(app => ({
        ...app,
        icon: markRaw(this.getIconComponent(app.icon))
      }))
    }
  },
  methods: {
    getIconComponent(iconName) {
      const iconMap = {
        BrowserIcon,
        SettingsIcon,
        TVIcon,
        BookmarkIcon,
        TranslatorIcon,
        SlackingIcon,
        CalculatorIcon
      }
      return iconMap[iconName] || BrowserIcon
    },
    openApp(app) {
      this.$emit('open-app', app)
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.start-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
}

.start-menu {
  width: 600px;
  height: 500px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
  margin-bottom: 56px;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.start-menu-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar svg {
  width: 28px;
  height: 28px;
  color: white;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.start-menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.menu-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 12px;
  padding-left: 8px;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.app-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.app-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.app-name {
  font-size: 12px;
  color: #333;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.tool-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 4px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.tool-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.15);
}

.tool-icon svg {
  width: 18px;
  height: 18px;
  color: #667eea;
}

.tool-name {
  font-size: 13px;
  color: #333;
}

.start-menu-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #333;
}

.footer-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.footer-btn svg {
  width: 18px;
  height: 18px;
}

.power-btn:hover {
  background: rgba(255, 95, 87, 0.1);
  color: #ff5f57;
}

.power-btn:hover svg {
  color: #ff5f57;
}
</style>
