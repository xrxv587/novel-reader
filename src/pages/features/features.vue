<template>
  <view class="features">
    <view class="nav-bar">
      <text class="nav-title">功能</text>
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

    <tabbar :current="1" />
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

.feature-list {
  padding: 48rpx 32rpx 0 32rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.feature-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 32rpx;
}

.import-icon {
  background-color: #E3F2FD;
}

.source-icon {
  background-color: #E8F5EE;
}

.search-icon {
  background-color: #FFF3E0;
}

.bookmark-icon {
  background-color: #FCE4EC;
}

.settings-icon {
  background-color: #F3E5F5;
}

.icon-text {
  font-size: 44rpx;
}

.feature-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.feature-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #2D2D2D;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 26rpx;
  color: #999999;
}

.arrow {
  font-size: 44rpx;
  color: #B2B2B2;
}
</style>
