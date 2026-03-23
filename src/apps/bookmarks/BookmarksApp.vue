<template>
  <div class="bookmarks-app">
    <div class="bookmarks-sidebar">
      <div class="sidebar-header">
        <h3>书签分类</h3>
        <button class="add-category-btn" @click="showAddCategory = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      
      <div class="category-list">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category)"
        >
          <div class="category-info">
            <div class="category-name">{{ category.name }}</div>
            <div class="category-count">{{ getCategoryCount(category.id) }}个书签</div>
          </div>
          <button class="delete-category-btn" @click.stop="deleteCategory(category.id)" v-if="!category.isDefault">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="3" y1="3" x2="13" y2="13"/>
              <line x1="3" y1="13" x2="13" y2="3"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="sidebar-footer">
        <button class="import-btn" @click="importBookmarks">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          导入书签
        </button>
        <button class="export-btn" @click="exportBookmarks">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          导出书签
        </button>
      </div>
    </div>
    
    <div class="bookmarks-main">
      <div class="bookmarks-header">
        <h2>{{ selectedCategoryName }}</h2>
        <button class="add-bookmark-btn" @click="showAddBookmark = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加书签
        </button>
      </div>
      
      <div class="bookmarks-grid">
        <div 
          v-for="bookmark in filteredBookmarks" 
          :key="bookmark.id"
          class="bookmark-card"
          @click="openBookmark(bookmark)"
        >
          <div class="bookmark-favicon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10"/>
              <path d="M12 2v20"/>
            </svg>
          </div>
          <div class="bookmark-info">
            <div class="bookmark-title">{{ bookmark.title }}</div>
            <div class="bookmark-url">{{ bookmark.url }}</div>
            <div class="bookmark-meta">
              <span class="bookmark-date">{{ formatDate(bookmark.createdAt) }}</span>
            </div>
          </div>
          <button class="bookmark-actions" @click.stop="showBookmarkMenu(bookmark)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="filteredBookmarks.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16z"/>
        </svg>
        <p>暂无书签</p>
        <p>点击"添加书签"开始收藏</p>
      </div>
    </div>
    
    <add-category-dialog 
      v-if="showAddCategory"
      @close="showAddCategory = false"
      @add="addCategory"
    />
    
    <add-bookmark-dialog 
      v-if="showAddBookmark"
      :categories="categories"
      :default-category="selectedCategory"
      @close="showAddBookmark = false"
      @add="addBookmark"
    />
    
    <edit-bookmark-dialog
      v-if="editingBookmark"
      :bookmark="editingBookmark"
      :categories="categories"
      @close="editingBookmark = null"
      @save="saveBookmark"
      @delete="deleteBookmark"
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
import { storage } from '../../utils/crypto'
import AddCategoryDialog from './AddCategoryDialog.vue'
import AddBookmarkDialog from './AddBookmarkDialog.vue'
import EditBookmarkDialog from './EditBookmarkDialog.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'

