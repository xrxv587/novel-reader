<template>
  <view class="bookshelf">
    <view class="header">
      <text class="title">书架</text>
    </view>
    <view v-if="books.length === 0" class="empty-state">
      <text class="empty-icon">📚</text>
      <text class="empty-text">书架空空如也</text>
      <text class="empty-desc">去"功能"页导入本地小说吧</text>
    </view>
    <view v-else class="book-list">
      <!-- TODO: 实现左滑删除书籍功能，删除时需确认并删除本地文件 -->
      <view 
        v-for="book in books" 
        :key="book.id" 
        class="book-card"
        @click="openBook(book)"
      >
        <view class="book-cover">
          <text class="cover-text">{{ book.title.charAt(0) }}</text>
        </view>
        <view class="book-info">
          <text class="book-title">{{ book.title }}</text>
          <text class="book-author">{{ book.author || '未知作者' }}</text>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: getProgress(book) + '%' }"></view>
          </view>
          <text class="progress-text">{{ getProgress(book).toFixed(1) }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useBookshelfStore } from '@/store/bookshelf';

const bookshelfStore = useBookshelfStore();
const books = ref<any[]>([]);

/** 加载书籍列表 */
const loadBooks = async () => {
  await bookshelfStore.loadBooks();
  books.value = bookshelfStore.books;
};

/** 计算阅读进度百分比 */
const getProgress = (book: any) => {
  if (book.total_chapters === 0) return 0;
  return (book.last_read_chapter / book.total_chapters) * 100;
};

const openBook = (book: any) => {
  uni.navigateTo({
    url: `/pages/reader/reader?bookId=${book.id}`
  });
};

onMounted(() => {
  loadBooks();
});

onShow(() => {
  loadBooks();
});
</script>

<style lang="scss" scoped>
.bookshelf {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 100rpx;
}

.header {
  padding: 60rpx 30rpx 30rpx;
  background-color: #fff;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
}

.book-list {
  padding: 20rpx;
}

.book-card {
  display: flex;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.book-cover {
  width: 120rpx;
  height: 160rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  flex-shrink: 0;
}

.cover-text {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.book-author {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.progress-bar {
  height: 6rpx;
  background-color: #eee;
  border-radius: 3rpx;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3rpx;
}

.progress-text {
  font-size: 24rpx;
  color: #999;
}
</style>
