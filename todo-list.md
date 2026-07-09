# 小说阅读器开发进度

## 一、基础框架搭建 ✅ 已完成

### 1.1 项目初始化
- ✅ 创建 uni-app 项目（Vue 3 + Vite）
- ✅ 配置 tabBar：书架 / 功能 两个底部标签
- ✅ 集成 Pinia 状态管理
- ✅ 集成 SQLite 插件，封装数据库操作工具类

### 1.2 页面结构
- ✅ 书架页 (bookshelf.vue)
- ✅ 阅读页 (reader.vue)
- ✅ 功能页 (features.vue)
- ✅ 搜索页 (search.vue)
- ✅ 书签页 (bookmarks.vue)
- ✅ 章节列表页 (chapter-list.vue)
- ✅ 书源管理页 (book-source.vue)
- ✅ 设置页 (settings.vue)

---

## 二、本地阅读核心 ✅ 基本完成

### 2.1 文件导入模块
- ✅ txt 文件导入（选择文件 → 复制到私有目录 → 写入数据库）
- ✅ 文件选择（plus.io.chooseFile）
- ✅ 编码检测（jschardet）
- ✅ GBK/UTF-8 转码（iconv-lite）
- ✅ 大文件分块读取
- ❌ 文件名编辑（导入时可修改书名）

### 2.2 章节解析
- ✅ 正则匹配章节（第X章/节/回/卷/部）
- ✅ fallback 固定字数分章（5000字）
- ✅ 章节信息存储到数据库

### 2.3 阅读引擎
- ✅ 按需加载章节内容
- ✅ 文本分段渲染
- ✅ 上下章切换
- ✅ 阅读进度自动保存（章节级别）
- ❌ 阅读位置精确还原（字符偏移量定位）
- ❌ 预加载下一章（读到80%时后台加载）

### 2.4 翻页方式
- ✅ 滚动模式
- ❌ 覆盖翻页模式（UI已预留，无翻页动画）
- ❌ 仿真翻页模式

---

## 三、排版美化 ✅ 基本完成

### 3.1 可配置项
- ✅ 字体大小（12px ~ 28px）
- ✅ 行间距（1.2 ~ 2.5）
- ✅ 主题背景色（5种：白/米白/护眼绿/夜间黑/羊皮纸）
- ✅ 文字颜色（跟随主题自动适配）
- ❌ 字体选择（宋体/楷体/黑体/等宽）
- ❌ 段间距配置
- ❌ 首行缩进配置
- ❌ 左右边距配置

### 3.2 设置存储
- ✅ 用户排版偏好存入本地 storage
- ✅ 设置页完整 UI

---

## 四、书签模块 ✅ 部分完成

### 4.1 书签功能
- ✅ 书签列表展示
- ✅ 书签跳转
- ❌ 添加书签（阅读时点击按钮添加）
- ❌ 删除书签

### 4.2 阅读进度
- ✅ 退出阅读页时自动保存进度
- ❌ 阅读位置精确到段落

---

## 五、章节列表页 ✅ 已完成

- ✅ 章节目录展示
- ✅ 当前章节高亮
- ✅ 点击跳转到指定章节

---

## 六、在线书源模块 ❌ 未实现

### 6.1 书源配置
- ❌ 书源配置数据结构设计
- ❌ 书源添加/编辑功能
- ❌ 书源导入导出（JSON格式）
- ❌ 预置书源（首次启动写入数据库）

### 6.2 HTML解析
- ❌ 集成 cheerio@0.22.0
- ❌ 搜索函数（并发请求所有书源）
- ❌ 目录抓取函数
- ❌ 正文抓取函数

### 6.3 搜索页
- ❌ 多源并发搜索
- ❌ 按书源分组展示结果
- ❌ 搜索结果点击加入书架

### 6.4 书源验证
- ❌ 三步验证：搜索→目录→正文

---

## 七、体验优化 ❌ 部分完成

