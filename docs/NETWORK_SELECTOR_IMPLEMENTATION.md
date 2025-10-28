# Network Selector 实现方案对比

## 当前实现：Phaser DOM Element 方案

### 优点
✅ **直接集成** - 使用 Phaser 内置的 `this.add.dom()` API  
✅ **HTML 模板** - 可以直接插入 HTML 字符串，易于从设计稿转换  
✅ **轻量级** - 不需要额外的 React Portal 配置  
✅ **样式隔离** - 使用内联 `<style>` 标签，样式作用域清晰  

### 代码示例
```typescript
// Game.ts - createNetworkSelector()
const htmlTemplate = `
  <style>
    #network-selector-wrapper { width: 110px; }
    .main-button { background-color: #FBFAEE; }
  </style>
  <div id="network-selector-wrapper">
    <div class="main-button" onclick="window.toggleNetworkDropdown()">
      <span class="selected-text">Mainnet</span>
    </div>
  </div>
`;

const domElement = this.add.dom(33, 15, 'div');
domElement.setHTML(htmlTemplate);
```

### 适用场景
- 简单的 UI 组件（下拉框、按钮、提示框）
- 不需要复杂状态管理
- 纯展示或轻量级交互

---

## 替代方案：React Component + Portal

### 优点
✅ **组件复用** - 可以在多个场景和页面中使用  
✅ **状态管理** - 使用 React Hooks，状态管理更清晰  
✅ **类型安全** - TypeScript 类型检查更完善  
✅ **测试友好** - 可以单独进行单元测试  
✅ **开发体验** - 热重载、React DevTools 支持  

### 实现步骤

#### 1. 创建 React 组件
```tsx
// src/components/NetworkSelector.tsx
import { useState } from 'react';

export function NetworkSelector({ onNetworkChange }) {
  const [selectedNetwork, setSelectedNetwork] = useState('Mainnet');
  
  return (
    <div className="network-selector-wrapper">
      {/* HTML 结构 */}
    </div>
  );
}
```

#### 2. 在 Phaser 场景中使用 React Portal
```typescript
// Game.ts
import { createRoot } from 'react-dom/client';
import { NetworkSelector } from '../components/NetworkSelector';

private createNetworkSelector(): void {
  // 创建容器
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '15px';
  container.style.left = '33px';
  container.style.zIndex = '1000';
  document.body.appendChild(container);

  // 渲染 React 组件
  const root = createRoot(container);
  root.render(
    <NetworkSelector 
      onNetworkChange={(network) => this.handleNetworkChange(network)}
    />
  );
  
  this.networkSelectorRoot = root;
  this.networkSelector = container;
}

// 清理时卸载
shutdown(): void {
  if (this.networkSelectorRoot) {
    this.networkSelectorRoot.unmount();
  }
  if (this.networkSelector && this.networkSelector.parentNode) {
    this.networkSelector.parentNode.removeChild(this.networkSelector);
  }
}
```

#### 3. 更新类型定义
```typescript
// Game.ts
private networkSelector!: HTMLElement;
private networkSelectorRoot!: Root;
```

### 适用场景
- 复杂的 UI 组件（表单、表格、图表）
- 需要跨场景复用
- 需要复杂的状态管理和交互逻辑

---

## 推荐方案选择指南

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 简单下拉框、按钮 | **Phaser DOM** | 轻量级，代码集中 |
| 表单、设置面板 | **React Component** | 状态管理方便 |
| 跨场景复用的 UI | **React Component** | 组件化，易维护 |
| 一次性的提示框 | **Phaser DOM** | 无需额外配置 |
| 需要 Redux/Zustand | **React Component** | 集成状态管理库 |

---

## 当前项目使用的方案

✅ **已实现：Phaser DOM Element**
- 文件：`apps/web/src/game/scenes/Game.ts`
- 方法：`createNetworkSelector()`
- 优化点：
  1. 使用 HTML 模板字符串，而非逐个创建 DOM 元素
  2. 样式集中在 `<style>` 标签中，易于修改
  3. 交互逻辑通过全局函数 `window.toggleNetworkDropdown()` 处理
  4. 自动清理机制在 `shutdown()` 中

📦 **备选方案：React Component**
- 文件：`apps/web/src/components/NetworkSelector.tsx`
- 如需切换到 React 方案：
  1. 安装依赖：已有 React 19
  2. 修改 `Game.ts` 中的 `createNetworkSelector()` 方法
  3. 使用 `createRoot()` 渲染组件

---

## 维护建议

### Phaser DOM 方案
- ✅ **修改样式**：直接编辑 `<style>` 标签内的 CSS
- ✅ **添加选项**：在 HTML 模板中添加新的 `option-item`
- ✅ **调整位置**：修改 `this.add.dom(x, y)` 的坐标

### React Component 方案
- ✅ **修改样式**：编辑组件内的 `<style>` 或提取到独立 CSS 文件
- ✅ **添加选项**：修改 `options` 数组或使用 props 传入
- ✅ **单元测试**：使用 Vitest + React Testing Library

---

## 性能对比

| 指标 | Phaser DOM | React Component |
|------|-----------|-----------------|
| 初始化速度 | 🚀 极快 | ⚡ 快 |
| 内存占用 | 💚 低 | 💛 中等 |
| 重渲染性能 | 💚 无虚拟 DOM | 💚 React 优化 |
| 开发效率 | 💛 手动 DOM | 💚 声明式 |

---

## 总结

对于当前的网络选择器需求，**Phaser DOM Element 方案**已经足够：
- ✅ 代码从 160 行优化到 80 行（HTML 模板化）
- ✅ 样式集中管理，易于修改
- ✅ 直接基于设计稿 HTML 实现
- ✅ 无需额外依赖和配置

如果未来需要更复杂的 UI（如设置面板、游戏 HUD），可以考虑切换到 React Component 方案。

---

## 快速参考

### 当前实现位置
- **Phaser 场景**：`apps/web/src/game/scenes/Game.ts` - `createNetworkSelector()`
- **Phaser 配置**：`apps/web/src/game/main.ts` - 已启用 `dom: { createContainer: true }`
- **React 组件**（备用）：`apps/web/src/components/NetworkSelector.tsx`

### 修改颜色
```typescript
// 直接在 htmlTemplate 的 <style> 中修改
.main-button { border: 2px solid #805CAD; }
.option-item:hover { background-color: #F0E8F8; }
.bottom-bar { background-color: #D8BBF0; }
```

### 添加新网络
```typescript
// 在 HTML 模板中添加新的 option-item
<div class="option-item" data-value="Devnet" onclick="window.selectNetworkOption('Devnet')">
  <span class="option-text">Devnet</span>
  <img class="check-icon hidden" src="..." />
</div>
```
