/**
 * 阅读设置状态管理
 * 管理字体、行距、主题等排版设置
 * 使用 uni.setStorage 持久化存储
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  paragraphGap: string;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  paddingX: number;
  textIndent: string;
  theme: string;
  flipMode: 'scroll' | 'cover';
  brightness: number;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.75,
  paragraphGap: '1em',
  fontFamily: 'system-ui',
  backgroundColor: '#f5f0e6',
  textColor: '#333333',
  paddingX: 20,
  textIndent: '2em',
  theme: 'rice',
  flipMode: 'scroll',
  brightness: 100
};

const THEME_PRESETS: Record<string, { bg: string; text: string }> = {
  white: { bg: '#ffffff', text: '#333333' },
  rice: { bg: '#f5f0e6', text: '#333333' },
  green: { bg: '#cce8cf', text: '#2b402d' },
  night: { bg: '#1a1a1a', text: '#999999' },
  parchment: { bg: '#f0e6d3', text: '#5c4b37' }
};

const STORAGE_KEY = 'reader_settings';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<ReaderSettings>({ ...DEFAULT_SETTINGS });

  const loadSettings = () => {
    try {
      const saved = uni.getStorageSync(STORAGE_KEY);
      if (saved) {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Load settings error:', e);
    }
  };

  const saveSettings = () => {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(settings.value));
    } catch (e) {
      console.error('Save settings error:', e);
    }
  };

  const setFontSize = (size: number) => {
    settings.value.fontSize = Math.max(12, Math.min(28, size));
    saveSettings();
  };

  const setLineHeight = (height: number) => {
    settings.value.lineHeight = Math.max(1.2, Math.min(2.5, height));
    saveSettings();
  };

  const setTheme = (theme: string) => {
    const preset = THEME_PRESETS[theme];
    if (preset) {
      settings.value.theme = theme;
      settings.value.backgroundColor = preset.bg;
      settings.value.textColor = preset.text;
      saveSettings();
    }
  };

  const setFlipMode = (mode: 'scroll' | 'cover') => {
    settings.value.flipMode = mode;
    saveSettings();
  };

  const setBrightness = (value: number) => {
    settings.value.brightness = Math.max(10, Math.min(100, value));
    saveSettings();
  };

  const resetSettings = () => {
    settings.value = { ...DEFAULT_SETTINGS };
    saveSettings();
  };

  return {
    settings,
    THEME_PRESETS,
    loadSettings,
    saveSettings,
    setFontSize,
    setLineHeight,
    setTheme,
    setFlipMode,
    setBrightness,
    resetSettings
  };
});
