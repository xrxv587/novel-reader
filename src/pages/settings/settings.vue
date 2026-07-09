<template>
  <view class="settings-page">
    <view class="setting-group">
      <text class="group-title">阅读设置</text>
      
      <view class="setting-item">
        <text class="item-label">字号大小</text>
        <view class="item-control">
          <text class="control-btn" @click="decreaseFontSize">-</text>
          <text class="control-value">{{ settings.fontSize }}px</text>
          <text class="control-btn" @click="increaseFontSize">+</text>
        </view>
      </view>
      
      <view class="setting-item">
        <text class="item-label">行间距</text>
        <slider 
          :value="settings.lineHeight * 20" 
          :min="24" 
          :max="50" 
          @change="onLineHeightChange"
          activeColor="#667eea"
          backgroundColor="#ddd"
          block-size="20"
        />
      </view>
      
      <view class="setting-item">
        <text class="item-label">主题</text>
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
      
      <view class="setting-item">
        <text class="item-label">翻页方式</text>
        <view class="flip-modes">
          <text 
            class="flip-option" 
            :class="{ active: settings.flipMode === 'scroll' }"
            @click="setFlipMode('scroll')"
          >滚动模式</text>
          <text 
            class="flip-option" 
            :class="{ active: settings.flipMode === 'cover' }"
            @click="setFlipMode('cover')"
          >覆盖翻页</text>
        </view>
      </view>
    </view>
    
    <view class="setting-group">
      <text class="group-title">其他</text>
      <view class="setting-item" @click="resetSettings">
        <text class="item-label">恢复默认设置</text>
        <text class="item-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSettingsStore } from '@/store/settings';

const settingsStore = useSettingsStore();
const settings = computed(() => settingsStore.settings);
const themeList = computed(() => settingsStore.THEME_PRESETS);

onMounted(() => {
  settingsStore.loadSettings();
});

const increaseFontSize = () => {
  settingsStore.setFontSize(settings.value.fontSize + 2);
};

const decreaseFontSize = () => {
  settingsStore.setFontSize(settings.value.fontSize - 2);
};

const onLineHeightChange = (e: any) => {
  const val = e.detail.value / 20;
  settingsStore.setLineHeight(val);
};

const setTheme = (theme: string) => {
  settingsStore.setTheme(theme);
};

const setFlipMode = (mode: 'scroll' | 'cover') => {
  settingsStore.setFlipMode(mode);
};

const resetSettings = () => {
  uni.showModal({
    title: '提示',
    content: '确定要恢复默认设置吗？',
    success: (res) => {
      if (res.confirm) {
        settingsStore.resetSettings();
        uni.showToast({ title: '已恢复默认', icon: 'success' });
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.setting-group {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.group-title {
  font-size: 28rpx;
  color: #999;
  padding: 20rpx 30rpx 10rpx;
  display: block;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 30rpx;
  color: #333;
}

.item-control {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.control-btn {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 36rpx;
  color: #666;
}

.control-value {
  font-size: 28rpx;
  color: #666;
  min-width: 80rpx;
  text-align: center;
}

.theme-list {
  display: flex;
  gap: 20rpx;
}

.theme-item {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-check {
  font-size: 28rpx;
  color: #667eea;
}

.flip-modes {
  display: flex;
  gap: 20rpx;
}

.flip-option {
  padding: 12rpx 30rpx;
  font-size: 28rpx;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8rpx;
}

.flip-option.active {
  color: #667eea;
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}

.item-arrow {
  font-size: 40rpx;
  color: #ccc;
}
</style>
