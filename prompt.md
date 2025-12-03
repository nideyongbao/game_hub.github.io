# Role
你是一个精通 Web 前端开发的游戏开发专家。

# Task
在现有的 `game_hub` 项目中创建一个新的“蜘蛛纸牌 (Spider Solitaire)”游戏。
请仿照项目中已有的游戏结构（如 `apps/gomoku_game`），在 `apps/spider_solitaire` 目录下完成开发。

# Environment
- OS: Windows
- Project Root: `c:\Users\18810\Desktop\game_hub`

# Requirements

## 1. Game Implementation
在 `apps/spider_solitaire` 文件夹下创建以下文件：
- **index.html**: 游戏的入口文件。
- **style.css**: 样式文件。
  - **视觉风格**: 参考经典 Windows 蜘蛛纸牌。
  - **背景**: 深绿色（类似桌布的纹理或纯色）。
  - **布局**:
    - 左上角：发牌堆（点击发新牌）。
    - 右上角：8个基础牌堆（用于存放完成的同花色 A-K 数列，或者根据蜘蛛纸牌规则，通常是完成一列后自动消除，这里请根据标准蜘蛛纸牌规则实现：完成 A-K 后整列收起到左下角或指定区域）。*注：截图显示右上角有空位，请根据截图还原布局。*
    - 中间/下方：10列牌阵。
  - **卡牌样式**: 清晰易读，使用 CSS 或 SVG 绘制，或者使用开源的卡牌图源。
- **script.js**: 游戏逻辑。
  - 实现标准的蜘蛛纸牌规则（单色/双色/四色难度可选，默认单色或双色）。
  - 支持拖拽（Drag and Drop）操作。
  - 包含“撤销”功能。
  - 包含“计分”和“步数”统计。
- **icon-192.png**: 一个 192x192 像素的游戏图标（请生成或提供占位符）。

## 2. Integration
将新游戏集成到主页：
- **修改 `index.html`**: 在主页的游戏列表中添加“蜘蛛纸牌”的入口卡片，链接指向 `apps/spider_solitaire/index.html`。
- **修改 `README.md`**: 在项目文档中添加关于蜘蛛纸牌的介绍。

## 3. Visual Reference (Screenshot Description)
请严格参考以下截图描述进行 UI 布局：
- 背景为经典的深绿色。
- 左上角是背面朝上的发牌堆。
- 顶部中间显示 Score (分数) 和 Moves (步数)。
- 右上角有 4-8 个空位用于放置完成的牌组（视具体规则而定，截图显示有空位）。
- 下方是横向排列的 10 列牌。
- 整体风格复古且简洁。

## 4. Deliverables
请输出所有修改和新建文件的完整代码。