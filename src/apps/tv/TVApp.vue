<template>
  <div class="tv-app">
    <div class="tv-sidebar">
      <div class="sidebar-header">
        <h3>直播源</h3>
        <div class="header-actions">
          <button class="proxy-toggle" @click="useProxy = !useProxy" :class="{ active: useProxy }" title="切换代理模式">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </button>
          <button class="add-source-btn" @click="showAddSource = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="source-list">
        <div 
          v-for="source in sources" 
          :key="source.id"
          class="source-item"
          :class="{ active: selectedSourceId === source.id }"
          @click="selectSource(source)"
        >
          <div class="source-info">
            <div class="source-name">{{ source.name }}</div>
            <div class="source-meta">
              <span class="source-type">{{ source.type }}</span>
              <span class="source-status" :class="source.status">
                {{ source.status === 'good' ? '✓' : source.status === 'loading' ? '...' : '✗' }}
              </span>
            </div>
          </div>
          <button class="delete-btn" @click.stop="deleteSource(source.id)" v-if="!source.isDefault">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="3" y1="3" x2="13" y2="13"/>
              <line x1="3" y1="13" x2="13" y2="3"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="sidebar-footer">
        <button class="import-btn" @click="importSource">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          导入源
        </button>
      </div>
    </div>
    
    <div class="tv-main">
      <div class="video-container" ref="videoContainer">
        <div v-if="!currentChannel" class="no-channel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
            <polyline points="17 2 12 7 7 2"/>
          </svg>
          <p>请选择一个频道开始观看</p>
        </div>
      </div>
      
      <div class="channel-list" :class="{ 'with-video': currentChannel }">
        <div class="channel-search">
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="搜索频道..."
            class="search-input"
          />
        </div>
        
        <div class="channels-grid">
          <div 
            v-for="channel in filteredChannels" 
            :key="channel.id"
            class="channel-item"
            :class="{ active: currentChannel === channel.id }"
            @click="playChannel(channel)"
          >
            <div class="channel-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                <polyline points="17 2 12 7 7 2"/>
              </svg>
            </div>
            <div class="channel-info">
              <div class="channel-name">{{ channel.name }}</div>
              <div class="channel-group">{{ channel.group }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <add-source-dialog 
      v-if="showAddSource"
      @close="showAddSource = false"
      @add="addSource"
    />
    
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
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import AddSourceDialog from './AddSourceDialog.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'

export default {
  name: 'TVApp',
  components: {
    AddSourceDialog,
    ConfirmDialog
  },
  data() {
    return {
      sources: [],
      selectedSourceId: null,
      currentChannel: null,
      searchKeyword: '',
      showAddSource: false,
      player: null,
      resizeObserver: null,
      useProxy: true,
      playerReady: false,
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
  computed: {
    selectedSource() {
      return this.sources.find(s => s.id === this.selectedSourceId)
    },
    filteredChannels() {
      if (!this.selectedSource) return []
      
      const channels = this.selectedSource.channels || []
      if (!this.searchKeyword) return channels
      
      return channels.filter(channel => 
        channel.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        channel.group.toLowerCase().includes(this.searchKeyword.toLowerCase())
      )
    }
  },
  mounted() {
    this.loadSources()
    this.loadDefaultSources()
    this.initResizeObserver()
  },
  beforeDestroy() {
    this.destroyPlayer()
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  },
  methods: {
    initResizeObserver() {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.player && this.playerReady) {
          this.$nextTick(() => {
            try {
              this.player.width('100%')
              this.player.height('100%')
            } catch (e) {
              console.error('调整播放器尺寸失败:', e)
            }
          })
        }
      })
      
      this.$nextTick(() => {
        const container = this.$refs.videoContainer
        if (container) {
          this.resizeObserver.observe(container)
        }
      })
    },
    destroyPlayer() {
      this.playerReady = false
      if (this.player) {
        try {
          this.player.dispose()
        } catch (e) {
          console.error('销毁播放器失败:', e)
        }
        this.player = null
      }
    },
    createPlayer(url) {
      this.destroyPlayer()
      
      const container = this.$refs.videoContainer
      if (!container) return
      
      const videoElement = document.createElement('video')
      videoElement.className = 'video-js vjs-big-play-centered'
      videoElement.setAttribute('controls', '')
      videoElement.setAttribute('autoplay', '')
      videoElement.setAttribute('crossorigin', 'anonymous')
      
      container.appendChild(videoElement)
      
      const videoType = this.detectVideoType(url)
      
      console.log('尝试播放视频:', url, '类型:', videoType)
      
      this.player = videojs(videoElement, {
        controls: true,
        autoplay: true,
        preload: 'auto',
        fluid: true,
        responsive: true,
        html5: {
          vhs: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
            handleManifestRedirects: true
          },
          hls: {
            overrideNative: true,
            enableLowInitialPlaylist: true
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false
        },
        techOrder: ['html5'],
        sources: [{
          src: url,
          type: videoType
        }]
      })
      
      this.player.ready(() => {
        console.log('播放器已准备就绪')
        this.playerReady = true
        this.player.play().catch(e => {
          console.error('自动播放失败:', e)
          console.log('请手动点击播放按钮')
        })
      })
      
      this.player.on('error', () => {
        console.error('视频播放错误')
        const error = this.player.error()
        console.error('错误代码:', error ? error.code : '未知')
        console.error('错误信息:', error ? error.message : '未知')
        
        if (error && error.code === 4) {
          console.log('尝试使用备用视频格式...')
          setTimeout(() => {
            this.createPlayerWithFallback(url)
          }, 500)
          return
        }
        
        if (error && error.code === 2) {
          console.error('网络错误，可能是代理超时')
          console.log('建议：尝试关闭代理或选择其他直播源')
        }
        
        if (error) {
          let errorMessage = '播放失败: '
          switch(error.code) {
            case 1:
              errorMessage += '视频加载被中止'
              break
            case 2:
              errorMessage += '网络错误，无法加载视频（可能是代理超时）'
              break
            case 3:
              errorMessage += '视频解码错误'
              break
            case 4:
              errorMessage += '不支持的视频格式或源不可用'
              break
            default:
              errorMessage += '未知错误'
          }
          console.error(errorMessage)
          
          if (this.useProxy) {
            errorMessage += '\n\n提示：可以尝试关闭代理模式（点击左侧时钟图标）'
          }
          
          alert(errorMessage)
        }
      })
      
      this.player.on('loadedmetadata', () => {
        console.log('视频元数据已加载')
      })
      
      this.player.on('canplay', () => {
        console.log('视频可以开始播放')
      })
    },
    detectVideoType(url) {
      const extension = url.split('.').pop().toLowerCase().split('?')[0]
      
      const typeMap = {
        'm3u8': 'application/x-mpegURL',
        'mpd': 'application/dash+xml',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'flv': 'video/x-flv',
        'ts': 'video/mp2t',
        'm3u': 'application/x-mpegURL'
      }
      
      return typeMap[extension] || 'application/x-mpegURL'
    },
    createPlayerWithFallback(url) {
      console.log('使用备用格式尝试播放:', url)
      
      this.destroyPlayer()
      
      const container = this.$refs.videoContainer
      if (!container) return
      
      const videoElement = document.createElement('video')
      videoElement.className = 'video-js vjs-big-play-centered'
      videoElement.setAttribute('controls', '')
      videoElement.setAttribute('autoplay', '')
      videoElement.setAttribute('crossorigin', 'anonymous')
      
      container.appendChild(videoElement)
      
      const fallbackTypes = [
        'application/x-mpegURL',
        'application/vnd.apple.mpegurl',
        'video/mp4',
        'video/webm',
        'video/x-flv'
      ]
      
      this.player = videojs(videoElement, {
        controls: true,
        autoplay: true,
        preload: 'auto',
        fluid: true,
        responsive: true,
        html5: {
          vhs: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
            handleManifestRedirects: true
          },
          hls: {
            overrideNative: true,
            enableLowInitialPlaylist: true
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false
        },
        techOrder: ['html5'],
        sources: fallbackTypes.map(type => ({
          src: url,
          type: type
        }))
      })
      
      this.player.ready(() => {
        console.log('备用播放器已准备就绪')
        this.player.play().catch(e => {
          console.error('备用自动播放失败:', e)
        })
      })
      
      this.player.on('error', () => {
        console.error('备用播放器也失败了')
        alert('该频道暂时无法播放，请尝试其他频道')
      })
    },
    loadSources() {
      try {
        const saved = localStorage.getItem('tv_sources')
        if (saved) {
          this.sources = JSON.parse(saved)
        }
      } catch (e) {
        console.error('加载直播源失败:', e)
      }
    },
    saveSources() {
      try {
        localStorage.setItem('tv_sources', JSON.stringify(this.sources))
      } catch (e) {
        console.error('保存直播源失败:', e)
      }
    },
    loadDefaultSources() {
      const defaultSources = [
        {
          id: 'yan-g-1989',
          name: 'YanG-1989',
          url: 'https://tv.iill.top/m3u/Gather',
          type: 'IPV4',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'vbskycn-ipv6',
          name: 'vbskycn',
          url: 'https://live.zbds.org/tv/iptv6.m3u',
          type: 'IPV6',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'vbskycn-ipv4',
          name: 'vbskycn',
          url: 'https://live.zbds.org/tv/iptv4.m3u',
          type: 'IPV4',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'guovin-ipv6',
          name: 'Guovin',
          url: 'https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/ipv6/result.m3u',
          type: 'IPV6',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'guovin-ipv4',
          name: 'Guovin',
          url: 'https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/ipv4/result.m3u',
          type: 'IPV4',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'fanmingming',
          name: 'fanmingming',
          url: 'https://live.fanmingming.cn/tv/m3u/ipv6.m3u',
          type: 'IPV6',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'yuechan',
          name: 'YueChan',
          url: 'https://raw.githubusercontent.com/YueChan/Live/refs/heads/main/IPTV.m3u',
          type: 'IPV4',
          status: 'unknown',
          isDefault: true,
          channels: []
        },
        {
          id: 'kimentanm',
          name: 'Kimentanm',
          url: 'https://raw.githubusercontent.com/Kimentanm/aptv/master/m3u/iptv.m3u',
          type: 'IPV4',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'burningc4',
          name: 'BurningC4',
          url: 'https://raw.githubusercontent.com/BurningC4/Chinese-IPTV/master/TV-IPV4.m3u',
          type: 'IPV4',
          status: 'unknown',
          isDefault: true,
          channels: []
        },
        {
          id: 'zwc456baby',
          name: 'zwc456baby',
          url: 'https://raw.githubusercontent.com/zwc456baby/iptv_alive/refs/heads/master/live.m3u',
          type: 'IPV4',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'chinaiptv',
          name: 'ChinaIPTV',
          url: 'https://raw.githubusercontent.com/hujingguang/ChinaIPTV/main/cnTV_AutoUpdate.m3u8',
          type: 'IPV4',
          status: 'unknown',
          isDefault: true,
          channels: []
        },
        {
          id: 'myiptv-ipv4',
          name: 'myIPTV',
          url: 'https://raw.githubusercontent.com/suxuang/myIPTV/refs/heads/main/ipv4.m3u',
          type: 'IPV4',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'myiptv-ipv6',
          name: 'myIPTV',
          url: 'https://raw.githubusercontent.com/suxuang/myIPTV/refs/heads/main/ipv6.m3u',
          type: 'IPV6',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'iptv-sources',
          name: 'iptv-sources',
          url: 'https://m3u.ibert.me/fmml_ipv6.m3u',
          type: 'IPV6',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'joevess',
          name: 'joevess',
          url: 'https://raw.githubusercontent.com/joevess/IPTV/main/m3u/iptv.m3u',
          type: 'IPV4',
          status: 'unknown',
          isDefault: true,
          channels: []
        },
        {
          id: 'ftindy',
          name: 'Ftindy',
          url: 'https://raw.githubusercontent.com/Ftindy/IPTV-URL/main/IPV6.m3u',
          type: 'IPV4',
          status: 'good',
          isDefault: true,
          channels: []
        },
        {
          id: 'aktv',
          name: 'AKTV',
          url: 'https://aktv.space/live.m3u',
          type: 'IPV4',
          status: 'unknown',
          isDefault: true,
          channels: []
        }
      ]
      
      if (this.sources.length === 0) {
        this.sources = defaultSources
        this.saveSources()
      } else {
        const existingIds = this.sources.map(s => s.id)
        const newSources = defaultSources.filter(s => !existingIds.includes(s.id))
        this.sources = [...this.sources, ...newSources]
        this.saveSources()
      }
    },
    async selectSource(source) {
      this.selectedSourceId = source.id
      this.currentChannel = null
      this.destroyPlayer()
      
      if (source.channels.length === 0 && source.url) {
        source.status = 'loading'
        await this.fetchSourceChannels(source)
      }
    },
    async fetchSourceChannels(source) {
      try {
        const response = await fetch(source.url)
        const content = await response.text()
        const channels = this.parseM3U(content)
        
        source.channels = channels
        source.status = 'good'
        this.saveSources()
      } catch (e) {
        console.error('获取直播源失败:', e)
        source.status = 'error'
        alert('获取直播源失败：' + e.message)
      }
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
            url: '',
            originalUrl: ''
          }
        } else if (line && !line.startsWith('#') && currentChannel) {
          currentChannel.originalUrl = line
          currentChannel.url = this.getProxiedUrl(line)
          channels.push(currentChannel)
          currentChannel = null
        }
      }
      
      return channels
    },
    playChannel(channel) {
      this.currentChannel = channel.id
      const proxiedUrl = this.getProxiedUrl(channel.url)
      this.createPlayer(proxiedUrl)
    },
    getProxiedUrl(url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return url
      }
      
      if (!this.useProxy) {
        return url
      }
      
      const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
      ]
      
      const proxy = corsProxies[Math.floor(Math.random() * corsProxies.length)]
      console.log('使用代理:', proxy)
      return proxy + encodeURIComponent(url)
    },
    addSource(source) {
      this.sources.push({
        id: Date.now().toString(),
        name: source.name,
        url: source.url,
        type: 'IPV4',
        status: 'unknown',
        isDefault: false,
        channels: source.channels
      })
      this.saveSources()
      this.showAddSource = false
    },
    deleteSource(sourceId) {
      this.confirmConfig = {
        title: '删除直播源',
        message: '确定要删除这个直播源吗？',
        type: 'warning',
        confirmText: '删除',
        cancelText: '取消'
      }
      this.pendingAction = () => {
        this.sources = this.sources.filter(s => s.id !== sourceId)
        if (this.selectedSourceId === sourceId) {
          this.selectedSourceId = null
          this.currentChannel = null
          this.destroyPlayer()
        }
        this.saveSources()
      }
      this.showConfirm = true
    },
    importSource() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.m3u,.json'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            try {
              const content = event.target.result
              const name = file.name.replace(/\.[^/.]+$/, '')
              
              if (file.name.endsWith('.m3u')) {
                const channels = this.parseM3U(content)
                this.addSource({
                  name: name,
                  url: '',
                  channels: channels
                })
              } else if (file.name.endsWith('.json')) {
                const data = JSON.parse(content)
                this.addSource({
                  name: name,
                  url: '',
                  channels: data.channels || data
                })
              }
            } catch (e) {
              alert('导入失败：' + e.message)
            }
          }
          reader.readAsText(file)
        }
      }
      input.click()
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
.tv-app {
  display: flex;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
}

