<template>
  <view class="bookshelf">
    <view class="nav-bar">
      <text class="nav-title">书架</text>
      <view class="nav-actions">
        <text class="nav-btn-text" @click="toggleManage">管理</text>
        <view class="nav-btn-icon" @click="goToImport">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <view v-if="books.length === 0" class="empty-state">
      <text class="empty-icon">📚</text>
      <text class="empty-text">书架空空如也</text>
      <text class="empty-desc">去添加几本书吧</text>
      <view class="empty-btn" @click="goToImport">导入书籍</view>
    </view>

    <view v-else class="book-grid-wrapper">
      <view class="book-grid">
        <view 
          v-for="(book, index) in books" 
          :key="book.id" 
          class="book-card"
          :class="getCoverClass(index)"
          @click="openBook(book)"
        >
          <view class="book-cover">
            <view class="book-cover-inner">
              <text class="book-cover-title">{{ book.title }}</text>
            </view>
          </view>
          <view class="book-info">
            <text class="book-title">{{ book.title }}</text>
            <text class="book-progress">已读 {{ getProgress(book).toFixed(0) }}%</text>
          </view>
        </view>

        <view class="add-card" @click="goToImport">
          <view class="add-card-box">
            <text class="add-icon">+</text>
            <text class="add-label">导入书籍</text>
          </view>
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

const loadBooks = async () => {
  await bookshelfStore.loadBooks();
  books.value = bookshelfStore.books;
};

const getProgress = (book: any) => {
  if (book.total_chapters === 0) return 0;
  return (book.last_read_chapter / book.total_chapters) * 100;
};

const getCoverClass = (index: number) => {
  const classes = ['cover-dusty-blue', 'cover-muted-red', 'cover-sage-green', 'cover-warm-beige', 'cover-deep-teal'];
  return classes[index % classes.length];
};

const openBook = (book: any) => {
  uni.navigateTo({
    url: `/pages/reader/reader?bookId=${book.id}`
  });
};

const toggleManage = () => {
  uni.showToast({
    title: '管理功能开发中',
    icon: 'none'
  });
};

const goToImport = () => {
  uni.switchTab({
    url: '/pages/features/features'
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
  background-color: #F5F5F5;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  background-color: #F5F5F5;
  padding-top: env(safe-area-inset-top);
}

.nav-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #2D2D2D;
  line-height: 1;
  letter-spacing: -0.01em;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.nav-btn-text {
  font-size: 28rpx;
  font-weight: 400;
  color: #2D2D2D;
}

.nav-btn-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn-icon .add-icon {
  font-size: 40rpx;
  color: #2D2D2D;
  font-weight: 300;
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
  color: #666666;
  margin-bottom: 10rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 40rpx;
}

.empty-btn {
  width: 200rpx;
  height: 72rpx;
  background-color: #2E7D5B;
  color: #fff;
  font-size: 28rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-grid-wrapper {
  padding: 48rpx 32rpx 0 32rpx;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40rpx 24rpx;
}

.book-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.book-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
}

.book-cover-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16rpx;
  position: relative;
}

.book-cover-inner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
  pointer-events: none;
}

.book-cover-title {
  position: relative;
  z-index: 1;
  font-size: 20rpx;
  font-weight: 600;
  color: rgba(255,255,255,0.92);
  line-height: 1.3;
  letter-spacing: 0.02em;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-info {
  padding-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.book-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #2D2D2D;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-progress {
  font-size: 24rpx;
  color: #999999;
  line-height: 1.4;
}

.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-card-box {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 16rpx;
  border: 3rpx dashed #B2B2B2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background-color: transparent;
}

.add-card-box .add-icon {
  font-size: 48rpx;
  color: #B2B2B2;
  font-weight: 300;
}

.add-card-box .add-label {
  font-size: 24rpx;
  color: #B2B2B2;
  line-height: 1;
}

.cover-dusty-blue {
  background: linear-gradient(160deg, #8BA4B8 0%, #5C7A94 100%);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.cover-muted-red {
  background: linear-gradient(160deg, #C4918A 0%, #A06B63 100%);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.cover-sage-green {
  background: linear-gradient(160deg, #94A892 0%, #6E846B 100%);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.cover-warm-beige {
  background: linear-gradient(160deg, #C9B99A 0%, #A89670 100%);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.cover-deep-teal {
  background: linear-gradient(160deg, #6B9E9E 0%, #4A7A7A 100%);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}
</style>
