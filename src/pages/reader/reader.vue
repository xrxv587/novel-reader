<template>
  <view 
    class="reader-page" 
    :style="containerStyle"
    @click="handlePageClick"
  >
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <view class="chapter-header" v-if="showChapterTitle">
      <text class="chapter-title" :style="{ color: settings.textColor }">{{ currentChapterTitle }}</text>
    </view>
    
    <scroll-view 
      v-if="settings.flipMode === 'scroll'"
      class="content-scroll"
      scroll-y
      :scroll-top="scrollTop"
      @scroll="onScroll"
      @scrolltolower="onScrollToLower"
    >
      <view class="content-wrapper" :style="contentStyle">
        <view 
          v-for="(para, idx) in visibleParagraphs" 
          :key="idx" 
          class="paragraph"
          :style="paragraphStyle"
        >
          {{ para }}
        </view>
        
        <view class="chapter-end" v-if="paragraphs.length > 0 && !hasMore">
          <text :style="{ color: settings.textColor }">-- 本章完 --</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- TODO: 实现覆盖翻页模式的翻页动画效果 -->
    <view 
      v-else
      class="content-page"
      :style="contentStyle"
    >
      <view 
        v-for="(para, idx) in visibleParagraphs" 
        :key="idx" 
        class="paragraph"
        :style="paragraphStyle"
      >
        {{ para }}
      </view>
    </view>
    
    <view class="top-bar" v-if="menuVisible" :style="{ top: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <text class="back-btn" @click.stop="goBack">←</text>
        <text class="nav-title" :style="{ color: settings.textColor }">{{ bookTitle }}</text>
        <!-- TODO: 添加书签按钮，点击记录当前位置到书签表 -->
        <text class="menu-btn" @click.stop="showBookmarks">🔖</text>
      </view>
    </view>
    
    <view class="bottom-bar" v-if="menuVisible">
      <view class="progress-section">
        <text class="progress-text" :style="{ color: settings.textColor }">
          {{ currentChapterIndex + 1 }} / {{ totalChapters }}
        </text>
        <slider 
          :value="progressPercent" 
          :min="0" 
          :max="100" 
          activeColor="#667eea"
          backgroundColor="#ddd"
          @change="onProgressChange"
          block-size="20"
        />
      </view>
      
      <view class="menu-buttons">
        <view class="menu-btn-item" @click.stop="prevChapter">
          <text class="btn-icon">⏮</text>
          <text class="btn-text" :style="{ color: settings.textColor }">上一章</text>
        </view>
        <view class="menu-btn-item" @click.stop="showCatalog">
          <text class="btn-icon">📑</text>
          <text class="btn-text" :style="{ color: settings.textColor }">目录</text>
        </view>
        <view class="menu-btn-item" @click.stop="toggleSettings">
          <text class="btn-icon">⚙️</text>
          <text class="btn-text" :style="{ color: settings.textColor }">设置</text>
        </view>
        <view class="menu-btn-item" @click.stop="nextChapter">
          <text class="btn-icon">⏭</text>
          <text class="btn-text" :style="{ color: settings.textColor }">下一章</text>
        </view>
      </view>
    </view>
    
    <view class="settings-panel" v-if="settingsVisible" :style="{ backgroundColor: settings.backgroundColor }">
      <view class="settings-section">
        <text class="section-title" :style="{ color: settings.textColor }">字号</text>
        <view class="font-size-control">
          <text class="size-btn" @click="decreaseFontSize" :style="{ color: settings.textColor }">A-</text>
          <text class="size-value" :style="{ color: settings.textColor }">{{ settings.fontSize }}px</text>
          <text class="size-btn" @click="increaseFontSize" :style="{ color: settings.textColor }">A+</text>
        </view>
      </view>
      
      <view class="settings-section">
        <text class="section-title" :style="{ color: settings.textColor }">主题</text>
        <view class="theme-list">
          <view 
            v-for="(theme, key) in themeList" 
            :key="key"
            class="theme-item"
            :style="{ backgroundColor: theme.bg }"
            @click="setTheme(key)"
          >
            <text class="theme-check" v-if="settings.theme === key">✓</text>
          </view>
        </view>
      </view>
      
      <view class="settings-section">
        <text class="section-title" :style="{ color: settings.textColor }">翻页方式</text>
        <view class="flip-mode-list">
          <view 
            class="flip-mode-item"
            :class="{ active: settings.flipMode === 'scroll' }"
            @click="setFlipMode('scroll')"
          >
            <text :style="{ color: settings.flipMode === 'scroll' ? '#667eea' : settings.textColor }">滚动</text>
          </view>
          <view 
            class="flip-mode-item"
            :class="{ active: settings.flipMode === 'cover' }"
            @click="setFlipMode('cover')"
          >
            <text :style="{ color: settings.flipMode === 'cover' ? '#667eea' : settings.textColor }">覆盖</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="loading-tip" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { useSettingsStore } from '@/store/settings';
