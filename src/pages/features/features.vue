<template>
  <view class="features">
    <view class="header">
      <text class="title">功能</text>
    </view>
    <view class="feature-list">
      <view class="feature-item" @click="goToImport">
        <view class="feature-icon import-icon">
          <text class="icon-text">📂</text>
        </view>
        <view class="feature-info">
          <text class="feature-title">导入本地书籍</text>
          <text class="feature-desc">从手机选择 txt 文件导入</text>
        </view>
        <text class="arrow">›</text>
      </view>
      
      <view class="feature-item" @click="goToBookSource">
        <view class="feature-icon source-icon">
          <text class="icon-text">🌐</text>
        </view>
        <view class="feature-info">
          <text class="feature-title">书源管理</text>
          <text class="feature-desc">添加和管理在线书源</text>
        </view>
        <text class="arrow">›</text>
      </view>
      
      <view class="feature-item" @click="goToSearch">
        <view class="feature-icon search-icon">
          <text class="icon-text">🔍</text>
        </view>
        <view class="feature-info">
          <text class="feature-title">在线搜索</text>
          <text class="feature-desc">搜索在线小说</text>
        </view>
        <text class="arrow">›</text>
      </view>
      
      <view class="feature-item" @click="goToBookmarks">
        <view class="feature-icon bookmark-icon">
          <text class="icon-text">🔖</text>
        </view>
        <view class="feature-info">
          <text class="feature-title">我的书签</text>
          <text class="feature-desc">查看所有书签</text>
        </view>
        <text class="arrow">›</text>
      </view>
      
      <view class="feature-item" @click="goToSettings">
        <view class="feature-icon settings-icon">
          <text class="icon-text">⚙️</text>
        </view>
        <view class="feature-info">
          <text class="feature-title">阅读设置</text>
          <text class="feature-desc">排版、主题等设置</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import importService from '@/utils/import-service';

const goToImport = async () => {
  uni.showLoading({ title: '导入中...' });
  const result = await importService.importLocalTxt();
  uni.hideLoading();
  
  if (result.success) {
    uni.showToast({
      title: `《${result.title}》导入成功`,
      icon: 'success'
    });
  } else {
    if (result.error?.includes('not supported') || result.error?.includes('File choose')) {
      uni.showToast({
        title: '请在 App 端使用此功能',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: result.error || '导入失败',
        icon: 'none'
      });
    }
  }
};

const goToBookSource = () => {
  uni.navigateTo({
    url: '/pages/book-source/book-source'
  });
};

const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/search/search'
  });
};

const goToBookmarks = () => {
  uni.navigateTo({
    url: '/pages/bookmarks/bookmarks'
  });
};

const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/settings/settings'
  });
};
</script>

<style lang="scss" scoped>
.features {
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

.feature-list {
  padding: 20rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.feature-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.import-icon {
  background-color: #e3f2fd;
}

.source-icon {
  background-color: #e8f5e9;
}

.search-icon {
  background-color: #fff3e0;
}

.bookmark-icon {
  background-color: #fce4ec;
}

.settings-icon {
  background-color: #f3e5f5;
}

.icon-text {
  font-size: 40rpx;
}

.feature-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.feature-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 26rpx;
  color: #999;
}

.arrow {
  font-size: 40rpx;
  color: #ccc;
}
</style>
