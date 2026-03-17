<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>添加书签</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="dialog-body">
        <div class="form-group">
          <label>书签标题 *</label>
          <input 
            v-model="bookmark.title" 
            type="text" 
            placeholder="请输入书签标题"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>网址 *</label>
          <input 
            v-model="bookmark.url" 
            type="url" 
            placeholder="https://example.com"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>分类</label>
          <select v-model="bookmark.categoryId" class="form-select">
            <option 
              v-for="category in categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="$emit('close')">
          取消
        </button>
        <button class="btn btn-primary" @click="submit" :disabled="!isValid">
          添加
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddBookmarkDialog',
  props: {
    categories: {
      type: Array,
      default: () => []
    },
    defaultCategory: {
      type: String,
      default: 'other'
    }
  },
  data() {
    return {
      bookmark: {
        title: '',
        url: '',
        categoryId: this.defaultCategory
      }
    }
  },
  computed: {
    isValid() {
      return this.bookmark.title.trim() && 
             this.bookmark.url.trim() && 
             this.bookmark.categoryId
    }
  },
  methods: {
    submit() {
      if (this.isValid) {
        let url = this.bookmark.url.trim()
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url
        }
        
        this.$emit('add', {
          title: this.bookmark.title.trim(),
          url: url,
          categoryId: this.bookmark.categoryId
        })
        
        this.bookmark = {
          title: '',
          url: '',
          categoryId: this.defaultCategory
        }
      }
    }
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  width: 450px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
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
  background: rgba(255, 95, 87, 0.1);
  color: #ff5f57;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input, .form-select {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
}

.form-input:focus, .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4l1-1 5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
</style>
