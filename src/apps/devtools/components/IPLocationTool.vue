<template>
  <div class="ip-location-tool">
    <div class="tool-header">
      <h2 class="tool-title">IP属地查询</h2>
      <p class="tool-description">查询IP地址的地理位置信息</p>
    </div>

    <div class="ip-content">
      <div class="current-ip-section">
        <div class="ip-card">
          <div class="ip-header">
            <h3 class="ip-title">当前IP</h3>
            <button class="refresh-btn" @click="queryCurrentIP" :disabled="isLoading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 2.13-9.36L23 10"/>
              </svg>
              刷新
            </button>
          </div>
          <div class="ip-display">
            <span class="ip-address">{{ currentIP.ip || '查询中...' }}</span>
            <span class="ip-location">{{ currentIP.location || '未知' }}</span>
          </div>
        </div>
      </div>

      <div class="query-section">
        <div class="input-group">
          <label class="input-label">输入IP地址：</label>
          <input 
            v-model="queryIP" 
            type="text" 
            class="ip-input"
            placeholder="例如：8.8.8.8"
            @keyup.enter="queryIP"
          />
          <button class="query-btn" @click="queryIP" :disabled="isLoading || !queryIP.trim()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            查询
          </button>
        </div>
      </div>

      <div class="result-section" v-if="queryResult">
        <div class="result-card">
          <div class="result-header">
            <h3 class="result-title">查询结果</h3>
            <button class="copy-btn" @click="copyResult" title="复制结果">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>
          
          <div class="result-grid">
            <div class="result-item">
              <span class="item-label">IP地址</span>
              <span class="item-value">{{ queryResult.ip }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">国家</span>
              <span class="item-value">{{ queryResult.country }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">省份</span>
              <span class="item-value">{{ queryResult.region }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">城市</span>
              <span class="item-value">{{ queryResult.city }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">运营商</span>
              <span class="item-value">{{ queryResult.isp }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">时区</span>
              <span class="item-value">{{ queryResult.timezone }}</span>
            </div>
            <div class="result-item">
              <span class="item-label">经纬度</span>
              <span class="item-value">{{ queryResult.lat }}, {{ queryResult.lon }}</span>
            </div>
            <div class="result-item full-width">
              <span class="item-label">完整地址</span>
              <span class="item-value">{{ queryResult.fullAddress }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="error-section" v-if="error">
        <div class="error-card">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h4 class="error-title">查询失败</h4>
          <p class="error-message">{{ error }}</p>
          <button class="retry-btn" @click="retryQuery">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 2.13-9.36L23 10"/>
            </svg>
            重试
          </button>
        </div>
      </div>

      <div class="history-section" v-if="queryHistory.length > 0">
        <h3 class="history-title">查询历史</h3>
        <div class="history-list">
          <div 
            v-for="(item, index) in queryHistory" 
            :key="index"
            class="history-item"
            @click="queryHistoryIP(item.ip)"
          >
            <div class="history-ip">{{ item.ip }}</div>
            <div class="history-location">{{ item.location }}</div>
            <div class="history-time">{{ item.time }}</div>
          </div>
        </div>
        <button class="clear-history-btn" @click="clearHistory" v-if="queryHistory.length > 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          清空历史
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { storage } from '../../../utils/crypto'

export default {
  name: 'IPLocationTool',
  data() {
    return {
      currentIP: {
        ip: '',
        location: ''
      },
      queryIP: '',
      queryResult: null,
      isLoading: false,
      error: null,
      queryHistory: []
    }
  },
  mounted() {
    this.queryCurrentIP()
    this.loadHistory()
  },
  methods: {
    async queryCurrentIP() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await fetch('http://ip-api.com/json/')
        const data = await response.json()
        
        if (data.status === 'success') {
          this.currentIP = {
            ip: data.query,
            location: `${data.country} ${data.city}`
          }
        } else {
          this.error = '无法获取IP信息'
        }
      } catch (err) {
        this.error = '网络请求失败：' + err.message
      } finally {
        this.isLoading = false
      }
    },
    async queryIP() {
      if (!this.queryIP.trim()) return
      
      this.isLoading = true
      this.error = null
      this.queryResult = null
      
      try {
        const response = await fetch(`http://ip-api.com/json/${this.queryIP.trim()}`)
        const data = await response.json()
        
        if (data.status === 'success') {
          this.queryResult = {
            ip: data.query,
            country: data.country,
            region: data.regionName,
            city: data.city,
            isp: data.isp,
            timezone: data.timezone,
            lat: data.lat,
            lon: data.lon,
            fullAddress: `${data.country} ${data.regionName} ${data.city}`
          }
          
          this.addToHistory(this.queryResult)
        } else {
          this.error = data.message || '查询失败'
        }
      } catch (err) {
        this.error = '网络请求失败：' + err.message
      } finally {
        this.isLoading = false
      }
    },
    queryHistoryIP(ip) {
      this.queryIP = ip
      this.queryIP()
    },
    retryQuery() {
      if (this.queryIP.trim()) {
        this.queryIP()
      } else {
        this.queryCurrentIP()
      }
    },
    copyResult() {
      if (!this.queryResult) return
      
      const text = `IP地址：${this.queryResult.ip}\n国家：${this.queryResult.country}\n省份：${this.queryResult.region}\n城市：${this.queryResult.city}\n运营商：${this.queryResult.isp}\n时区：${this.queryResult.timezone}\n经纬度：${this.queryResult.lat}, ${this.queryResult.lon}`
      
      navigator.clipboard.writeText(text)
        .then(() => {
          alert('复制成功！')
        })
        .catch(err => {
          console.error('复制失败：', err)
        })
    },
    addToHistory(result) {
      const historyItem = {
        ip: result.ip,
        location: result.fullAddress,
        time: new Date().toLocaleString('zh-CN')
      }
      
      this.queryHistory.unshift(historyItem)
      
      if (this.queryHistory.length > 10) {
        this.queryHistory = this.queryHistory.slice(0, 10)
      }
      
      this.saveHistory()
    },
    loadHistory() {
      const saved = storage.getItem('ipQueryHistory')
      if (saved) {
        try {
          this.queryHistory = saved
        } catch (e) {
          console.error('加载历史记录失败:', e)
        }
      }
    },
    saveHistory() {
      storage.setItem('ipQueryHistory', this.queryHistory)
    },
    clearHistory() {
      this.queryHistory = []
      storage.removeItem('ipQueryHistory')
    }
  }
}
</script>

<style scoped>
.ip-location-tool {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tool-header {
  margin-bottom: 24px;
}

.tool-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.tool-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.ip-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: auto;
}

.current-ip-section {
  padding: 20px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 8px;
  border: 1px solid #667eea;
}

.ip-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.ip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ip-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.refresh-btn {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-btn:hover:not(:disabled) {
  background: #5568d3;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn svg {
  width: 14px;
  height: 14px;
}

.ip-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ip-address {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  font-family: 'Courier New', monospace;
}

.ip-location {
  font-size: 14px;
  color: #666;
}

.query-section {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.input-group {
  display: flex;
  gap: 12px;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
}

.ip-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  transition: border-color 0.2s;
}

.ip-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.query-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.query-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.query-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.query-btn svg {
  width: 18px;
  height: 18px;
}

.result-section {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.result-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.copy-btn {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-btn:hover {
  background: #5568d3;
}

.copy-btn svg {
  width: 14px;
  height: 14px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.result-item {
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.result-item.full-width {
  grid-column: span 2;
}

.item-label {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.item-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.error-section {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.error-card {
  text-align: center;
  padding: 20px;
}

.error-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #f44336;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #f44336;
  margin: 0 0 8px;
}

.error-message {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px;
}

.retry-btn {
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
}

.retry-btn:hover {
  background: #5568d3;
}

.retry-btn svg {
  width: 18px;
  height: 18px;
}

.history-section {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.history-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: #e8f4ff;
  border-color: #667eea;
}

.history-ip {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  font-family: 'Courier New', monospace;
}

.history-location {
  font-size: 13px;
  color: #666;
}

.history-time {
  font-size: 12px;
  color: #999;
}

.clear-history-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
}

.clear-history-btn:hover {
  background: #e8e8e8;
}

.clear-history-btn svg {
  width: 14px;
  height: 14px;
}
</style>