export default {
  name: 'BookmarksApp',
  components: {
    AddCategoryDialog,
    AddBookmarkDialog,
    EditBookmarkDialog,
    ConfirmDialog
  },
  data() {
    return {
      categories: [],
      bookmarks: [],
      selectedCategory: null,
      showAddCategory: false,
      showAddBookmark: false,
      editingBookmark: null,
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
    selectedCategoryName() {
      if (!this.selectedCategory) return '全部书签'
      const category = this.categories.find(c => c.id === this.selectedCategory)
      return category ? category.name : '全部书签'
    },
    filteredBookmarks() {
      if (!this.selectedCategory) return this.bookmarks
      
      return this.bookmarks.filter(b => b.categoryId === this.selectedCategory)
    }
  },
  mounted() {
    this.loadCategories()
    this.loadBookmarks()
    this.selectedCategory = 'all'
  },
  methods: {
    loadCategories() {
      try {
        const saved = storage.getItem('bookmark_categories')
        if (saved) {
          this.categories = saved
        } else {
          this.loadDefaultCategories()
        }
      } catch (e) {
        console.error('加载分类失败:', e)
        this.loadDefaultCategories()
      }
    },
    loadDefaultCategories() {
      this.categories = [
        { id: 'all', name: '全部书签', isDefault: true },
        { id: 'video', name: '影视', isDefault: true },
        { id: 'ai', name: 'AI', isDefault: true },
        { id: 'code', name: '代码', isDefault: true },
        { id: 'tools', name: '工具', isDefault: true },
        { id: 'news', name: '新闻', isDefault: true },
        { id: 'education', name: '教育', isDefault: true },
        { id: 'entertainment', name: '娱乐', isDefault: true },
        { id: 'other', name: '其他', isDefault: true }
      ]
      this.saveCategories()
    },
    saveCategories() {
      try {
        storage.setItem('bookmark_categories', this.categories)
      } catch (e) {
        console.error('保存分类失败:', e)
      }
    },
    loadBookmarks() {
      try {
        const saved = storage.getItem('bookmarks_data')
        if (saved) {
          this.bookmarks = saved
        }
      } catch (e) {
        console.error('加载书签失败:', e)
      }
    },
    saveBookmarks() {
      try {
        storage.setItem('bookmarks_data', this.bookmarks)
      } catch (e) {
        console.error('保存书签失败:', e)
      }
    },
    selectCategory(category) {
      this.selectedCategory = category.id
    },
    getCategoryCount(categoryId) {
      if (categoryId === 'all') return this.bookmarks.length
      return this.bookmarks.filter(b => b.categoryId === categoryId).length
    },
    addCategory(category) {
      this.categories.push({
        id: Date.now().toString(),
        name: category.name,
        isDefault: false
      })
      this.saveCategories()
      this.showAddCategory = false
    },
    deleteCategory(categoryId) {
      this.confirmConfig = {
        title: '删除分类',
        message: '确定要删除这个分类吗？分类下的书签也会被删除。',
        type: 'warning',
        confirmText: '删除',
        cancelText: '取消'
      }
      this.pendingAction = () => {
        this.categories = this.categories.filter(c => c.id !== categoryId)
        this.bookmarks = this.bookmarks.filter(b => b.categoryId !== categoryId)
        
        if (this.selectedCategory === categoryId) {
          this.selectedCategory = 'all'
        }
        
        this.saveCategories()
        this.saveBookmarks()
      }
      this.showConfirm = true
    },
    addBookmark(bookmark) {
      this.bookmarks.push({
        id: Date.now().toString(),
        title: bookmark.title,
        url: bookmark.url,
        categoryId: bookmark.categoryId,
        createdAt: new Date().toISOString()
      })
      this.saveBookmarks()
      this.showAddBookmark = false
    },
    showBookmarkMenu(bookmark) {
      this.editingBookmark = bookmark
    },
    saveBookmark(updatedBookmark) {
      const index = this.bookmarks.findIndex(b => b.id === updatedBookmark.id)
      if (index !== -1) {
        this.bookmarks[index] = updatedBookmark
        this.saveBookmarks()
      }
      this.editingBookmark = null
    },
    deleteBookmark(bookmarkId) {
      this.confirmConfig = {
        title: '删除书签',
        message: '确定要删除这个书签吗？',
        type: 'warning',
        confirmText: '删除',
        cancelText: '取消'
      }
      this.pendingAction = () => {
        this.bookmarks = this.bookmarks.filter(b => b.id !== bookmarkId)
        this.saveBookmarks()
        this.editingBookmark = null
      }
      this.showConfirm = true
    },
    openBookmark(bookmark) {
      window.open(bookmark.url, '_blank')
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return '今天'
      if (days === 1) return '昨天'
      if (days < 7) return `${days}天前`
      if (days < 30) return `${Math.floor(days / 7)}周前`
      if (days < 365) return `${Math.floor(days / 30)}个月前`
      return `${Math.floor(days / 365)}年前`
    },
    importBookmarks() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result)
              if (data.bookmarks) {
                this.bookmarks = [...this.bookmarks, ...data.bookmarks]
                this.saveBookmarks()
                alert(`成功导入${data.bookmarks.length}个书签`)
              }
              if (data.categories) {
                const newCategories = data.categories.filter(c => 
                  !this.categories.find(existing => existing.id === c.id)
                )
                this.categories = [...this.categories, ...newCategories]
                this.saveCategories()
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
    exportBookmarks() {
      const data = {
        categories: this.categories.filter(c => !c.isDefault),
        bookmarks: this.bookmarks,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookmarks_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
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
.bookmarks-app {
  display: flex;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
}

.bookmarks-sidebar {
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

.add-category-btn {
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

.add-category-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.add-category-btn svg {
  width: 18px;
  height: 18px;
}

.category-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.category-item {
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

.category-item::before {
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

.category-item.active::before {
  transform: scaleY(1);
}

.category-item:hover {
  background: #f0f0f0;
  transform: translateX(2px);
}

.category-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.category-item.active .category-name {
  color: #667eea;
  font-weight: 600;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.category-count {
  font-size: 11px;
  color: #999;
}

.delete-category-btn {
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

.category-item:hover .delete-category-btn {
  opacity: 1;
}

.delete-category-btn:hover {
  background: rgba(255, 95, 87, 0.1);
  color: #ff5f57;
}

.delete-category-btn svg {
  width: 14px;
  height: 14px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.import-btn, .export-btn {
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

.import-btn:hover, .export-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.import-btn svg, .export-btn svg {
  width: 18px;
  height: 18px;
}

.bookmarks-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  padding: 16px;
  gap: 16px;
}

.bookmarks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.bookmarks-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.add-bookmark-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.add-bookmark-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.add-bookmark-btn svg {
  width: 18px;
  height: 18px;
}

.bookmarks-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding-bottom: 16px;
}

.bookmark-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.bookmark-card:hover {
  border-color: rgba(102, 126, 234, 0.2);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.12);
  transform: translateY(-6px);
}

.bookmark-favicon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.2);
}

.bookmark-favicon svg {
  width: 18px;
  height: 18px;
  color: white;
}

.bookmark-info {
  flex: 1;
  min-width: 0;
}

.bookmark-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
}

.bookmark-url {
  font-size: 11px;
  color: #8b949e;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

.bookmark-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bookmark-date {
  font-size: 10px;
  color: #a0a0a0;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 8px;
  border-radius: 6px;
}

.bookmark-actions {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  color: #8b949e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}

.bookmark-card:hover .bookmark-actions {
  opacity: 1;
  background: rgba(102, 126, 234, 0.08);
}

.bookmark-actions:hover {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  transform: scale(1.1);
}

.bookmark-actions svg {
  width: 14px;
  height: 14px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 4px 0;
  font-size: 14px;
}
</style>
