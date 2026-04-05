# UI 组件库

统一封装的 Vue 3 UI 组件，使用一致的动画系统和样式规范。

## 组件清单

### Button 按钮

主要按钮组件，支持多种变体、尺寸和状态。

```vue
<template>
  <!-- 基础用法 -->
  <UiButton @click="handleClick">点击我</UiButton>
  
  <!-- 变体 -->
  <UiButton variant="primary">主要</UiButton>
  <UiButton variant="secondary">次要</UiButton>
  <UiButton variant="outline">边框</UiButton>
  <UiButton variant="text">文字</UiButton>
  <UiButton variant="danger">危险</UiButton>
  <UiButton variant="ghost">幽灵</UiButton>
  
  <!-- 尺寸 -->
  <UiButton size="sm">小</UiButton>
  <UiButton size="md">中（默认）</UiButton>
  <UiButton size="lg">大</UiButton>
  
  <!-- 图标 -->
  <UiButton icon="icon-add">带图标</UiButton>
  <UiButton icon="icon-close" shape="circle" />
  
  <!-- 状态 -->
  <UiButton loading>加载中</UiButton>
  <UiButton disabled>禁用</UiButton>
</template>
```

**Props:**
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | string | 'primary' | 按钮变体 |
| size | string | 'md' | 按钮尺寸 |
| shape | string | 'default' | 按钮形状（default/circle/square） |
| icon | string | - | 图标类名 |
| loading | boolean | false | 加载状态 |
| disabled | boolean | false | 禁用状态 |
| title | string | - | 提示文本 |

**特性:**
- 水波纹点击效果
- 悬停上浮动画（translateY -2px）
- 图标缩放动画（1.1x）
- 点击反馈（scale 0.96）
- 弹簧曲线过渡

---

### IconButton 图标按钮

专门用于只有图标的按钮场景。

```vue
<template>
  <!-- 基础用法 -->
  <UiIconButton icon="icon-close" @click="handleClose" />
  
  <!-- 变体 -->
  <UiIconButton icon="icon-settings" variant="default" />
  <UiIconButton icon="icon-check" variant="primary" />
  <UiIconButton icon="icon-trash" variant="danger" />
  <UiIconButton icon="icon-moon" variant="ghost" />
  
  <!-- 尺寸 -->
  <UiIconButton icon="icon-close" size="sm" />
  <UiIconButton icon="icon-close" size="md" />
  <UiIconButton icon="icon-close" size="lg" />
  
  <!-- 带背景 -->
  <UiIconButton icon="icon-close" background />
</template>
```

**Props:**
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| icon | string | 必填 | 图标类名 |
| variant | string | 'default' | 按钮变体 |
| size | string | 'md' | 按钮尺寸 |
| background | boolean | false | 是否显示背景 |
| loading | boolean | false | 加载状态 |
| disabled | boolean | false | 禁用状态 |

---

### 其他组件

- **Card** - 卡片容器
- **Input** - 输入框
- **Switch** - 开关
- **Tabs** - 标签页
- **Info** - 信息展示
- **Modal** - 模态框
- **GlassMessage** - 玻璃态消息提示

---

## 动画系统

所有组件使用统一的 CSS 动画变量：

```css
/* 时长 */
--duration-instant: 100ms
--duration-fast: 200ms
--duration-normal: 300ms
--duration-slow: 400ms
--duration-slower: 600ms

/* 缓动函数 */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### 标准交互模式

1. **悬停 (Hover)**
   - 元素上浮: `transform: translateY(-2px)`
   - 阴影增强: `box-shadow` 扩大
   - 图标缩放: `transform: scale(1.1)`
   - 过渡时长: `var(--duration-fast)`

2. **点击 (Active)**
   - 按下效果: `transform: scale(0.96)`
   - 水波纹效果: 从点击位置扩散
   - 过渡时长: `var(--duration-instant)`

3. **状态变化**
   - 使用 `var(--duration-normal)`
   - 使用 `var(--ease-standard)` 缓动

---

## 导入方式

```typescript
// 单个导入
import UiButton from '@/components/ui/Button.vue'
import UiIconButton from '@/components/ui/IconButton.vue'

// 批量导入
import { UiButton, UiIconButton, UiInput, UiCard } from '@/components/ui'

// Composables
import { useModal, useGlassMessage, useFullscreenModal } from '@/components/ui'
```
