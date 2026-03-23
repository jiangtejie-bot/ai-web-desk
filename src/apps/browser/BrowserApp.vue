<template>
  <div class="browser-app">
    <div class="app-header">
      <div class="url-input-group">
        <select v-model="selectedWindowIndex" class="window-selector">
          <option v-for="(win, index) in windows" :key="win.id" :value="index">
            窗口 {{ win.id }}
          </option>
        </select>
        <input 
          v-model="targetUrl" 
          type="text" 
          placeholder="输入要自动化测试的网页地址..."
          @keyup.enter="loadUrl(targetUrl, true)"
          class="url-input"
        />
        <button class="load-btn" @click="loadUrl(targetUrl, false)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        <button class="fullscreen-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '进入全屏'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!isFullscreen" d="M8 3H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
            <path v-if="!isFullscreen" d="M8 21H5a2 2 0 0 0-2 2v-3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
            <path v-if="isFullscreen" d="M7 21h10a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2z"/>
            <path v-if="isFullscreen" d="M9 9h6v6h-6V9z"/>
          </svg>
        </button>
        <div class="fullscreen-option">
          <input
            type="checkbox"
            id="autoFullscreen"
            v-model="autoFullscreen"
            @change="saveFullscreenPreference"
          />
          <label for="autoFullscreen">自动全屏</label>
        </div>
      </div>
    </div>

    <div class="windows-grid">
      <div 
        v-for="(win, index) in windows" 
        :key="win.id"
        class="window-item"
        :class="{ 'selected': selectedWindowIndex === index }"
        @click="selectWindow(index)"
      >
        <div class="window-header">
          <div class="window-title">
            <span class="window-number">{{ win.id }}</span>
            <span class="window-domain">{{ win.currentDomain || '未加载' }}</span>
          </div>
          <div class="window-actions">
            <button class="window-action-btn" @click.stop="refreshViewer(index)" title="刷新">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="15 3 15 8 10 8"/>
                <path d="M13.66 10a6 6 0 1 1-1.41-6.24L15 8"/>
              </svg>
            </button>
            <button class="window-action-btn" @click.stop="closeViewer(index)" title="关闭">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="12" y1="4" x2="4" y2="12"/>
                <line x1="4" y1="4" x2="12" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="window-content">
          <div class="loading-overlay" v-if="win.isLoading">
            <div class="loader">
              <div class="loader-ring"></div>
              <div class="loader-ring"></div>
              <div class="loader-ring"></div>
              <span>加载中...</span>
            </div>
          </div>
          
          <div class="empty-state" v-if="!win.iframeSrc && !win.isLoading">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <span>窗口 {{ win.id }}</span>
          </div>
          
          <iframe 
            v-if="win.iframeSrc"
            :ref="'viewerFrame' + index"
            :src="win.iframeSrc"
            class="viewer-frame"
            @load="onFrameLoad(index)"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-top-navigation-by-user-activation"
          ></iframe>
        </div>
      </div>
    </div>

    <div 
      class="script-panel"
      :class="{ 'collapsed': !scriptPanelOpen }"
      :style="{ left: scriptPanelPosition.x + 'px', top: scriptPanelPosition.y + 'px' }"
    >
      <div class="script-panel-header" @mousedown="startDrag">
        <div class="panel-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
          <span>脚本序列</span>
        </div>
        <div class="panel-actions">
          <button class="panel-action-btn" @click="executeScript" :disabled="isExecuting" title="执行脚本">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="5 3 5 13 13 8"/>
            </svg>
          </button>
          <button class="panel-action-btn" @click="clearScript" title="清空">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="2 2 14 14"/>
              <polyline points="14 2 2 14"/>
            </svg>
          </button>
          <button class="panel-action-btn" @click="scriptPanelOpen = !scriptPanelOpen" title="折叠/展开">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline v-if="scriptPanelOpen" points="2 6 8 12 14 6"/>
              <polyline v-else points="6 2 12 8 6 14"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="script-panel-content" v-show="scriptPanelOpen">
        <div class="script-steps-list">
          <div 
            v-for="(step, index) in scriptSteps" 
            :key="step.id"
            class="script-step-item"
            :class="{ 
              'executing': isExecuting && currentExecutingStep === index,
              'completed': step.status === 'completed',
              'failed': step.status === 'failed'
            }"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="step-command">{{ step.command }}</div>
              <div class="step-result" v-if="step.result">{{ step.result }}</div>
            </div>
            <button class="step-delete-btn" @click="deleteStep(index)" title="删除步骤">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="4" y1="4" x2="12" y2="12"/>
                <line x1="4" y1="12" x2="12" y2="4"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="add-step-form">
          <input 
            v-model="newStepCommand" 
            @keyup.enter="addStep"
            placeholder="输入新的步骤命令..."
            class="step-input"
          />
          <button @click="addStep" class="add-step-btn" :disabled="!newStepCommand.trim()">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="8" y1="2" x2="8" y2="14"/>
              <line x1="2" y1="8" x2="14" y2="8"/>
            </svg>
            添加步骤
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { storage } from '../../utils/crypto'
import { getConfig } from '../../config/pageagent.js'

