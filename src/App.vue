<template>
  <div id="app" class="control-panel">
    <!-- 背景网格 -->
    <div class="grid-bg"></div>
    
    <!-- 顶部操作信息区 -->
    <header class="header-section">
      <div class="header-top">
        <div class="logo-section">
          <button class="back-btn" @click="goHome" title="返回首页">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 3"/>
              <polyline points="19 6 12 13 18"/>
            </svg>
          </button>
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="title">WebAuto Studio</span>
            <span class="subtitle">浏览器控制</span>
          </div>
        </div>
        <div class="status-indicators">
          <div class="connection-status">
            <span class="signal-bar" v-for="i in 4" :key="i" :class="{ active: i <= signalStrength }"></span>
          </div>
        </div>
      </div>
      
      <!-- 任务控制栏 -->
      <div class="control-bar">
        <div class="url-input-group">
          <label>目标地址</label>
          <div class="input-wrapper">
            <select v-model="selectedWindowIndex" class="window-selector">
              <option v-for="(win, index) in windows" :key="win.id" :value="index">
                窗口 {{ win.id }}
              </option>
            </select>
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <input 
              v-model="targetUrl" 
              type="text" 
              placeholder="输入要自动化测试的网页地址..."
              @keyup.enter="loadUrl(targetUrl, true)"
            />
            <button class="load-btn" @click="loadUrl(targetUrl, false)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 底部窗口显示区 -->
    <main class="viewer-section">
      <div class="viewer-tools">
        <button class="tool-btn" title="刷新所有窗口" @click="refreshAllViewers">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
        <button class="tool-btn" title="开发者工具" @click="toggleDevTools">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
        </button>
        <button class="tool-btn" title="全屏" @click="toggleFullscreen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </button>
      </div>
      
      <!-- 6个窗口的 Grid 布局 -->
      <div class="windows-grid">
        <div 
          v-for="(win, index) in windows" 
          :key="win.id"
          class="window-item"
          :class="{ 'selected': selectedWindowIndex === index }"
          @click="selectWindow(index)"
        >
          <!-- 窗口标题栏 -->
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
          
          <!-- 窗口内容区 -->
          <div class="window-content">
            <!-- 加载状态 -->
            <div class="loading-overlay" v-if="win.isLoading">
              <div class="loader">
                <div class="loader-ring"></div>
                <div class="loader-ring"></div>
                <div class="loader-ring"></div>
                <span>加载中...</span>
              </div>
            </div>
            
            <!-- 空状态 -->
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
            
            <!-- Iframe -->
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
      
      <!-- 开发者工具面板 -->
      <div class="dev-tools-panel" v-if="devToolsOpen">
        <div class="dev-tools-header">
          <span>开发者工具</span>
          <button @click="devToolsOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="dev-tools-content">
          <div class="element-picker">
            <span class="picker-label">元素选择器</span>
            <input v-model="elementSelector" placeholder="输入 CSS 选择器..." />
            <button @click="highlightElement">定位</button>
          </div>
          <div class="console-output">
            <div class="console-line" v-for="(line, i) in consoleOutput" :key="i">
              <span class="console-prefix">&gt;</span>
              <span>{{ line }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- 脚本执行面板 -->
    <div 
      class="script-panel"
      :class="{ 'collapsed': !scriptPanelOpen }"
      :style="{ left: scriptPanelPosition.x + 'px', top: scriptPanelPosition.y + 'px' }"
      v-if="scriptPanelOpen || !scriptPanelOpen"
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
export default {
  name: 'WebAutoStudio',
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
      devToolsOpen: false,
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
      signalStrength: 4,
      elementSelector: '',
      consoleOutput: ['准备就绪，等待操作...'],
      currentTime: '',
      timerInterval: null,
      pageObserverIntervals: Array(6).fill(null)
    }
  },
  computed: {},
  mounted() {
    this.updateTime();
    this.timerInterval = setInterval(this.updateTime, 1000);
    
    // 初始化 PageAgent
    this.initPageAgent();
    
    // 计算脚本面板默认位置（居中靠下）
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
    
    // 监听 iframe 页面变化
    this.windows.forEach((_, index) => {
      this.startPageObserver(index);
    });
    
    // 监听来自 iframe 的消息
    window.addEventListener('message', this.handleIframeMessage);
  },
  beforeDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.pageObserverIntervals.forEach(interval => {
      if (interval) clearInterval(interval);
    });
    window.removeEventListener('message', this.handleIframeMessage);
  },
  methods: {
    async initPageAgent() {
      try {
        const { PageAgent } = await import('page-agent');
        const agent = new PageAgent({
          model: 'deepseek-chat',
          baseURL: 'https://api.deepseek.com/v1',
          apiKey: 'sk-bbeca64cedb64628b8185391affd2168',
          language: 'zh-CN',
          autoObserve: true,
          observeInterval: 500
        });
        
        window.agent = agent;
      } catch (e) {
        console.error('PageAgent 初始化失败:', e);
      }
    },
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('zh-CN', { hour12: false });
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
    loadDemo(site) {
      const demos = {
        github: 'https://github.com',
        bing: 'https://www.bing.com',
        codepen: 'https://codepen.io'
      };
      this.loadUrl(demos[site], false);
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
    refreshAllViewers() {
      this.windows.forEach((win, index) => {
        if (win.iframeSrc) {
          this.refreshViewer(index);
        }
      });
    },
    toggleDevTools() {
      this.devToolsOpen = !this.devToolsOpen;
    },
    takeScreenshot() {
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        this.$el.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    highlightElement() {
      if (this.elementSelector) {
        this.consoleOutput.push(`查找元素: "${this.elementSelector}"`);
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
      
      this.currentExecutingStep = null;
      this.isExecuting = false;
    },
    startDrag(event) {
      if (event.target.closest('.panel-actions')) {
        return;
      }
      
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
    },
    goHome() {
      this.$router.push('/');
    }
  }
}
</script>

<style>
/* CSS Variables - 马卡龙科技风配色 */
:root {
  --bg-primary: #0f1419;
  --bg-secondary: #1a1f2e;
  --bg-tertiary: #242b3d;
  --bg-panel: rgba(26, 31, 46, 0.85);
  
  --mint: #7EE8C7;
  --mint-dim: rgba(126, 232, 199, 0.15);
  --lavender: #B8B5FF;
  --lavender-dim: rgba(184, 181, 255, 0.15);
  --sky: #7EC8E3;
  --sky-dim: rgba(126, 200, 227, 0.15);
  --coral: #FF8A80;
  --coral-dim: rgba(255, 138, 128, 0.15);
  --peach: #FFB86C;
  --peach-dim: rgba(255, 184, 108, 0.15);
  
  --text-primary: #e8eaed;
  --text-secondary: #9aa0a6;
  --text-muted: #5f6368;
  
  --border-color: rgba(126, 232, 199, 0.2);
  --glow-mint: 0 0 20px rgba(126, 232, 199, 0.3);
  --glow-lavender: 0 0 20px rgba(184, 181, 255, 0.3);
  
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}

/* Reset & Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  overflow: hidden;
}

/* Main Layout */
.control-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Background Grid */
.grid-bg {
  position: fixed;
  inset: 0;
  background-image: 
    linear-gradient(rgba(126, 232, 199, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(126, 232, 199, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.grid-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(126, 232, 199, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(184, 181, 255, 0.06) 0%, transparent 50%);
}

/* Header Section */
.header-section {
  flex-shrink: 0;
  padding: 16px 24px;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, transparent 100%);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 10;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

/* Logo */
.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  width: 36px;
  height: 36px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.back-btn:hover {
  border-color: var(--mint);
  color: var(--mint);
  background: var(--mint-dim);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--mint) 0%, var(--lavender) 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--glow-mint);
}

.logo-icon svg {
  width: 24px;
  height: 24px;
  color: var(--bg-primary);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-text .title {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(90deg, var(--mint), var(--lavender));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.logo-text .subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

/* Status Indicators */
.status-indicators {
  display: flex;
  align-items: center;
  gap: 20px;
}



.connection-status {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 18px;
}

.signal-bar {
  width: 4px;
  background: var(--text-muted);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.signal-bar:nth-child(1) { height: 4px; }
.signal-bar:nth-child(2) { height: 8px; }
.signal-bar:nth-child(3) { height: 12px; }
.signal-bar:nth-child(4) { height: 16px; }

.signal-bar.active {
  background: var(--mint);
  box-shadow: 0 0 6px var(--mint);
}

/* Control Bar */
.control-bar {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.url-input-group {
  flex: 1;
}

.url-input-group label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 4px;
  transition: all 0.3s ease;
}

.window-selector {
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  padding: 8px 12px;
  cursor: pointer;
  outline: none;
  border-right: 1px solid var(--border-color);
  min-width: 100px;
}

.window-selector:hover {
  background: var(--bg-secondary);
}

.window-selector:focus {
  background: var(--bg-secondary);
}

.input-wrapper:focus-within {
  border-color: var(--mint);
  box-shadow: var(--glow-mint);
}

.input-icon {
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  margin-left: 12px;
  flex-shrink: 0;
}

.input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 12px;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
}

.load-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--mint) 0%, var(--sky) 100%);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.load-btn:hover {
  transform: scale(1.05);
  box-shadow: var(--glow-mint);
}

.load-btn svg {
  width: 20px;
  height: 20px;
  color: var(--bg-primary);
}

/* Viewer Section */
.viewer-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 24px 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  z-index: 5;
}

/* Windows Grid */
.windows-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
  overflow: auto;
}

.window-item {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.window-item:hover {
  border-color: var(--mint);
  box-shadow: var(--glow-mint);
}

.window-item.selected {
  border-color: var(--mint);
  box-shadow: 0 0 0 2px var(--mint-dim);
}

/* Window Header */
.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  min-height: 40px;
}

.window-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.window-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--mint);
  color: var(--bg-primary);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.window-domain {
  font-size: 0.8rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.window-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.window-action-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.window-action-btn:hover {
  background: var(--bg-secondary);
  color: var(--mint);
}

.window-action-btn svg {
  width: 12px;
  height: 12px;
  color: var(--text-muted);
}

/* Window Content */
.window-content {
  flex: 1;
  position: relative;
  background: white;
  min-height: 0;
}

/* Viewer Tools */
.viewer-tools {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.tool-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tool-btn:hover {
  border-color: var(--lavender);
  background: var(--lavender-dim);
}

.tool-btn svg {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

.tool-btn:hover svg {
  color: var(--lavender);
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 20, 25, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: var(--text-secondary);
}

.loader-ring {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid transparent;
  animation: loader-spin 1.2s linear infinite;
}

.loader-ring:nth-child(1) {
  border-top-color: var(--mint);
  animation-delay: 0s;
}

.loader-ring:nth-child(2) {
  width: 60px;
  height: 60px;
  border-right-color: var(--lavender);
  animation-delay: 0.15s;
}

.loader-ring:nth-child(3) {
  width: 70px;
  height: 70px;
  border-bottom-color: var(--sky);
  animation-delay: 0.3s;
}

@keyframes loader-spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  background: var(--bg-primary);
}

.empty-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
  color: var(--mint);
}

.empty-state span {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Viewer Frame */
.viewer-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

/* Dev Tools Panel */
.dev-tools-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  z-index: 15;
}

.dev-tools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.8rem;
  font-weight: 600;
}