import { useReaderStore } from '@/store/reader';
import { useBookshelfStore } from '@/store/bookshelf';
import chapterDB from '@/utils/chapter-db';
import importService from '@/utils/import-service';

const settingsStore = useSettingsStore();
const readerStore = useReaderStore();
const bookshelfStore = useBookshelfStore();

const settings = computed(() => settingsStore.settings);
const themeList = computed(() => settingsStore.THEME_PRESETS);

const bookId = ref(0);
const bookTitle = ref('');
const bookFilePath = ref('');
const bookEncoding = ref('utf-8');
const paragraphs = ref<string[]>([]);
const currentChapterIndex = ref(0);
const totalChapters = ref(0);
const currentChapterTitle = ref('');
const scrollTop = ref(0);
const settingsVisible = ref(false);
const loading = ref(false);
const showChapterTitle = ref(true);
const statusBarHeight = ref(0);

const displayCount = ref(0);
const loadingMore = ref(false);
const batchSize = ref(40);

let saveProgressTimer: any = null;

const containerStyle = computed(() => ({
  backgroundColor: settings.value.backgroundColor,
  '--font-size': settings.value.fontSize + 'px',
  '--line-height': settings.value.lineHeight,
  '--text-indent': settings.value.textIndent,
  '--para-gap': settings.value.paragraphGap,
  '--text-color': settings.value.textColor,
  '--padding-x': settings.value.paddingX + 'px'
}));

const contentStyle = computed(() => ({
  padding: `20px ${settings.value.paddingX}px 100px`,
  minHeight: '100%'
}));

const paragraphStyle = computed(() => ({
  fontSize: settings.value.fontSize + 'px',
  lineHeight: settings.value.lineHeight,
  textIndent: settings.value.textIndent,
  marginBottom: settings.value.paragraphGap,
  color: settings.value.textColor
}));

const progressPercent = computed(() => {
  if (totalChapters.value === 0) return 0;
  return Math.round((currentChapterIndex.value / (totalChapters.value - 1 || 1)) * 100);
});

const menuVisible = computed(() => readerStore.isMenuVisible);

const visibleParagraphs = computed(() => {
  return paragraphs.value.slice(0, displayCount.value);
});

const hasMore = computed(() => {
  return displayCount.value < paragraphs.value.length;
});

onLoad((options: any) => {
  bookId.value = parseInt(options.bookId) || 0;
  initReader();
});

onUnload(() => {
  saveReadProgress();
});

const initReader = async () => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;
  
  settingsStore.loadSettings();
  
  const book = await bookshelfStore.getBookById(bookId.value);
  if (!book) {
    uni.showToast({ title: '书籍不存在', icon: 'none' });
    setTimeout(() => uni.navigateBack(), 1500);
    return;
  }
  
  bookTitle.value = book.title;
  bookFilePath.value = book.file_path;
  bookEncoding.value = book.encoding;
  currentChapterIndex.value = book.last_read_chapter;
  
  readerStore.setBook(bookId.value);
  readerStore.setChapter(currentChapterIndex.value);
  
  await loadChapters();
  await loadChapter(currentChapterIndex.value);
};

const loadChapters = async () => {
  const chapters = await chapterDB.getChapters(bookId.value);
  totalChapters.value = chapters.length;
  readerStore.setChapters(chapters as any);
};

