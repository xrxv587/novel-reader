<template>
  <view class="search-page">
    <view class="search-header">
      <input 
        class="search-input" 
        placeholder="搜索小说" 
        v-model="keyword"
        confirm-type="search"
        @confirm="doSearch"
      />
      <text class="search-btn" @click="doSearch">搜索</text>
    </view>
    
    <view v-if="searching" class="searching">
      <text>正在搜索...</text>
    </view>
    
    <view v-else-if="results.length === 0 && hasSearched" class="empty">
      <text class="empty-text">没有找到相关结果</text>
    </view>
    
    <view v-else-if="results.length > 0" class="result-list">
      <view 
        v-for="(group, idx) in results" 
        :key="idx"
        class="result-group"
      >
        <text class="source-name">{{ group.sourceName }}</text>
        <view 
          v-for="(book, bidx) in group.books" 
          :key="bidx"
          class="book-item"
          @click="addToShelf(book)"
        >
          <text class="book-title">{{ book.title }}</text>
          <text class="book-author">{{ book.author || '未知' }}</text>
        </view>
      </view>
    </view>
    
    <view v-else class="tip">
      <text class="tip-text">输入书名开始搜索</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const keyword = ref('');
const searching = ref(false);
const hasSearched = ref(false);
const results = ref<any[]>([]);

const doSearch = async () => {
  if (!keyword.value.trim()) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' });
    return;
  }
  
  searching.value = true;
  hasSearched.value = true;
  
  try {
    // TODO: 实现多源并发搜索功能，集成cheerio解析HTML
    uni.showToast({
      title: '书源功能开发中',
      icon: 'none'
    });
    results.value = [];
  } catch (e) {
    console.error('Search error:', e);
  } finally {
    searching.value = false;
  }
};

const addToShelf = (book: any) => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  gap: 20rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  font-size: 28rpx;
}

.search-btn {
  font-size: 30rpx;
  color: #667eea;
  padding: 0 10rpx;
}

.searching, .empty, .tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  font-size: 28rpx;
  color: #999;
}

.result-list {
  padding: 20rpx;
}

.result-group {
  margin-bottom: 30rpx;
}

.source-name {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 16rpx;
  display: block;
}

.book-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
}

.book-title {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.book-author {
  font-size: 24rpx;
  color: #999;
}
</style>
