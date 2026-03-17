<template>
  <div class="add-source-overlay" @click="$emit('close')">
    <div class="add-source-dialog" @click.stop>
      <div class="dialog-header">
        <h3>添加直播源</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="3" y1="3" x2="13" y2="13"/>
            <line x1="3" y1="13" x2="13" y2="3"/>
          </svg>
        </button>
      </div>
      
      <div class="dialog-body">
        <div class="form-group">
          <label>源名称</label>
          <input 
            v-model="sourceName" 
            type="text" 
            placeholder="输入源名称"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>添加方式</label>
          <div class="tabs">
            <button 
              class="tab-btn"
              :class="{ active: addMode === 'manual' }"
              @click="addMode = 'manual'"
            >
              手动添加
            </button>
            <button 
              class="tab-btn"
              :class="{ active: addMode === 'url' }"
              @click="addMode = 'url'"
            >
              URL导入
            </button>
          </div>
        </div>
        
        <div v-if="addMode === 'manual'" class="manual-add">
          <div class="form-group">
            <label>频道名称</label>
            <input 
              v-model="channelName" 
              type="text" 
              placeholder="输入频道名称"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>频道分组</label>
            <input 
              v-model="channelGroup" 
              type="text" 
              placeholder="输入分组名称"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>直播地址</label>
            <input 
              v-model="channelUrl" 
              type="text" 
              placeholder="输入直播地址 (m3u8, mp4等)"
              class="form-input"
            />
          </div>
          
          <button class="add-channel-btn" @click="addChannel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            添加频道
          </button>
          
          <div v-if="channels.length > 0" class="channel-preview">
            <h4>已添加频道 ({{ channels.length }})</h4>
            <div class="preview-list">
              <div 
                v-for="(channel, index) in channels" 
                :key="index"
                class="preview-item"
              >
                <span class="preview-name">{{ channel.name }}</span>
                <button class="preview-delete" @click="removeChannel(index)">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                    <line x1="3" y1="3" x2="13" y2="13"/>
                    <line x1="3" y1="13" x2="13" y2="3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="addMode === 'url'" class="url-add">
          <div class="form-group">
            <label>源地址</label>
            <input 
              v-model="sourceUrl" 
              type="text" 
              placeholder="输入M3U源地址"
              class="form-input"
            />
          </div>
          
          <button class="fetch-btn" @click="fetchSource">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            获取源
          </button>
          
          <div v-if="fetchedChannels.length > 0" class="fetched-preview">
            <h4>获取到 {{ fetchedChannels.length }} 个频道</h4>
            <div class="preview-list">
              <div 
                v-for="(channel, index) in fetchedChannels.slice(0, 20)" 
                :key="index"
                class="preview-item"
              >
                <span class="preview-name">{{ channel.name }}</span>
                <span class="preview-group">{{ channel.group }}</span>
              </div>
              <div v-if="fetchedChannels.length > 20" class="more-channels">
                还有 {{ fetchedChannels.length - 20 }} 个频道...
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button class="confirm-btn" @click="confirmAdd" :disabled="!canConfirm">
          确认添加
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddSourceDialog',
  data() {
    return {
      sourceName: '',
      addMode: 'manual',
      channelName: '',
      channelGroup: '',
      channelUrl: '',
      channels: [],
      sourceUrl: '',
      fetchedChannels: [],
      isFetching: false
    }
  },
  computed: {
    canConfirm() {
      if (!this.sourceName.trim()) return false
      
      if (this.addMode === 'manual') {
        return this.channels.length > 0
      } else {
        return this.fetchedChannels.length > 0
      }
    }
  },
  methods: {
    addChannel() {
      if (!this.channelName.trim() || !this.channelUrl.trim()) {
        alert('请填写频道名称和直播地址')
        return
      }
      
      this.channels.push({
        id: Date.now().toString(),
        name: this.channelName.trim(),
        group: this.channelGroup.trim() || '未分类',
        url: this.channelUrl.trim()
      })
      
      this.channelName = ''
      this.channelGroup = ''
      this.channelUrl = ''
    },
    removeChannel(index) {
      this.channels.splice(index, 1)
    },
    async fetchSource() {
      if (!this.sourceUrl.trim()) {
        alert('请输入源地址')
        return
      }
      
      this.isFetching = true
      
      try {
        const response = await fetch(this.sourceUrl.trim())
        const content = await response.text()
        this.parseM3U(content)
      } catch (e) {
        alert('获取源失败：' + e.message)
      }
      
      this.isFetching = false
    },
    parseM3U(content) {
      const lines = content.split('\n')
      const channels = []
      let currentChannel = null
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (line.startsWith('#EXTINF:')) {
          const info = line.substring(8)
          const nameMatch = info.match(/,(.+)$/)
          const groupMatch = info.match(/group-title="([^"]+)"/)
          
          currentChannel = {
            id: Date.now().toString() + i,
            name: nameMatch ? nameMatch[1].trim() : '未知频道',
            group: groupMatch ? groupMatch[1] : '未分类',
            url: ''
          }
        } else if (line && !line.startsWith('#') && currentChannel) {
          currentChannel.url = line
          channels.push(currentChannel)
          currentChannel = null
        }
      }
      
      this.fetchedChannels = channels
    },
    confirmAdd() {
      const channels = this.addMode === 'manual' ? this.channels : this.fetchedChannels
      
      this.$emit('add', {
        name: this.sourceName.trim(),
        channels: channels
      })
    }
  }
}
</script>

<style scoped>
.add-source-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.add-source-dialog {
  width: 600px;
  max-height: 80vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.add-channel-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.add-channel-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.add-channel-btn svg {
  width: 18px;
  height: 18px;
}

.channel-preview,
.fetched-preview {
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.channel-preview h4,
.fetched-preview h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.preview-list {
  max-height: 200px;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 6px;
}

.preview-name {
  font-size: 13px;
  color: #333;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-group {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.preview-delete {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}

.preview-delete:hover {
  background: rgba(255, 95, 87, 0.1);
  color: #ff5f57;
}

.preview-delete svg {
  width: 12px;
  height: 12px;
}

.more-channels {
  text-align: center;
  padding: 12px;
  font-size: 13px;
  color: #999;
}

.fetch-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.fetch-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.fetch-btn svg {
  width: 18px;
  height: 18px;
}

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f0f0f0;
}

.confirm-btn {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
