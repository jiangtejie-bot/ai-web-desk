<template>
  <div class="translator-app">
    <div class="translator-container">
      <div class="translator-header">
        <h3>同声传译</h3>
        <div class="language-selector">
          <select v-model="sourceLanguage" class="lang-select">
            <option value="zh-CN">中文</option>
            <option value="en-US">English</option>
            <option value="ja-JP">日本語</option>
            <option value="ko-KR">한국어</option>
            <option value="fr-FR">Français</option>
            <option value="de-DE">Deutsch</option>
            <option value="es-ES">Español</option>
          </select>
          <svg class="exchange-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/>
          </svg>
          <select v-model="targetLanguage" class="lang-select">
            <option value="en-US">English</option>
            <option value="zh-CN">中文</option>
            <option value="ja-JP">日本語</option>
            <option value="ko-KR">한국어</option>
            <option value="fr-FR">Français</option>
            <option value="de-DE">Deutsch</option>
            <option value="es-ES">Español</option>
          </select>
        </div>
      </div>

      <div class="translator-content">
        <div class="recording-area">
          <div class="waveform-container" v-if="isRecording">
            <canvas ref="waveformCanvas" class="waveform-canvas"></canvas>
          </div>
          
          <div class="record-button-container">
            <button 
              class="record-button"
              :class="{ recording: isRecording, processing: isProcessing }"
              @mousedown="startRecording"
              @mouseup="stopRecording"
              @mouseleave="stopRecording"
              @touchstart.prevent="startRecording"
              @touchend.prevent="stopRecording"
            >
              <div class="record-button-inner">
                <svg v-if="!isRecording && !isProcessing" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                <div v-else class="recording-indicator">
                  <div class="pulse-ring"></div>
                  <div class="pulse-ring delay-1"></div>
                  <div class="pulse-ring delay-2"></div>
                </div>
              </div>
            </button>
            <p class="record-hint">长按录音</p>
          </div>
        </div>

        <div class="translation-results">
          <div class="translation-section">
            <div class="section-header">
              <span class="section-label">原文</span>
              <button class="copy-btn" @click="copyText(sourceText)" v-if="sourceText">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="4" y="2" width="12" height="14" rx="2"/>
                  <line x1="8" y1="12" x2="12" y2="12"/>
                  <line x1="8" y1="8" x2="12" y2="8"/>
                </svg>
              </button>
            </div>
            <div class="section-content source-content">
              <p v-if="sourceText">{{ sourceText }}</p>
              <p v-else class="placeholder">等待录音...</p>
            </div>
          </div>

          <div class="translation-section">
            <div class="section-header">
              <span class="section-label">译文</span>
              <button class="copy-btn" @click="copyText(translatedText)" v-if="translatedText">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="4" y="2" width="12" height="14" rx="2"/>
                  <line x1="8" y1="12" x2="12" y2="12"/>
                  <line x1="8" y1="8" x2="12" y2="8"/>
                </svg>
              </button>
            </div>
            <div class="section-content target-content">
              <p v-if="translatedText">{{ translatedText }}</p>
              <p v-else class="placeholder">等待翻译...</p>
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
  </div>
</template>

