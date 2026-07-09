<template>
  <view class="bookmarks-page">
    <view v-if="bookmarks.length === 0" class="empty">
      <text class="empty-icon">🔖</text>
      <text class="empty-text">暂无书签</text>
      <text class="empty-desc">阅读时点击顶部书签按钮添加</text>
    </view>
    <view v-else class="bookmark-list">
      <view 
        v-for="bookmark in bookmarks" 
        :key="bookmark.id"
        class="bookmark-item"
        @click="goToBookmark(bookmark)"
      >
        <text class="bookmark-title">{{ bookmark.title }}</text>
        <view class="bookmark-info">
          <text class="chapter-text">第 {{ bookmark.chapter_index + 1 }} 章</text>
          <text class="date-text">{{ formatDate(bookmark.created_at) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import db from '@/utils/db';

const bookId = ref(0);
const bookmarks = ref<any[]>([]);

onLoad((options: any) => {
  bookId.value = parseInt(options.bookId) || 0;
});

onShow(() => {
  loadBookmarks();
});

const loadBookmarks = async () => {
  try {
    await db.initDB();
    let sql = `SELECT * FROM bookmarks ORDER BY created_at DESC`;
    let params: any[] = [];
    
    if (bookId.value > 0) {
      sql = `SELECT * FROM bookmarks WHERE book_id = ? ORDER BY created_at DESC`;
      params = [bookId.value];
    }
    
    const result: any[] = await db.executeSql(sql, params);
    bookmarks.value = result || [];
  } catch (e) {
    console.error('Load bookmarks error:', e);
  }
};

const goToBookmark = (bookmark: any) => {
  uni.redirectTo({
    url: `/pages/reader/reader?bookId=${bookmark.book_id}&chapter=${bookmark.chapter_index}`
  });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};
</script>

<style lang="scss" scoped>
.bookmarks-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
}

.bookmark-list {
  padding: 20rpx;
}

.bookmark-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.bookmark-title {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.bookmark-info {
  display: flex;
  justify-content: space-between;
}

.chapter-text {
  font-size: 26rpx;
  color: #667eea;
}

.date-text {
  font-size: 24rpx;
  color: #999;
}
</style>