.dev-tools-header button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.dev-tools-header button svg {
  width: 14px;
  height: 14px;
  color: var(--text-secondary);
}

.dev-tools-content {
  padding: 12px;
}

.element-picker {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.picker-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
  display: block;
}

.element-picker input {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  outline: none;
}

.element-picker input:focus {
  border-color: var(--mint);
}

.element-picker button {
  padding: 8px 16px;
  background: var(--mint);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--bg-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.element-picker button:hover {
  box-shadow: var(--glow-mint);
}

.console-output {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
}

.console-line {
  padding: 4px 0;
  color: var(--text-secondary);
}

.console-prefix {
  color: var(--mint);
  margin-right: 8px;
}

/* Script Panel */
.script-panel {
  position: fixed;
  width: 380px;
  max-height: 600px;
  background: var(--bg-panel);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  overflow: hidden;
  transition: all 0.3s ease;
}

.script-panel.collapsed {
  max-height: 48px;
}

.script-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  cursor: move;
  user-select: none;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.panel-title svg {
  width: 18px;
  height: 18px;
  color: var(--mint);
}

.panel-actions {
  display: flex;
  gap: 4px;
}

.panel-action-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.panel-action-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  color: var(--mint);
}

.panel-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.panel-action-btn svg {
  width: 14px;
  height: 14px;
  color: var(--text-secondary);
}

