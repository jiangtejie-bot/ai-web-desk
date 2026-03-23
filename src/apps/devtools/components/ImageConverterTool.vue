<template>
  <div class="image-converter-tool">
    <div class="tool-header">
      <h2 class="tool-title">图片转换工具</h2>
      <p class="tool-description">支持多种图片格式之间的相互转换</p>
    </div>

    <div class="converter-content">
      <div class="upload-section">
        <div class="upload-area" :class="{ 'dragover': isDragOver }" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop" @click="triggerFileInput">
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            @change="onFileChange"
            style="display: none"
          />
          <div class="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div class="upload-text">
            <p class="upload-main-text">点击或拖拽图片到此处</p>
            <p class="upload-sub-text">支持 PNG、JPG、WebP、GIF 等格式</p>
          </div>
        </div>
      </div>

      <div class="preview-section" v-if="imageData">
        <div class="preview-header">
          <h3 class="preview-title">图片预览</h3>
          <div class="image-info">
            <span class="info-item">{{ imageData.originalName }}</span>
            <span class="info-item">{{ imageData.originalSize }}</span>
          </div>
        </div>
        <div class="preview-container">
          <img :src="imageData.preview" class="preview-image" alt="预览" />
        </div>
      </div>

      <div class="options-section" v-if="imageData">
        <div class="option-group">
          <label class="option-label">目标格式：</label>
          <select v-model="targetFormat" class="format-select">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
            <option value="gif">GIF</option>
            <option value="bmp">BMP</option>
          </select>
        </div>

        <div class="option-group" v-if="targetFormat === 'jpeg'">
          <label class="option-label">质量：</label>
          <input 
            type="range" 
            v-model="quality" 
            min="0.1" 
            max="1" 
            step="0.1" 
            class="quality-slider"
          />
          <span class="quality-value">{{ Math.round(quality * 100) }}%</span>
        </div>

        <div class="option-group">
          <label class="option-label">文件名：</label>
          <input 
            type="text" 
            v-model="outputFileName" 
            class="filename-input"
            placeholder="输入文件名（可选）"
          />
        </div>
      </div>

      <div class="action-section" v-if="imageData">
        <button class="action-btn action-btn-primary" @click="convertImage" :disabled="isConverting">
          <svg v-if="!isConverting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 16a4 4 0 0 1-4 4V4a4 4 0 0 1 8 0v8a4 4 0 0 1-4 4z"/>
            <path d="M15 8a4 4 0 0 1 8 0v8a4 4 0 0 1-8 0V8z"/>
            <path d="M4 20h16"/>
          </svg>
          <span v-if="!isConverting">开始转换</span>
          <span v-else>转换中...</span>
        </button>
        <button class="action-btn action-btn-secondary" @click="resetConverter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          重置
        </button>
      </div>

      <div class="result-section" v-if="convertedData">
        <div class="result-header">
          <h3 class="result-title">转换结果</h3>
          <div class="result-info">
            <span class="info-item">{{ convertedData.format.toUpperCase() }}</span>
            <span class="info-item">{{ convertedData.size }}</span>
          </div>
        </div>
        <div class="result-actions">
          <button class="result-btn result-btn-primary" @click="downloadImage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载图片
          </button>
          <button class="result-btn result-btn-secondary" @click="resetConverter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 4"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L23 10"/>
            </svg>
            转换其他
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageConverterTool',
  data() {
    return {
      imageData: null,
      convertedData: null,
      targetFormat: 'png',
      quality: 0.9,
      outputFileName: '',
      isConverting: false,
      isDragOver: false
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    onDragOver() {
      this.isDragOver = true
    },
    onDragLeave() {
      this.isDragOver = false
    },
    onDrop(event) {
      this.isDragOver = false
      const files = event.dataTransfer.files
      if (files.length > 0) {
        this.processFile(files[0])
      }
    },
    onFileChange(event) {
      const files = event.target.files
      if (files.length > 0) {
        this.processFile(files[0])
      }
    },
    processFile(file) {
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          this.imageData = {
            file: file,
            originalName: file.name,
            originalSize: this.formatFileSize(file.size),
            preview: e.target.result,
            width: img.width,
            height: img.height
          }
          this.outputFileName = file.name.substring(0, file.name.lastIndexOf('.'))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    },
    convertImage() {
      if (!this.imageData) return

      this.isConverting = true

      const canvas = document.createElement('canvas')
      canvas.width = this.imageData.width
      canvas.height = this.imageData.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(this.imageData.preview, 0, 0)

      const mimeType = this.getMimeType(this.targetFormat)
      const quality = this.targetFormat === 'jpeg' ? this.quality : undefined

      canvas.toBlob((blob) => {
        if (blob) {
          this.convertedData = {
            blob: blob,
            format: this.targetFormat,
            size: this.formatFileSize(blob.size)
          }
        }
        this.isConverting = false
      }, mimeType, quality)
    },
    downloadImage() {
      if (!this.convertedData) return

      const link = document.createElement('a')
      const fileName = this.outputFileName || 'converted'
      link.download = `${fileName}.${this.convertedData.format}`
      link.href = URL.createObjectURL(this.convertedData.blob)
      link.click()
      URL.revokeObjectURL(link.href)
    },
    resetConverter() {
      this.imageData = null
      this.convertedData = null
      this.outputFileName = ''
      this.$refs.fileInput.value = ''
    },
    getMimeType(format) {
      const mimeTypes = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        bmp: 'image/bmp'
      }
      return mimeTypes[format] || 'image/png'
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.image-converter-tool {
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

.converter-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-section {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
}

.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.upload-area.dragover {
  border-color: #667eea;
  background: #e8f4ff;
}

.upload-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: #667eea;
}

.upload-icon svg {
  width: 100%;
  height: 100%;
}

.upload-text {
  margin-bottom: 8px;
}

.upload-main-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px;
}

.upload-sub-text {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.preview-section {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.image-info {
  display: flex;
  gap: 16px;
}

.info-item {
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.options-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  min-width: 80px;
}

.format-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.quality-slider {
  flex: 1;
  cursor: pointer;
}

.quality-value {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
  min-width: 50px;
}

.filename-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.action-section {
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

.action-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.action-btn-secondary:hover {
  background: #e8e8e8;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.result-section {
  padding: 20px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 8px;
  border: 1px solid #667eea;
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

.result-info {
  display: flex;
  gap: 12px;
}

.result-actions {
  display: flex;
  gap: 12px;
}

.result-btn {
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

.result-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.result-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.result-btn-secondary {
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
}

.result-btn-secondary:hover {
  background: #f8f9ff;
}

.result-btn svg {
  width: 18px;
  height: 18px;
}
</style>