<script>
export default {
  name: 'TranslatorApp',
  data() {
    return {
      sourceLanguage: 'zh-CN',
      targetLanguage: 'en-US',
      isRecording: false,
      isProcessing: false,
      sourceText: '',
      translatedText: '',
      mediaRecorder: null,
      audioChunks: [],
      recognition: null,
      animationId: null,
      showToast: false,
      toastMessage: '',
      toastSuccess: true,
      recognitionRestartTimeout: null
    }
  },
  mounted() {
    this.initSpeechRecognition()
  },
  beforeUnmount() {
    this.stopRecording()
    if (this.recognitionRestartTimeout) {
      clearTimeout(this.recognitionRestartTimeout)
    }
    if (this.recognition) {
      this.recognition.stop()
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  },
  methods: {
    initSpeechRecognition() {
      if (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.lang = this.sourceLanguage
        
        this.recognition.onresult = (event) => {
          let interimTranscript = ''
          let finalTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          if (finalTranscript) {
            this.sourceText = finalTranscript
            this.translateText(finalTranscript)
          } else if (interimTranscript) {
            this.sourceText = interimTranscript
          }
        }
        
        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          if (event.error === 'not-allowed') {
            console.warn('Speech recognition permission denied')
          }
        }
        
        this.recognition.onend = () => {
          if (this.isRecording) {
            if (this.recognitionRestartTimeout) {
              clearTimeout(this.recognitionRestartTimeout)
            }
            this.recognitionRestartTimeout = setTimeout(() => {
              if (this.isRecording) {
                try {
                  this.recognition.start()
                } catch (e) {
                  console.error('Failed to restart recognition:', e)
                }
              }
            }, 100)
          }
        }
      } else {
        console.warn('Speech recognition not supported')
        this.showToastMessage('浏览器不支持语音识别', false)
      }
    },
    async startRecording() {
      if (this.isRecording || this.isProcessing) return
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        
        this.mediaRecorder = new MediaRecorder(stream)
        this.audioChunks = []
        
        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data)
        }
        
        this.mediaRecorder.start()
        
        if (this.recognition) {
          try {
            this.recognition.lang = this.sourceLanguage
            this.recognition.start()
          } catch (recognitionError) {
            console.warn('Speech recognition failed:', recognitionError)
          }
        }
        
        this.startWaveform()
        this.sourceText = ''
        this.translatedText = ''
        
        this.isRecording = true
      } catch (error) {
        console.error('Error accessing microphone:', error)
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          this.showToastMessage('请允许麦克风访问权限', false)
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          this.showToastMessage('未找到麦克风设备', false)
        } else {
          this.showToastMessage('无法访问麦克风', false)
        }
      }
    },
    stopRecording() {
      if (!this.isRecording) return
      
      this.isRecording = false
      this.isProcessing = true
      
      if (this.recognitionRestartTimeout) {
        clearTimeout(this.recognitionRestartTimeout)
        this.recognitionRestartTimeout = null
      }
      
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop()
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
      
      if (this.recognition) {
        this.recognition.stop()
      }
      
      this.stopWaveform()
      
      setTimeout(() => {
        this.isProcessing = false
      }, 200)
    },
    async translateText(text) {
      try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${this.sourceLanguage}|${this.targetLanguage}`)
        const data = await response.json()
        
        if (data.responseStatus === 200 && data.responseData) {
          this.translatedText = data.responseData.translatedText
        }
      } catch (error) {
        console.error('Translation error:', error)
        this.translatedText = '翻译失败，请重试'
      }
    },
    startWaveform() {
      const canvas = this.$refs.waveformCanvas
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.scale(2, 2)
      
      const animate = () => {
        if (!this.isRecording) return
        
        const width = canvas.offsetWidth
        const height = canvas.offsetHeight
        
        ctx.clearRect(0, 0, width, height)
        
        const bars = 30
        const barWidth = width / bars
        
        for (let i = 0; i < bars; i++) {
          const barHeight = Math.random() * height * 0.8 + height * 0.1
          const x = i * barWidth
          const y = (height - barHeight) / 2
          
          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
          gradient.addColorStop(0, '#667eea')
          gradient.addColorStop(1, '#764ba2')
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 4)
          ctx.fill()
        }
        
        this.animationId = requestAnimationFrame(animate)
      }
      
      animate()
    },
    stopWaveform() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
    },
    copyText(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToastMessage('已复制到剪贴板', true)
      }).catch(() => {
        this.showToastMessage('复制失败', false)
      })
    },
    showToastMessage(message, success) {
      this.toastMessage = message
      this.toastSuccess = success
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 2000)
    }
  }
}
</script>

<style scoped>
.translator-app {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.translator-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.translator-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.translator-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.lang-select:hover {
  border-color: #667eea;
}

.lang-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.exchange-icon {
  width: 20px;
  height: 20px;
  color: #999;
  flex-shrink: 0;
}

.translator-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
}

.recording-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.waveform-container {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.waveform-canvas {
  width: 100%;
  height: 100%;
}

.record-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.record-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.record-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.record-button.recording {
  background: linear-gradient(135deg, #ff5f57 0%, #ff3b30 100%);
  box-shadow: 0 4px 12px rgba(255, 95, 87, 0.3);
}

.record-button.recording:hover {
  box-shadow: 0 6px 16px rgba(255, 95, 87, 0.4);
}

.record-button.processing {
  background: #999;
  box-shadow: none;
  cursor: not-allowed;
}

.record-button-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.record-button-inner svg {
  width: 32px;
  height: 32px;
}

.recording-indicator {
  position: relative;
  width: 32px;
  height: 32px;
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 1.5s ease-out infinite;
}

.pulse-ring.delay-1 {
  animation-delay: 0.5s;
}

.pulse-ring.delay-2 {
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.record-hint {
  margin: 0;
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.translation-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.translation-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-height: 120px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.copy-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.copy-btn svg {
  width: 14px;
  height: 14px;
}

.section-content {
  flex: 1;
  min-height: 60px;
}

.section-content p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.section-content .placeholder {
  color: #999;
  font-style: italic;
}

.source-content {
  color: #333;
}

.target-content {
  color: #667eea;
  font-weight: 500;
}

.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
  z-index: 1000;
}

.toast.success {
  background: #28c840;
}

.toast svg {
  width: 16px;
  height: 16px;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
</style>