.script-panel-content {
  display: flex;
  flex-direction: column;
  max-height: 500px;
  overflow: hidden;
}

.script-steps-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.script-step-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.script-step-item:hover {
  border-color: var(--mint);
}

.script-step-item.executing {
  border-color: var(--lavender);
  background: var(--lavender-dim);
}

.script-step-item.completed {
  border-color: var(--mint);
}

.script-step-item.failed {
  border-color: var(--coral);
  background: var(--coral-dim);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.script-step-item.executing .step-number {
  border-color: var(--lavender);
  color: var(--lavender);
}

.script-step-item.completed .step-number {
  background: var(--mint);
  border-color: var(--mint);
  color: var(--bg-primary);
}

.script-step-item.failed .step-number {
  background: var(--coral);
  border-color: var(--coral);
  color: var(--bg-primary);
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-command {
  font-size: 0.85rem;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.step-result {
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-family: 'JetBrains Mono', monospace;
}

.script-step-item.completed .step-result {
  color: var(--mint);
}

.script-step-item.failed .step-result {
  color: var(--coral);
}

.step-delete-btn {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.script-step-item:hover .step-delete-btn {
  opacity: 1;
}

.step-delete-btn:hover {
  background: var(--coral-dim);
  color: var(--coral);
}

.step-delete-btn svg {
  width: 12px;
  height: 12px;
  color: var(--text-muted);
}

.add-step-form {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.step-input {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s;
}

.step-input:focus {
  border-color: var(--mint);
  box-shadow: var(--glow-mint);
}

.step-input::placeholder {
  color: var(--text-muted);
}

.add-step-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: var(--mint);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--bg-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-step-btn:hover:not(:disabled) {
  box-shadow: var(--glow-mint);
}

.add-step-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-step-btn svg {
  width: 14px;
  height: 14px;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--mint);
}

/* Responsive */
@media (max-width: 1024px) {
  .windows-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
  
  .script-panel {
    width: 320px;
  }
}

@media (max-width: 768px) {
  .header-section {
    padding: 12px 16px;
  }
  
  .control-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .viewer-section {
    margin: 0 12px 12px;
  }
  
  .windows-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, 1fr);
  }
  
  .script-panel {
    width: 280px;
    right: 10px;
    left: auto !important;
  }
  
  .logo-text .title {
    font-size: 1rem;
  }
}
</style>