const loadChapter = async (index: number) => {
  if (index < 0 || index >= totalChapters.value) {
    if (index < 0) {
      uni.showToast({ title: '已经是第一章了', icon: 'none' });
    } else {
      uni.showToast({ title: '已经是最后一章了', icon: 'none' });
    }
    return;
  }
  
  loading.value = true;
  
  try {
    const chapter = await chapterDB.getChapter(bookId.value, index);
    if (chapter) {
      currentChapterTitle.value = chapter.title;
    }
    
    const paras = await importService.getChapterContent(
      bookId.value,
      index,
      bookFilePath.value,
      bookEncoding.value
    );
    
    paragraphs.value = paras;
    currentChapterIndex.value = index;
    readerStore.setChapter(index);
    
    scrollTop.value = 0;
    displayCount.value = Math.min(batchSize.value * 4, paras.length);
    
    scheduleSaveProgress();
  } catch (e) {
    console.error('Load chapter error:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const handlePageClick = (e: any) => {
  if (settingsVisible.value) {
    settingsVisible.value = false;
    return;
  }
  
  const screenWidth = uni.getSystemInfoSync().windowWidth;
  const clickX = e.detail?.x || e.touches?.[0]?.pageX || (screenWidth / 2);
  
  if (settings.value.flipMode === 'scroll') {
    if (clickX < screenWidth / 3) {
      prevChapter();
    } else if (clickX > screenWidth * 2 / 3) {
      nextChapter();
    } else {
      readerStore.toggleMenu();
    }
  } else {
    if (clickX < screenWidth / 3) {
      prevChapter();
    } else if (clickX > screenWidth * 2 / 3) {
      nextChapter();
    } else {
      readerStore.toggleMenu();
    }
  }
};

const prevChapter = () => {
  if (currentChapterIndex.value > 0) {
    loadChapter(currentChapterIndex.value - 1);
  } else {
    uni.showToast({ title: '已经是第一章了', icon: 'none' });
  }
};

const nextChapter = () => {
  if (currentChapterIndex.value < totalChapters.value - 1) {
    loadChapter(currentChapterIndex.value + 1);
  } else {
    uni.showToast({ title: '已经是最后一章了', icon: 'none' });
  }
};

const onScroll = (e: any) => {
  const scrollTopVal = e.detail.scrollTop;
};

const onScrollToLower = () => {
  if (hasMore.value && !loadingMore.value) {
    loadingMore.value = true;
    setTimeout(() => {
      displayCount.value = Math.min(displayCount.value + batchSize.value, paragraphs.value.length);
      loadingMore.value = false;
    }, 100);
  }
};

const goBack = () => {
  saveReadProgress();
  uni.navigateBack();
};

const showCatalog = () => {
  uni.navigateTo({
    url: `/pages/chapter-list/chapter-list?bookId=${bookId.value}`
  });
};

const showBookmarks = () => {
  uni.navigateTo({
    url: `/pages/bookmarks/bookmarks?bookId=${bookId.value}`
  });
};

const toggleSettings = () => {
  settingsVisible.value = !settingsVisible.value;
};

const increaseFontSize = () => {
  settingsStore.setFontSize(settings.value.fontSize + 2);
};

const decreaseFontSize = () => {
  settingsStore.setFontSize(settings.value.fontSize - 2);
};

const setTheme = (theme: string) => {
  settingsStore.setTheme(theme);
};

const setFlipMode = (mode: 'scroll' | 'cover') => {
  settingsStore.setFlipMode(mode);
};

const onProgressChange = (e: any) => {
  const percent = e.detail.value;
  const targetChapter = Math.floor((percent / 100) * (totalChapters.value - 1));
  if (targetChapter !== currentChapterIndex.value) {
    loadChapter(targetChapter);
  }
};

const scheduleSaveProgress = () => {
  if (saveProgressTimer) {
    clearTimeout(saveProgressTimer);
  }
  saveProgressTimer = setTimeout(() => {
    saveReadProgress();
  }, 2000);
};

const saveReadProgress = () => {
  if (bookId.value > 0) {
    // TODO: 实现阅读位置精确还原，存储字符偏移量而非固定为0
    bookshelfStore.updateBookProgress(bookId.value, currentChapterIndex.value, 0);
  }
};

// TODO: 实现预加载下一章功能，当前章读到80%时后台异步加载
</script>

<style lang="scss" scoped>
.reader-page {
  min-height: 100vh;
  position: relative;
  transition: background-color 0.3s;
}

.status-bar {
  width: 100%;
}

.chapter-header {
  padding: 20rpx 40rpx;
  text-align: center;
}

.chapter-title {
  font-size: 32rpx;
  font-weight: bold;
}

.content-scroll {
  height: calc(100vh - 100rpx);
}

.content-wrapper {
  min-height: 100%;
}

.content-page {
  padding: 20px;
  min-height: calc(100vh - 100rpx);
  box-sizing: border-box;
}

.paragraph {
  word-break: break-all;
  text-align: justify;
}

.chapter-end {
  text-align: center;
  padding: 40rpx 0;
  font-size: 28rpx;
  opacity: 0.6;
}

.top-bar {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: inherit;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  height: 88rpx;
  box-sizing: border-box;
}

.back-btn, .menu-btn {
  font-size: 40rpx;
  width: 60rpx;
  text-align: center;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  padding: 20rpx 30rpx 40rpx;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.progress-section {
  margin-bottom: 30rpx;
}

.progress-text {
  font-size: 26rpx;
  display: block;
  text-align: center;
  margin-bottom: 10rpx;
}

.menu-buttons {
  display: flex;
  justify-content: space-around;
}

.menu-btn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-icon {
  font-size: 44rpx;
  margin-bottom: 10rpx;
}

.btn-text {
  font-size: 24rpx;
}

.settings-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  padding: 30rpx;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.settings-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.font-size-control {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.size-btn {
  font-size: 32rpx;
  padding: 20rpx 40rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
}

.size-value {
  font-size: 30rpx;
}

.theme-list {
  display: flex;
  gap: 20rpx;
}

.theme-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-check {
  font-size: 32rpx;
  color: #667eea;
}

.flip-mode-list {
  display: flex;
  gap: 20rpx;
}

.flip-mode-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8rpx;
}

.flip-mode-item.active {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}

.loading-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 30rpx 50rpx;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
}
</style>
