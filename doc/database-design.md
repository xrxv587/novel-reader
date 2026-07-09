# 数据库设计文档

## 概述

本项目使用 SQLite 作为本地数据库，数据库文件名为 `novel_reader.db`，存储在应用私有目录 `_doc/` 下。

数据库共包含 **5 张核心表**：

| 序号 | 表名 | 中文名 | 主要用途 |
|------|------|--------|----------|
| 1 | books | 书籍表 | 存储书籍基本信息 |
| 2 | chapters | 章节表 | 存储章节信息及内容 |
| 3 | bookmarks | 书签表 | 存储用户书签 |
| 4 | book_sources | 书源表 | 存储在线书源配置 |
| 5 | settings | 设置表 | 存储用户设置（键值对） |

---

## 表结构详解

### 1. books（书籍表）

存储所有书籍的元数据信息，包括本地导入和在线添加的书籍。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 书籍ID，自增主键 |
| title | TEXT | NOT NULL | 书名 |
| author | TEXT | DEFAULT '' | 作者 |
| source_type | TEXT | NOT NULL | 来源类型（local/online） |
| file_path | TEXT | DEFAULT '' | 本地文件路径（本地书籍） |
| source_url | TEXT | DEFAULT '' | 来源URL（在线书籍） |
| source_id | INTEGER | DEFAULT 0 | 关联书源ID |
| total_chapters | INTEGER | DEFAULT 0 | 总章节数 |
| total_size | INTEGER | DEFAULT 0 | 文件总大小（字节） |
| last_read_chapter | INTEGER | DEFAULT 0 | 最后阅读的章节索引 |
| last_read_position | INTEGER | DEFAULT 0 | 最后阅读位置（字符偏移量） |
| cover_image | TEXT | DEFAULT '' | 封面图片路径 |
| encoding | TEXT | DEFAULT 'utf-8' | 文件编码格式 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**建表 SQL：**

```sql
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT DEFAULT '',
  source_type TEXT NOT NULL,
  file_path TEXT DEFAULT '',
  source_url TEXT DEFAULT '',
  source_id INTEGER DEFAULT 0,
  total_chapters INTEGER DEFAULT 0,
  total_size INTEGER DEFAULT 0,
  last_read_chapter INTEGER DEFAULT 0,
  last_read_position INTEGER DEFAULT 0,
  cover_image TEXT DEFAULT '',
  encoding TEXT DEFAULT 'utf-8',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

### 2. chapters（章节表）

存储每本书的所有章节信息，包括章节标题、内容偏移量和章节正文。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 章节ID，自增主键 |
| book_id | INTEGER | NOT NULL | 所属书籍ID（外键关联 books.id） |
| chapter_index | INTEGER | NOT NULL | 章节序号（从0开始） |
| title | TEXT | NOT NULL | 章节标题 |
| start_offset | INTEGER | NOT NULL DEFAULT 0 | 章节在文件中的起始偏移量 |
| end_offset | INTEGER | NOT NULL DEFAULT 0 | 章节在文件中的结束偏移量 |
| content_url | TEXT | DEFAULT '' | 在线章节内容URL |
| content | TEXT | DEFAULT '' | 章节内容（本地缓存） |
| word_count | INTEGER | DEFAULT 0 | 章节字数 |

**约束：**
- 唯一约束：`UNIQUE(book_id, chapter_index)` — 同一本书的章节序号唯一

**建表 SQL：**

```sql
CREATE TABLE IF NOT EXISTS chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  chapter_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_offset INTEGER NOT NULL DEFAULT 0,
  end_offset INTEGER NOT NULL DEFAULT 0,
  content_url TEXT DEFAULT '',
  content TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  UNIQUE(book_id, chapter_index)
)
```

---

### 3. bookmarks（书签表）

存储用户添加的书签，支持按位置精确跳转。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 书签ID，自增主键 |
| book_id | INTEGER | NOT NULL | 所属书籍ID |
| chapter_index | INTEGER | NOT NULL | 章节序号 |
| position | INTEGER | NOT NULL | 阅读位置（字符偏移量） |
| title | TEXT | DEFAULT '' | 书签标题/备注 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**建表 SQL：**

```sql
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  chapter_index INTEGER NOT NULL,
  position INTEGER NOT NULL,
  title TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

