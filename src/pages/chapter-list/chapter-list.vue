<template>
  <view class="chapter-list-page">
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
    <view v-else class="chapter-list">
      <view 
        v-for="(chapter, index) in chapters" 
        :key="chapter.id"
        class="chapter-item"
        :class="{ active: index === currentChapter }"
        @click="goToChapter(index)"
      >
        <text class="chapter-title">{{ chapter.title }}</text>
        <text class="chapter-index">{{ index + 1 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import chapterDB from '@/utils/chapter-db';
import { useBookshelfStore } from '@/store/bookshelf';

const bookId = ref(0);
const chapters = ref<any[]>([]);
const currentChapter = ref(0);
const loading = ref(true);

const bookshelfStore = useBookshelfStore();

onLoad((options: any) => {
  bookId.value = parseInt(options.bookId) || 0;
  loadChapters();
  loadCurrentProgress();
});

const loadChapters = async () => {
  loading.value = true;
  try {
    const list = await chapterDB.getChapters(bookId.value);
    chapters.value = list;
  } catch (e) {
    console.error('Load chapters error:', e);
  } finally {
    loading.value = false;
  }
};

const loadCurrentProgress = async () => {
  const book = await bookshelfStore.getBookById(bookId.value);
  if (book) {
    currentChapter.value = book.last_read_chapter;
  }
};

const goToChapter = (index: number) => {
  const pages = getCurrentPages();
  const readerPage = pages.find(p => p.route === 'pages/reader/reader');
  
  if (readerPage) {
    uni.navigateBack();
    setTimeout(() => {
      uni.$emit('jumpToChapter', { bookId: bookId.value, chapterIndex: index });
    }, 100);
  } else {
    uni.redirectTo({
      url: `/pages/reader/reader?bookId=${bookId.value}&chapter=${index}`
    });
  }
};
</script>

<style lang="scss" scoped>
.chapter-list-page {
  min-height: 100vh;
  background-color: #fff;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 28rpx;
  color: #999;
}

.chapter-list {
  padding: 10rpx 0;
}

.chapter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.chapter-item.active {
  background-color: #f5f7fa;
}

.chapter-item.active .chapter-title {
  color: #667eea;
}

.chapter-title {
  font-size: 30rpx;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-index {
  font-size: 26rpx;
  color: #999;
  margin-left: 20rpx;
}
</style>
