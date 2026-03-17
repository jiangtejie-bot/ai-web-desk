<template>
  <div class="settings-app">
    <div class="settings-content">
      <div class="tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" />
          <span>{{ tab.name }}</span>
        </div>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'model'" class="tab-panel">
          <div class="panel-section">
            <h3>大模型配置</h3>
            <p class="section-desc">配置 PageAgent 使用的大语言模型参数</p>

            <div class="form-group">
              <label>模型名称</label>
              <input 
                v-model="config.model" 
                type="text" 
                placeholder="例如: deepseek-chat, gpt-4"
                class="form-input"
              />
              <span class="form-hint">支持 OpenAI 兼容的模型名称</span>
            </div>

            <div class="form-group">
              <label>API 地址</label>
              <input 
                v-model="config.baseURL" 
                type="text" 
                placeholder="https://api.openai.com/v1"
                class="form-input"
              />
              <span class="form-hint">API 服务的完整 URL</span>
            </div>

            <div class="form-group">
              <label>API 密钥</label>
              <input 
                v-model="config.apiKey" 
                type="password" 
                placeholder="sk-xxxxxxxxxxxx"
                class="form-input"
              />
              <span class="form-hint">用于身份验证的 API 密钥</span>
            </div>

            <div class="form-group">
              <label>语言</label>
              <select v-model="config.language" class="form-select">
                <option value="zh-CN">中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
              </select>
            </div>

            <div class="form-group">
              <label>自动观察页面</label>
              <div class="toggle-switch">
                <input 
                  id="autoObserve" 
                  v-model="config.autoObserve" 
                  type="checkbox"
                />
                <label for="autoObserve" class="toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>观察间隔 (毫秒)</label>
              <input 
                v-model.number="config.observeInterval" 
                type="number" 
                min="100" 
                max="5000"
                step="100"
                class="form-input"
              />
              <span class="form-hint">页面变化检测的时间间隔</span>
            </div>

            <div class="form-actions">
              <button @click="saveConfig" class="btn btn-primary">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polyline points="13 2 13 9 6 9"/>
                  <path d="M13 9L3 9L3 14"/>
                </svg>
                保存配置
              </button>
              <button @click="resetConfig" class="btn btn-secondary">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polyline points="2 2 14 14"/>
                  <polyline points="14 2 2 14"/>
                </svg>
                重置默认
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'interface'" class="tab-panel">
          <div class="panel-section">
            <h3>界面设置</h3>
            <p class="section-desc">自定义界面外观和行为</p>

            <div class="form-group">
              <label>主题颜色</label>
              <div class="color-options">
                <div 
                  v-for="color in themeColors" 
                  :key="color.value"
                  class="color-option"
                  :class="{ active: config.themeColor === color.value }"
                  :style="{ background: color.value }"
                  @click="config.themeColor = color.value"
                >
                  <svg v-if="config.themeColor === color.value" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="2">
                    <polyline points="2 8 6 12 14 4"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>窗口动画</label>
              <div class="toggle-switch">
                <input 
                  id="windowAnimation" 
                  v-model="config.windowAnimation" 
                  type="checkbox"
                />
                <label for="windowAnimation" class="toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>显示桌面图标</label>
              <div class="toggle-switch">
                <input 
                  id="showDesktopIcons" 
                  v-model="config.showDesktopIcons" 
                  type="checkbox"
                />
                <label for="showDesktopIcons" class="toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button @click="saveConfig" class="btn btn-primary">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polyline points="13 2 13 9 6 9"/>
                  <path d="M13 9L3 9L3 14"/>
                </svg>
                保存配置
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'about'" class="tab-panel">
          <div class="panel-section">
            <h3>关于</h3>
            <div class="about-content">
              <div class="app-info">
                <div class="app-logo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <h4>PageAgent Desktop</h4>
                <p class="version">版本 1.0.0</p>
              </div>
              
              <div class="info-section">
                <h5>功能特性</h5>
                <ul>
                  <li>多窗口浏览器控制</li>
                  <li>智能页面自动化</li>
                  <li>可拖拽脚本面板</li>
                  <li>灵活的配置管理</li>
                </ul>
              </div>

              <div class="info-section">
                <h5>技术栈</h5>
                <ul>
                  <li>Vue.js 3</li>
                  <li>Vite</li>
                  <li>PageAgent</li>
                  <li>Playwright</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast" :class="{ success: toastSuccess }">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <polyline points="2 8 6 12 14 4"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>
    
    <confirm-dialog
      v-if="showConfirm"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :type="confirmConfig.type"
      :confirm-text="confirmConfig.confirmText"
      :cancel-text="confirmConfig.cancelText"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script>
