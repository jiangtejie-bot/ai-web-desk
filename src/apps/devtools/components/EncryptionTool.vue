<template>
  <div class="encryption-tool">
    <div class="tool-header">
      <h2 class="tool-title">加解密工具</h2>
      <p class="tool-description">支持多种加密算法的文本加解密</p>
    </div>

    <div class="encryption-content">
      <div class="encryption-type-selector">
        <label class="selector-label">加密算法：</label>
        <select v-model="encryptionType" class="encryption-select">
          <option value="base64">Base64</option>
          <option value="md5">MD5</option>
          <option value="sha256">SHA-256</option>
          <option value="sha512">SHA-512</option>
        </select>
      </div>

      <div class="input-section">
        <label class="input-label">输入文本：</label>
        <textarea 
          v-model="inputText" 
          class="text-input"
          placeholder="请输入要加密或解密的文本..."
          rows="6"
        ></textarea>
      </div>

      <div class="action-buttons">
        <button class="action-btn action-btn-primary" @click="encrypt">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          加密
        </button>
        <button class="action-btn action-btn-secondary" @click="decrypt" :disabled="!canDecrypt">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <line x1="12" y1="17" x2="12" y2="17"/>
          </svg>
          解密
        </button>
        <button class="action-btn action-btn-tertiary" @click="clear">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          清空
        </button>
      </div>

      <div class="output-section" v-if="outputText">
        <div class="output-header">
          <label class="output-label">结果：</label>
          <button class="copy-btn" @click="copyOutput" title="复制结果">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            复制
          </button>
        </div>
        <textarea 
          v-model="outputText" 
          class="text-output"
          readonly
          rows="6"
        ></textarea>
      </div>

      <div class="info-section">
        <div class="info-card">
          <h4 class="info-title">算法说明</h4>
          <div class="info-content">
            <p><strong>Base64：</strong>可逆编码，常用于数据传输</p>
            <p><strong>MD5：</strong>不可逆哈希，128位摘要</p>
            <p><strong>SHA-256：</strong>不可逆哈希，256位摘要</p>
            <p><strong>SHA-512：</strong>不可逆哈希，512位摘要</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CryptoJS from 'crypto-js'

export default {
  name: 'EncryptionTool',
  data() {
    return {
      encryptionType: 'base64',
      inputText: '',
      outputText: ''
    }
  },
  computed: {
    canDecrypt() {
      return this.encryptionType === 'base64' && this.inputText.length > 0
    }
  },
  methods: {
    encrypt() {
      if (!this.inputText.trim()) {
        this.outputText = ''
        return
      }

      try {
        switch (this.encryptionType) {
          case 'base64':
            this.outputText = btoa(encodeURIComponent(this.inputText))
            break
          case 'md5':
            this.outputText = CryptoJS.MD5(this.inputText).toString()
            break
          case 'sha256':
            this.outputText = CryptoJS.SHA256(this.inputText).toString()
            break
          case 'sha512':
            this.outputText = CryptoJS.SHA512(this.inputText).toString()
            break
        }
      } catch (error) {
        this.outputText = '加密失败：' + error.message
      }
    },
    decrypt() {
      if (!this.inputText.trim()) {
        this.outputText = ''
        return
      }

      if (this.encryptionType !== 'base64') {
        this.outputText = '该算法不支持解密（单向哈希）'
        return
      }

      try {
        this.outputText = decodeURIComponent(atob(this.inputText))
      } catch (error) {
        this.outputText = '解密失败：' + error.message
      }
    },
    clear() {
      this.inputText = ''
      this.outputText = ''
    },
    copyOutput() {
      if (this.outputText) {
        navigator.clipboard.writeText(this.outputText)
          .then(() => {
            alert('复制成功！')
          })
          .catch(err => {
            console.error('复制失败：', err)
          })
      }
    }
  }
}
</script>

<style scoped>
.encryption-tool {
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

.encryption-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.encryption-type-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.encryption-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  resize: vertical;
  transition: border-color 0.2s;
}

.text-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-btn-secondary {
  background: #4caf50;
  color: white;
}

.action-btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.action-btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn-tertiary {
  background: #f5f5f5;
  color: #666;
}

.action-btn-tertiary:hover {
  background: #e8e8e8;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.output-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.output-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
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

.text-output {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  resize: vertical;
}

.info-section {
  margin-top: 20px;
}

.info-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.info-content p {
  font-size: 13px;
  color: #666;
  margin: 8px 0;
  line-height: 1.6;
}

.info-content strong {
  color: #333;
  font-weight: 600;
}
</style>