.tv-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.proxy-toggle {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.proxy-toggle:hover {
  border-color: #667eea;
  color: #667eea;
}

.proxy-toggle.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.proxy-toggle svg {
  width: 18px;
  height: 18px;
}

.add-source-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-source-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.add-source-btn svg {
  width: 18px;
  height: 18px;
}

.source-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.source-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.source-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.source-item.active::before {
  transform: scaleY(1);
}

.source-item:hover {
  background: #f0f0f0;
  transform: translateX(2px);
}

.source-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.source-item.active .source-name {
  color: #667eea;
  font-weight: 600;
}

.source-item.active .source-type {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.source-info {
  flex: 1;
}

.source-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.source-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-type {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f0f0f0;
  color: #666;
}

.source-status {
  font-size: 12px;
  font-weight: 600;
}

.source-status.good {
  color: #4caf50;
}

.source-status.loading {
  color: #ff9800;
}

.source-status.error {
  color: #f44336;
}

.source-status.unknown {
  color: #999;
}

.delete-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.source-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(255, 95, 87, 0.1);
  color: #ff5f57;
}

.delete-btn svg {
  width: 14px;
  height: 14px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.import-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: white;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  border: 1px solid #667eea;
}

.import-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.import-btn svg {
  width: 18px;
  height: 18px;
}

.tv-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  padding: 16px;
  gap: 16px;
}

.video-container {
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  min-height: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.video-container :deep(.video-js) {
  width: 100% !important;
  height: 100% !important;
}

.video-container :deep(.vjs-big-play-centered) {
  width: 100% !important;
  height: 100% !important;
}

.no-channel {
  text-align: center;
  color: white;
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-channel svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-channel p {
  margin: 0;
  font-size: 16px;
  opacity: 0.7;
}

.channel-list {
  height: 300px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: height 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.channel-list.with-video {
  height: 250px;
}

.channel-search {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.channels-grid {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.channel-item {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
}

.channel-item:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.channel-item.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.channel-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.channel-logo svg {
  width: 24px;
  height: 24px;
  color: #667eea;
}

.channel-info {
  flex: 1;
  min-width: 0;
}

.channel-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.channel-group {
  font-size: 12px;
  color: #999;
}
</style>
