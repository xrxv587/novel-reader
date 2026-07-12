# Android 构建指南

## 环境要求

### 必备工具

1. **JDK 8+**
   - 推荐使用 JDK 11
   - 配置环境变量 `JAVA_HOME`

2. **Android Studio**
   - 下载地址：https://developer.android.com/studio
   - 安装时选择：
     - Android SDK Build-Tools 33.0.0
     - Android SDK Platform 33
     - Android SDK Platform-Tools
     - Android Emulator

3. **Gradle**
   - 项目已包含 Gradle Wrapper，无需单独安装

## 构建步骤

### 1. 安装依赖

```bash
cd novel-reader
npm install
```

### 2. 生成签名密钥

```bash
cd android/keystore
keytool -genkey -v -keystore novel_reader.keystore -alias novel_reader -keyalg RSA -keysize 2048 -validity 10000
```

按照提示输入信息，密码请使用：`novel123`

### 3. 构建 APK

#### 开发版本

```bash
npm run build:app-plus
```

#### 调试版本

```bash
npm run dev:app-plus
```

### 4. 使用 Android Studio 构建

1. 打开 Android Studio
2. 选择 "Open an existing project"
3. 选择 `novel-reader/android` 目录
4. 等待 Gradle 同步完成
5. 点击 "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"

## 运行

### 在模拟器上运行

1. 启动 Android Studio 模拟器
2. 运行以下命令：

```bash
cd android
./gradlew installDebug
```

### 在真机上运行

1. 开启手机开发者模式
2. 开启 USB 调试
3. 连接手机到电脑
4. 运行以下命令：

```bash
cd android
./gradlew installDebug
```

## 项目结构

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/example/novelreader/
│   │   │   ├── UniApplication.java  # 应用入口
│   │   │   └── UniActivity.java     # 主Activity
│   │   ├── res/
│   │   │   ├── values/
│   │   │   │   ├── strings.xml      # 字符串资源
│   │   │   │   └── styles.xml       # 样式资源
│   │   │   └── xml/
│   │   │       └── file_paths.xml   # FileProvider配置
│   │   ├── AndroidManifest.xml      # Android配置清单
│   │   └── assets/                  # Web资源（自动生成）
│   ├── build.gradle                 # 模块构建配置
│   ├── proguard-rules.pro           # 混淆规则
│   └── lint.xml                     # Lint配置
├── build.gradle                     # 项目构建配置
├── settings.gradle                  # 模块配置
├── gradle.properties                # Gradle属性
├── gradle/wrapper/                  # Gradle Wrapper
└── keystore/                        # 签名密钥目录
```

## 配置说明

### manifest.json 重要配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| appid | __UNI__NOVEL_READER | 应用唯一标识 |
| package | com.example.novelreader | Android包名 |
| minSdkVersion | 21 | 最低支持Android版本 |
| targetSdkVersion | 33 | 目标Android版本 |

### 权限说明

| 权限 | 用途 |
|------|------|
| READ_EXTERNAL_STORAGE | 读取本地txt小说 |
| WRITE_EXTERNAL_STORAGE | 保存书籍到本地 |
| MANAGE_EXTERNAL_STORAGE | Android 10+文件管理 |
| INTERNET | 网络请求（未来书源功能） |
| ACCESS_NETWORK_STATE | 网络状态检测 |
| WAKE_LOCK | 阅读时保持屏幕常亮 |

## 常见问题

### Gradle 同步失败

1. 检查网络连接
2. 检查 Android SDK 路径配置
3. 删除 `.gradle` 目录后重新同步

### 签名错误

1. 确保 `novel_reader.keystore` 文件存在
2. 检查 `build.gradle` 中的签名配置

### 文件读取权限问题

Android 10+ 需要请求 `MANAGE_EXTERNAL_STORAGE` 权限，应用启动时会自动请求。

## 注意事项

1. 发布正式版本前，请修改签名密钥密码
2. 建议使用 Android Studio 进行调试和性能分析
3. H5 版本和 Android 版本使用同一套代码，修改代码后需重新构建
