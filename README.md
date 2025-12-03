# 🎮 游戏中心 Game Hub

一个精致的游戏集合项目，采用统一入口设计，让你轻松访问各种有趣的游戏应用。

## 📋 目录

- [关于项目](#关于项目)
- [项目结构](#项目结构)
- [已有应用](#已有应用)
- [如何运行](#如何运行)
- [如何添加新应用](#如何添加新应用)
- [技术特点](#技术特点)

## 关于项目

本项目提供一个美观、易用的统一入口，用于管理和访问多个游戏应用。

每个应用都是一个独立的子项目，存放在 `apps` 目录下，便于管理和扩展。

## 项目结构

```
game_hub/
├── apps/                    # 应用目录
│   ├── 2048_game_mobile/   # 2048 游戏
│   │   ├── index.html
│   │   ├── game.js
│   │   ├── style.css
│   │   └── ...
│   └── uno_game/           # UNO 游戏
│       ├── index.html
│       ├── game.js
│       ├── style.css
│       └── ...
├── index.html              # 统一入口页面
├── style.css               # 入口页面样式
└── README.md               # 项目说明文档
```

## 已有应用

### 🎯 2048 游戏
经典的数字合并益智游戏。通过滑动方块，合并相同的数字，挑战更高的分数！

**特点：**
- 流畅的触控体验
- 移动端优化
- 本地最高分记录

### 🃏 UNO 游戏
经典的 UNO 卡牌游戏。出牌、换色、跳过，与 AI 对手一决高下！

**特点：**
- 精美的卡牌设计
- 智能 AI 对手
- 完整的游戏规则
- 流畅的动画效果

## 如何运行

### 方法一：直接打开（推荐）
1. 克隆或下载本项目
2. 直接用浏览器打开 `index.html` 文件
3. 点击任意游戏卡片开始游戏

### 方法二：使用本地服务器
如果需要完整的开发体验，可以使用本地服务器：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx http-server

# 使用 VS Code 的 Live Server 扩展
# 右键 index.html -> Open with Live Server
```

然后在浏览器中访问 `http://localhost:8000`

## 如何添加新应用

添加新应用非常简单，只需要三个步骤：

### 1. 创建应用文件夹
在 `apps` 目录下创建新的应用文件夹：
```bash
mkdir apps/your_new_game
```

### 2. 添加应用文件
在新建的文件夹中添加应用所需的文件（至少需要 `index.html`）：
```
apps/your_new_game/
├── index.html
├── game.js
├── style.css
└── ...
```

### 3. 更新入口页面
在根目录的 `index.html` 中添加新的游戏卡片：

```html
<a href="apps/your_new_game/index.html" class="app-card">
    <div class="app-icon">🎲</div>
    <div class="app-content">
        <h2 class="app-title">你的游戏名称</h2>
        <p class="app-description">
            游戏描述...
        </p>
        <div class="app-tags">
            <span class="tag">标签1</span>
            <span class="tag">标签2</span>
        </div>
    </div>
    <div class="app-arrow">→</div>
</a>
```

就这么简单！你的新应用已经添加完成了。🎉

## 技术特点

### 🎨 现代化设计
- 深色主题配色
- 玻璃态效果（Glassmorphism）
- 流畅的动画和过渡效果
- 响应式布局，完美适配各种设备

### ⚡ 性能优化
- 纯静态页面，无需服务器
- 轻量级，加载速度快
- 使用 CSS 动画替代 JavaScript 动画

### 📱 移动端友好
- 响应式设计
- 触控优化
- 适配各种屏幕尺寸

### 🔧 易于维护
- 清晰的项目结构
- 独立的应用模块
- 简单的添加流程

## 浏览器兼容性

- ✅ Chrome / Edge (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ 移动端浏览器

## 贡献

欢迎贡献新的游戏应用或改进现有功能！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingGame`)
3. 提交你的更改 (`git commit -m 'Add some AmazingGame'`)
4. 推送到分支 (`git push origin feature/AmazingGame`)
5. 创建一个 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 致谢

- 字体使用 Google Fonts 的 Inter 和 Noto Sans SC

---

**享受游戏，玩得开心！** 🎮✨
