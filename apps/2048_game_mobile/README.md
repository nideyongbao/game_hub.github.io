# 2048 移动端游戏

专为移动设备优化的 2048 小游戏，支持 PWA（渐进式 Web 应用）功能。

## 特性

✨ **移动端优化**
- 完美适配移动设备屏幕
- 触摸手势控制（滑动移动方块）
- 防止页面滚动
- 支持安全区域（刘海屏适配）

📱 **PWA 功能**
- 可安装到手机主屏幕
- 离线使用
- 像原生应用一样运行
- 无浏览器地址栏

✨ **用户体验**
- 震动反馈（移动时、合并时）
- 流畅的动画效果
- 自动保存最高分
- 横竖屏自适应

## 如何使用

### 方法一：浏览器直接打开
1. 在手机浏览器中打开 `index.html`
2. 滑动屏幕移动方块
3. 相同数字的方块会合并

### 方法二：安装到主屏幕（推荐）

#### 在 Android 设备上：
1. 使用 Chrome 浏览器打开游戏
2. 点击右上角的"︙"菜单
3. 选择"添加到主屏幕"或"安装应用"
4. 从主屏幕启动游戏

#### 在 iOS 设备上：
1. 使用 Safari 浏览器打开游戏
2. 点击底部的"分享"按钮
3. 向下滚动，选择"添加到主屏幕"
4. 点击"添加"
5. 从主屏幕启动游戏

## 本地测试

### 使用 HTTP 服务器
由于 Service Worker 需要 HTTPS 或 localhost，建议使用本地服务器测试：

```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js (需要先安装 http-server)
npx http-server -p 8000

# 使用 PHP
php -S localhost:8000
```

然后在浏览器中访问：`http://localhost:8000`

### 在手机上测试
1. 确保电脑和手机在同一 WiFi 网络
2. 启动本地服务器
3. 获取电脑的局域网 IP 地址（如 192.168.1.100）
4. 在手机浏览器中访问：`http://192.168.1.100:8000`

## 文件说明

- `index.html` - 主页面
- `style.css` - 样式文件（移动端优化）
- `game.js` - 游戏逻辑（触摸控制 + 震动反馈）
- `manifest.json` - PWA 配置文件
- `sw.js` - Service Worker（离线缓存）
- `icon-192.png` - 应用图标 (192x192)

## 浏览器兼容性

- ✅ Chrome/Edge (Android)
- ✅ Safari (iOS)
- ✅ Firefox (Android)
- ✅ Samsung Internet

## 技术栈

- HTML5
- CSS3 (Grid + Flexbox)
- 原生 JavaScript
- PWA (Service Worker + Web App Manifest)
- Touch Events API
- Vibration API

## 注意事项

1. **PWA 安装**：需要通过 HTTPS 或 localhost 访问才能安装
2. **震动功能**：部分设备可能不支持震动 API
3. **离线使用**：首次访问后会缓存资源，之后可离线使用
4. **iOS Safari**：完全支持，但 PWA 功能略有限制

## 与桌面版的区别

- ✅ 移动端触摸手势优化
- ✅ 添加震动反馈
- ✅ 支持 PWA 安装
- ✅ 防止页面滚动
- ✅ 更大的触摸区域
- ✅ 安全区域适配
- ✅ 横竖屏优化