import { getConfig, saveConfig as saveConfigToStorage, resetConfig as resetConfigToStorage } from '../../config/pageagent.js'
import ModelIcon from './icons/ModelIcon.vue'
import InterfaceIcon from './icons/InterfaceIcon.vue'
import InfoIcon from './icons/InfoIcon.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'

export default {
  name: 'SettingsApp',
  components: {
    ModelIcon,
    InterfaceIcon,
    InfoIcon,
    ConfirmDialog
  },
  data() {
    return {
      activeTab: 'model',
      tabs: [
        { id: 'model', name: '模型配置', icon: 'ModelIcon' },
        { id: 'interface', name: '界面设置', icon: 'InterfaceIcon' },
        { id: 'about', name: '关于', icon: 'InfoIcon' }
      ],
      config: {},
      themeColors: [
        { value: '#667eea', name: '紫色' },
        { value: '#3b82f6', name: '蓝色' },
        { value: '#10b981', name: '绿色' },
        { value: '#f59e0b', name: '橙色' },
        { value: '#ef4444', name: '红色' }
      ],
      showToast: false,
      toastMessage: '',
      toastSuccess: true,
      showConfirm: false,
      confirmConfig: {
        title: '确认操作',
        message: '',
        type: 'warning',
        confirmText: '确定',
        cancelText: '取消'
      },
      pendingAction: null
    }
  },
  mounted() {
    this.config = getConfig()
  },
  methods: {
    saveConfig() {
      if (saveConfigToStorage(this.config)) {
        this.showToastMessage('配置保存成功', true)
      } else {
        this.showToastMessage('配置保存失败', false)
      }
    },
    resetConfig() {
      this.confirmConfig = {
        title: '重置配置',
        message: '确定要重置为默认配置吗？此操作将恢复所有设置为初始值。',
        type: 'warning',
        confirmText: '重置',
        cancelText: '取消'
      }
      this.pendingAction = () => {
        resetConfigToStorage()
        this.config = getConfig()
        this.showToastMessage('配置已重置', true)
      }
      this.showConfirm = true
    },
    showToastMessage(message, success) {
      this.toastMessage = message
      this.toastSuccess = success
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 3000)
    },
    handleConfirm() {
      if (this.pendingAction) {
        this.pendingAction()
        this.pendingAction = null
      }
      this.showConfirm = false
    }
  }
}
</script>

<style scoped>
.settings-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  position: absolute;
  inset: 0;
}

.settings-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.tabs {
  width: 200px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  font-size: 14px;
}

.tab-item:hover {
  background: #f5f5f5;
  color: #333;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tab-item svg {
  width: 18px;
  height: 18px;
}

.tab-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}

.tab-panel {
  max-width: 600px;
}

.panel-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.panel-section h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.section-desc {
  margin: 0 0 24px 0;
  font-size: 13px;
  color: #999;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.toggle-switch {
  display: flex;
  align-items: center;
}

.toggle-switch input {
  display: none;
}

.toggle-label {
  position: relative;
  width: 48px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-switch input:checked + .toggle-label {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch input:checked + .toggle-label .toggle-slider {
  left: 26px;
}

.color-options {
  display: flex;
  gap: 12px;
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #333;
}

.color-option svg {
  width: 16px;
  height: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn svg {
  width: 16px;
  height: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #f5f5f5;
  color: #333;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.app-info {
  text-align: center;
  padding: 20px;
}

.app-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-logo svg {
  width: 32px;
  height: 32px;
  color: white;
}

.app-info h4 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.version {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.info-section h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.info-section ul {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #666;
}

.info-section li {
  margin-bottom: 8px;
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  color: #10b981;
  border-left: 4px solid #10b981;
}

.toast:not(.success) {
  color: #ef4444;
  border-left: 4px solid #ef4444;
}

.toast svg {
  width: 18px;
  height: 18px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