### 4. book_sources（书源表）

存储在线书源的配置信息，包括基础 URL 和内容选择器。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 书源ID，自增主键 |
| name | TEXT | NOT NULL | 书源名称 |
| base_url | TEXT | NOT NULL | 书源基础URL |
| enabled | INTEGER | DEFAULT 1 | 是否启用（1启用/0禁用） |
| selectors | TEXT | NOT NULL | 选择器配置（JSON格式字符串） |
| charset | TEXT | DEFAULT 'UTF-8' | 网页字符编码 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**selectors 字段说明：**

该字段存储 JSON 格式的选择器配置，包含以下属性：
- `search` - 搜索结果页选择器
- `chapter_list` - 章节列表选择器
- `content` - 正文内容选择器

**建表 SQL：**

```sql
CREATE TABLE IF NOT EXISTS book_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  selectors TEXT NOT NULL,
  charset TEXT DEFAULT 'UTF-8',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

### 5. settings（设置表）

键值对结构的设置表，用于存储用户的各类偏好设置。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| key | TEXT | PRIMARY KEY | 设置项键名 |
| value | TEXT | - | 设置项值 |

**常用设置项示例：**

| key | value 示例 | 说明 |
|-----|-----------|------|
| font_size | 18 | 字体大小（px） |
| line_height | 1.8 | 行间距 |
| theme | white | 主题名称 |
| page_mode | scroll | 翻页模式 |

**建表 SQL：**

```sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
)
```

---

## 表关系图

```
┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│    books    │1    N │   chapters   │       │  book_sources │
│─────────────│──────▶│──────────────│       │───────────────│
│ id (PK)     │       │ id (PK)      │       │ id (PK)       │
│ title       │       │ book_id (FK) │◀──────│               │
│ author      │       │ chapter_index│   N   │               │
│ source_type │       │ title        │  1    │               │
│ ...         │       │ ...          │       │ ...           │
└─────────────┘       └──────────────┘       └───────────────┘
       │
       │ 1
       │
       ▼ N
┌─────────────┐
│  bookmarks  │
│─────────────│
│ id (PK)     │
│ book_id (FK)│
│ chapter_index│
│ position    │
│ ...         │
└─────────────┘

┌─────────────┐
│  settings   │
│─────────────│
│ key (PK)    │
│ value       │
└─────────────┘
```

**关系说明：**
- `books` 与 `chapters`：一对多（一本书有多个章节）
- `books` 与 `bookmarks`：一对多（一本书可以有多个书签）
- `books` 与 `book_sources`：多对一（多个在线书籍可来自同一个书源）
- `settings`：独立表，全局配置

---

## 数据库操作封装

所有数据库操作封装在 `src/utils/db.ts` 中，提供以下核心函数：

| 函数名 | 说明 |
|--------|------|
| `openDB()` | 打开/获取数据库连接 |
| `executeSql(sql, params)` | 执行 SQL 语句 |
| `initDB()` | 初始化数据库，创建所有表 |

**初始化流程：**
1. 调用 `initDB()` 触发数据库初始化
2. 依次执行 5 张表的 `CREATE TABLE IF NOT EXISTS` 语句
3. 标记 `isInit = true`，后续调用直接返回

**非 APP 环境兼容：**
在 H5 等非 APP 环境下，使用内存模拟数据库（mockDB），保证开发调试时代码可正常运行。

---

## 相关文件

- 数据库工具类：[`src/utils/db.ts`](file:///workspace/src/utils/db.ts)
- 章节数据库操作：[`src/utils/chapter-db.ts`](file:///workspace/src/utils/chapter-db.ts)
- 书籍状态管理：[`src/store/bookshelf.ts`](file:///workspace/src/store/bookshelf.ts)
- 阅读状态管理：[`src/store/reader.ts`](file:///workspace/src/store/reader.ts)
- 设置状态管理：[`src/store/settings.ts`](file:///workspace/src/store/settings.ts)
