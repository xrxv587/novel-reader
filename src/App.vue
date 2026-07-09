<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import db from "@/utils/db";
import { useSettingsStore } from "@/store/settings";

onLaunch(() => {
  console.log("App Launch");
  initApp();
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});

const initApp = async () => {
  try {
    await db.initDB();
    console.log("Database initialized");
    
    const settingsStore = useSettingsStore();
    settingsStore.loadSettings();
  } catch (e) {
    console.error("App init error:", e);
  }
};
</script>

<style>
page {
  height: 100%;
  background-color: #f5f5f5;
}
</style>
