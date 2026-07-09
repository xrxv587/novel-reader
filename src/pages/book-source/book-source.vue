<template>
  <view class="book-source-page">
    <view class="header">
      <text class="title">书源管理</text>
      <text class="add-btn" @click="addSource">+ 添加</text>
    </view>
    
    <view class="source-list">
      <view v-if="sources.length === 0" class="empty">
        <text class="empty-text">暂无书源</text>
        <text class="empty-desc">点击右上角添加书源</text>
      </view>
      
      <view 
        v-for="source in sources" 
        :key="source.id"
        class="source-item"
      >
        <view class="source-info">
          <text class="source-name">{{ source.name }}</text>
          <text class="source-url">{{ source.base_url }}</text>
        </view>
        <switch 
          :checked="source.enabled === 1" 
          @change="toggleSource(source, $event)"
          color="#667eea"
        />
      </view>
    </view>
    
    <view class="actions">
      <view class="action-btn" @click="importSource">
        <text>📥 导入书源</text>
      </view>
      <view class="action-btn" @click="exportSource">
        <text>📤 导出书源</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import db from '@/utils/db';

const sources = ref<any[]>([]);

onMounted(() => {
  loadSources();
});

onShow(() => {
  loadSources();
});

const loadSources = async () => {
  try {
    await db.initDB();
    const result: any[] = await db.executeSql(
      `SELECT * FROM book_sources ORDER BY created_at DESC`
    );
    sources.value = result || [];
  } catch (e) {
    console.error('Load sources error:', e);
  }
};

const addSource = () => {
  // TODO: 实现书源添加功能，弹出表单填写书源配置（name, baseUrl, selectors等）
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

const toggleSource = async (source: any, e: any) => {
  const enabled = e.detail.value ? 1 : 0;
  try {
    await db.executeSql(
      `UPDATE book_sources SET enabled = ? WHERE id = ?`,
      [enabled, source.id]
    );
    await loadSources();
  } catch (err) {
    console.error('Toggle source error:', err);
  }
};

const importSource = () => {
  // TODO: 实现书源导入功能，支持导入JSON格式的书源配置文件
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

const exportSource = () => {
  // TODO: 实现书源导出功能，将书源配置导出为JSON文件
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};
</script>

<style lang="scss" scoped>
.book-source-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 200rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background-color: #fff;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  font-size: 30rpx;
  color: #667eea;
}

.source-list {
  padding: 20rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
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

.source-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.source-info {
  flex: 1;
}

.source-name {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.source-url {
  font-size: 24rpx;
  color: #999;
}

.actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  gap: 20rpx;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  background-color: #f5f7fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
