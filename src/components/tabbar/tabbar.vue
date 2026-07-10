<template>
  <view class="tab-bar">
    <view 
      class="tab-item"
      :class="{ active: currentIndex === 0 }"
      @click="switchTab(0)"
    >
      <view class="tab-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
        </svg>
      </view>
      <text class="tab-label">书架</text>
    </view>
    <view 
      class="tab-item"
      :class="{ active: currentIndex === 1 }"
      @click="switchTab(1)"
    >
      <view class="tab-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </view>
      <text class="tab-label">功能</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  current?: number;
}>();

const currentIndex = ref(props.current ?? 0);

const switchTab = (index: number) => {
  if (currentIndex.value === index) return;
  currentIndex.value = index;
  const paths = ['/pages/bookshelf/bookshelf', '/pages/features/features'];
  uni.switchTab({
    url: paths[index]
  });
};

const updateCurrentIndex = () => {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    const route = '/' + (currentPage as any).route;
    if (route.includes('bookshelf')) {
      currentIndex.value = 0;
    } else if (route.includes('features')) {
      currentIndex.value = 1;
    }
  }
};

onMounted(() => {
  updateCurrentIndex();
});
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background-color: #FFFFFF;
  border-top: 1px solid #EDEDED;
  display: flex;
  align-items: flex-start;
  padding-top: 6px;
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #999999;
  transition: color 0.2s ease;

  &.active {
    color: #2E7D5B;
  }
}

.tab-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-label {
  font-size: 10px;
  line-height: 1.2;
  font-weight: 400;
}
</style>