export default {
  name: 'BrowserApp',
  props: {
    fullscreenState: {
      type: Object,
      default: null
    },
    fullscreenActions: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      targetUrl: '',
      selectedWindowIndex: 0,
      windows: Array(6).fill(null).map((_, index) => ({
        id: index + 1,
        iframeSrc: '',
        isLoading: false,
        currentDomain: '',
        lastPageUrl: ''
      })),
      scriptPanelOpen: true,
      scriptPanelPosition: { x: 0, y: 0 },
      scriptSteps: [
        { id: 1, command: '按步骤输入', status: 'pending', result: '' },
      ],
      newStepCommand: '',
      isExecuting: false,
      currentExecutingStep: null,
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      pageObserverIntervals: Array(6).fill(null),
      autoFullscreen: storage.getItem('browserAutoFullscreen') === 'true'
    }
  },
  computed: {
    isFullscreen() {
      return !!this.fullscreenState?.isFullscreen
    }
  },
  mounted() {
    console.log('BrowserApp mounted');
    this.initPageAgent();
    
    this.$nextTick(() => {
      const panelWidth = 380;
      const panelHeight = 600;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      this.scriptPanelPosition = {
        x: Math.floor((viewportWidth - panelWidth) / 2),
        y: Math.floor(viewportHeight - panelHeight - 40)
      };
    });
    
    this.windows.forEach((_, index) => {
      this.startPageObserver(index);
    });
    
    window.addEventListener('message', this.handleIframeMessage);
    document.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    this.pageObserverIntervals.forEach(interval => {
      if (interval) clearInterval(interval);
    });
    window.removeEventListener('message', this.handleIframeMessage);
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    saveFullscreenPreference() {
      storage.setItem('browserAutoFullscreen', this.autoFullscreen.toString());
      if (this.autoFullscreen && !this.isFullscreen) {
        this.enterFullscreen();
      }
    },
    handleKeyDown(event) {
      if (event.key === 'F11') {
        event.preventDefault();
        this.toggleFullscreen();
      }
    },
    toggleFullscreen() {
      this.fullscreenActions?.toggle?.()
    },
    enterFullscreen() {
      this.fullscreenActions?.enter?.()
    },
    exitFullscreen() {
      this.fullscreenActions?.exit?.()
    },
    async initPageAgent() {
      try {
        const { PageAgent } = await import('page-agent');
        const config = getConfig();
        
        const agent = new PageAgent({
          model: config.model,
          baseURL: config.baseURL,
          apiKey: config.apiKey,
          language: config.language,
          autoObserve: config.autoObserve,
          observeInterval: config.observeInterval
        });
        
        window.agent = agent;
      } catch (e) {
        console.error('PageAgent 初始化失败:', e);
      }
    },
    loadUrl(url, updateInput = true) {
      if (!url || !url.trim()) {
        return;
      }
      
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      
      if (updateInput) {
        this.targetUrl = url;
      }
      
      const win = this.windows[this.selectedWindowIndex];
      win.isLoading = true;
      
      try {
        const urlObj = new URL(finalUrl);
        win.currentDomain = urlObj.hostname;
        win.lastPageUrl = finalUrl;
        
        if (win.iframeSrc === finalUrl) {
          const frame = this.$refs['viewerFrame' + this.selectedWindowIndex];
          if (frame && frame[0]) {
            frame[0].src = '';
            this.$nextTick(() => {
              win.iframeSrc = finalUrl;
            });
          }
        } else {
          win.iframeSrc = finalUrl;
        }
      } catch (e) {
        win.isLoading = false;
      }
    },
    selectWindow(index) {
      this.selectedWindowIndex = index;
    },
    onFrameLoad(index) {
      const win = this.windows[index];
      win.isLoading = false;
      
      this.injectNavigationScript(index);
      this.checkPageChange(index);
      this.syncAgentContext(index);
      
      if (window.agent && window.agent.setContext) {
        const frame = this.$refs['viewerFrame' + index];
        if (frame && frame[0] && frame[0].contentWindow && frame[0].contentWindow.document) {
          window.agent.setContext(frame[0].contentWindow.document);
        }
      }
    },
    injectNavigationScript(index) {
      try {
        const frame = this.$refs['viewerFrame' + index];
        if (!frame || !frame[0] || !frame[0].contentWindow || !frame[0].contentWindow.document) {
          return;
        }
        
        const script = document.createElement('script');
        script.textContent = `
          (function() {
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            
            history.pushState = function(...args) {
              originalPushState.apply(this, args);
              window.parent.postMessage({ type: 'pageNavigation', url: window.location.href, windowIndex: ${index} }, '*');
            };
            
            history.replaceState = function(...args) {
              originalReplaceState.apply(this, args);
              window.parent.postMessage({ type: 'pageNavigation', url: window.location.href, windowIndex: ${index} }, '*');
            };
            
            window.addEventListener('hashchange', () => {
              window.parent.postMessage({ type: 'pageNavigation', url: window.location.href, windowIndex: ${index} }, '*');
            });
            
            window.addEventListener('popstate', () => {
              window.parent.postMessage({ type: 'pageNavigation', url: window.location.href, windowIndex: ${index} }, '*');
            });
            
            document.addEventListener('click', (e) => {
              const link = e.target.closest('a');
              if (link && link.href && link.target !== '_blank') {
                setTimeout(() => {
                  window.parent.postMessage({ type: 'pageNavigation', url: window.location.href, windowIndex: ${index} }, '*');
                }, 100);
              }
            }, true);
            
            document.addEventListener('submit', (e) => {
              setTimeout(() => {
                window.parent.postMessage({ type: 'pageNavigation', url: window.location.href, windowIndex: ${index} }, '*');
              }, 100);
            }, true);
          })();
        `;
        
        frame[0].contentWindow.document.head.appendChild(script);
      } catch (e) {
      }
    },
    startPageObserver(index) {
      this.pageObserverIntervals[index] = setInterval(() => {
        this.checkPageChange(index);
      }, 1000);
    },
    checkPageChange(index) {
      try {
        const frame = this.$refs['viewerFrame' + index];
        const win = this.windows[index];
        if (frame && frame[0] && frame[0].contentWindow) {
          const currentUrl = frame[0].contentWindow.location.href;
          
          if (currentUrl !== win.lastPageUrl && win.lastPageUrl !== '') {
            win.lastPageUrl = currentUrl;
            
            try {
              const urlObj = new URL(currentUrl);
              win.currentDomain = urlObj.hostname;
            } catch (e) {}
            
            this.syncAgentContext(index);
          } else if (win.lastPageUrl === '') {
            win.lastPageUrl = currentUrl;
          }
        }
      } catch (e) {
      }
    },
    syncAgentContext(index) {
      try {
        const frame = this.$refs['viewerFrame' + index];
        if (frame && frame[0] && frame[0].contentWindow && frame[0].contentWindow.document) {
          if (window.agent && window.agent.setContext) {
            window.agent.setContext(frame[0].contentWindow.document);
          }
        }
      } catch (e) {
      }
    },
    handleIframeMessage(event) {
      if (event.data && event.data.type === 'pageNavigation') {
        const index = event.data.windowIndex;
        const newUrl = event.data.url;
        const win = this.windows[index];
        
        if (win && newUrl !== win.iframeSrc) {
          win.iframeSrc = newUrl;
          try {
            const urlObj = new URL(newUrl);
            win.currentDomain = urlObj.hostname;
          } catch (e) {}
        }
        
        this.syncAgentContext(index);
      }
    },
    closeViewer(index) {
      const win = this.windows[index];
      win.iframeSrc = '';
      win.currentDomain = '';
      win.lastPageUrl = '';
    },
    refreshViewer(index) {
      const win = this.windows[index];
      if (win.iframeSrc) {
        win.isLoading = true;
        const frame = this.$refs['viewerFrame' + index];
        if (frame && frame[0]) {
          frame[0].src = win.iframeSrc;
        }
      }
    },
    addStep() {
      if (this.newStepCommand.trim()) {
        this.scriptSteps.push({
          id: Date.now(),
          command: this.newStepCommand.trim(),
          status: 'pending',
          result: ''
        });
        this.newStepCommand = '';
      }
    },
    deleteStep(index) {
      this.scriptSteps.splice(index, 1);
    },
    clearScript() {
      this.scriptSteps = [];
    },
    async executeScript() {
      if (this.isExecuting || this.scriptSteps.length === 0) {
        return;
      }
      
      this.isExecuting = true;
      
      for (let i = 0; i < this.scriptSteps.length; i++) {
        this.currentExecutingStep = i;
        const step = this.scriptSteps[i];
        step.status = 'executing';
        step.result = '';
        
        try {
          if (window.agent && window.agent.execute) {
            const result = await window.agent.execute(step.command);
            step.status = 'completed';
            step.result = result || '执行成功';
          } else {
            step.status = 'failed';
            step.result = 'PageAgent 未初始化';
          }
        } catch (error) {
          step.status = 'failed';
          step.result = error.message || '执行失败';
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      this.isExecuting = false;
      this.currentExecutingStep = null;
    },
    startDrag(event) {
      this.isDragging = true;
      this.dragOffset = {
        x: event.clientX - this.scriptPanelPosition.x,
        y: event.clientY - this.scriptPanelPosition.y
      };
      
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    onDrag(event) {
      if (!this.isDragging) return;
      
      this.scriptPanelPosition = {
        x: event.clientX - this.dragOffset.x,
        y: event.clientY - this.dragOffset.y
      };
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  }
}
</script>

<style scoped>
.browser-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  position: absolute;
  inset: 0;
}

.app-header {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.url-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.window-selector {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.url-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.url-input:focus {
  outline: none;
  border-color: #667eea;
}

.load-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.load-btn svg {
  width: 16px;
  height: 16px;
}

.fullscreen-btn {
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-btn:hover {
  background: #f0f0f0;
}

.fullscreen-btn svg {
  width: 18px;
  height: 18px;
  color: #666;
}

.fullscreen-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.fullscreen-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #667eea;
}

.fullscreen-option label {
  cursor: pointer;
  user-select: none;
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
  z-index: 1000;
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

.windows-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
  overflow: auto;
  min-height: 0;
}

.window-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.window-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.window-item.selected {
  border-color: #667eea;
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}

.window-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
}

.window-number {
  font-weight: 600;
  color: #667eea;
}

.window-domain {
  color: #666;
}

.window-actions {
  display: flex;
  gap: 4px;
}

.window-action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
}

.window-action-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.window-action-btn svg {
  width: 14px;
  height: 14px;
}

.window-content {
  flex: 1;
  position: relative;
  background: white;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loader-ring {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loader span {
  font-size: 12px;
  color: #666;
}

.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state span {
  font-size: 14px;
}

.viewer-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.script-panel {
  position: absolute;
  width: 380px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1000;
}

.script-panel.collapsed {
  height: auto;
}

.script-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: move;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.panel-title svg {
  width: 18px;
  height: 18px;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel-action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
}

.panel-action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.panel-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.panel-action-btn svg {
  width: 14px;
  height: 14px;
}

.script-panel-content {
  max-height: 500px;
  overflow-y: auto;
}

.script-steps-list {
  padding: 12px;
}

.script-step-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
  border-left: 3px solid #e0e0e0;
}

.script-step-item.executing {
  border-left-color: #667eea;
  background: #f0f4ff;
}

.script-step-item.completed {
  border-left-color: #28c840;
  background: #f0fff4;
}

.script-step-item.failed {
  border-left-color: #ff5f57;
  background: #fff5f5;
}

.step-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.script-step-item.executing .step-number {
  background: #667eea;
  color: white;
}

.script-step-item.completed .step-number {
  background: #28c840;
  color: white;
}

.script-step-item.failed .step-number {
  background: #ff5f57;
  color: white;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-command {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.step-result {
  font-size: 12px;
  color: #666;
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
}

.step-delete-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.2s;
}

.step-delete-btn:hover {
  background: #ffe5e5;
  color: #ff5f57;
}

.step-delete-btn svg {
  width: 12px;
  height: 12px;
}

.add-step-form {
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
}

.step-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.step-input:focus {
  outline: none;
  border-color: #667eea;
}

.add-step-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.add-step-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-step-btn svg {
  width: 14px;
  height: 14px;
}
</style>