### 7.1 阅读页手势
- ✅ 点击左侧 → 上一章
- ✅ 点击右侧 → 下一章
- ✅ 点击中间 → 呼出菜单
- ❌ 上下滑动 → 调整亮度

### 7.2 书架管理
- ❌ 左滑删除书籍
- ❌ 删除时确认弹窗
- ❌ 删除本地文件

### 7.3 性能优化
- ❌ 启动速度优化
- ❌ 翻页流畅度优化

---

## 八、数据库设计 ✅ 已完成

- ✅ 书籍表 (books)
- ✅ 章节表 (chapters)
- ✅ 书签表 (bookmarks)
- ✅ 书源表 (book_sources)
- ✅ 设置表 (settings)

---

## 九、MVP 功能优先级对照

| 优先级 | 功能 | 状态 |
|--------|------|------|
| P0 必须有 | 本地 txt 导入 | ✅ 完成 |
| P0 必须有 | 章节自动识别 | ✅ 完成 |
| P0 必须有 | 阅读（滚动模式） | ✅ 完成 |
| P0 必须有 | 阅读进度自动保存 | ✅ 完成 |
| P0 必须有 | 基础排版设置 | ✅ 完成 |
| P1 很重要 | 书签功能 | ⚠️ 部分完成 |
| P1 很重要 | 章节目录 | ✅ 完成 |
| P1 很重要 | 覆盖翻页模式 | ❌ 未完成 |
| P1 很重要 | 书架管理 | ❌ 未完成 |
| P2 可以加 | 在线书源搜索 | ❌ 未完成 |
| P2 可以加 | 书源管理 | ❌ 未完成 |
| P3 锦上添花 | 仿真翻页 | ❌ 未完成 |
| P3 锦上添花 | 阅读时长统计 | ❌ 未完成 |
| P3 锦上添花 | 云同步 | ❌ 未完成 |

---

## 十、待开发任务清单

### 高优先级（P1）

1. **覆盖翻页模式实现**
   - 文件：[reader.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/reader/reader.vue)
   - 描述：实现覆盖翻页动画效果

2. **书签添加功能**
   - 文件：[reader.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/reader/reader.vue)
   - 描述：阅读页添加书签按钮，点击记录当前位置

3. **书签删除功能**
   - 文件：[bookmarks.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/bookmarks/bookmarks.vue)
   - 描述：书签列表支持删除操作

4. **书架左滑删除**
   - 文件：[bookshelf.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/bookshelf/bookshelf.vue)
   - 描述：书籍卡片左滑显示删除按钮，删除书籍记录和本地文件

5. **阅读位置精确还原**
   - 文件：[reader.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/reader/reader.vue)
   - 描述：使用字符偏移量存储位置，排版变化时也能准确定位

### 中优先级（P2）

6. **在线搜索功能**
   - 文件：[search.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/search/search.vue)
   - 描述：集成cheerio，实现多源并发搜索

7. **书源管理完整功能**
   - 文件：[book-source.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/book-source/book-source.vue)
   - 描述：添加/编辑/导入导出书源配置

8. **书源抓取工具模块**
   - 文件：新建 [book-source.ts](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/utils/book-source.ts)
   - 描述：封装搜索、目录抓取、正文抓取函数

9. **预加载下一章**
   - 文件：[reader.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/reader/reader.vue)
   - 描述：当前章读到80%时，后台异步加载下一章

### 低优先级（P3）

10. **仿真翻页模式**
    - 文件：[reader.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/reader/reader.vue)
    - 描述：CSS 3D transform实现仿真翻页效果

11. **亮度调节**
    - 文件：[reader.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/reader/reader.vue)
    - 描述：上下滑动调整屏幕亮度

12. **字体选择**
    - 文件：[settings.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/settings/settings.vue)
    - 描述：支持宋体/楷体/黑体/等宽字体切换

13. **段间距和缩进配置**
    - 文件：[settings.vue](file:///e:/work/novel-reader-trae-agent-fTv9bn/src/pages/settings/settings.vue)
    - 描述：增加段间距和首行缩进配置项
