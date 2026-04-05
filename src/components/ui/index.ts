/**
 * UI 组件统一导出
 * 
 * 所有 UI 组件都使用统一的动画系统:
 * - 悬停: transform + box-shadow 变化
 * - 点击: scale 反馈
 * - 过渡: CSS 变量控制的 duration 和 easing
 */

export { default as UiButton } from './Button.vue'
export { default as UiIconButton } from './IconButton.vue'
export { default as UiCard } from './Card.vue'
export { default as UiInput } from './Input.vue'
export { default as UiSwitch } from './Switch.vue'
export { default as UiTabs } from './Tabs.vue'
export { default as UiInfo } from './Info.vue'

// Modal 组件
export { default as UiModal } from './Modal.vue'
export { default as UiGlassMessage } from './GlassMessage.vue'

// Modal 相关 composables
export { useModal } from './composables/useModal'
export { useGlassMessage } from './composables/useGlassMessage'

// 全屏模态框状态管理
export { useFullscreenModal } from './composables/useFullscreenModal'
