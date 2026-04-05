<template>
  <button
    class="ui-btn"
    :class="[
      `btn-${variant}`,
      `btn-${size}`,
      `btn-${shape}`,
      { 'is-loading': loading, 'is-disabled': disabled, 'is-icon-only': icon && !$slots.default }
    ]"
    :disabled="disabled || loading"
    :title="title"
    @click="handleClick"
  >
    <!-- 涟漪效果 -->
    <span
      v-for="ripple in ripples"
      :key="ripple.id"
      class="ripple"
      :style="{ left: ripple.x + 'px', top: ripple.y + 'px' }"
    />
    <span v-if="loading" class="loading-spinner">
      <i class="icon icon-loading spin" />
    </span>
    <span v-else-if="icon" class="btn-icon">
      <i :class="['icon', icon]" />
    </span>
    <span v-if="$slots.default" class="btn-content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useButtonFeedback } from '@/composables/useAnimation'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  shape?: 'default' | 'circle' | 'square'
  icon?: string
  loading?: boolean
  disabled?: boolean
  title?: string
}>(), {
  variant: 'primary',
  size: 'md',
  shape: 'default',
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const { onClick } = useButtonFeedback()
const ripples = ref<{ x: number; y: number; id: number }[]>([])

// isIconOnly 通过模板中的 $slots.default 判断

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  
  // 创建涟漪效果
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const id = Date.now()
  
  ripples.value.push({ x, y, id })
  
  // 动画结束后移除涟漪
  setTimeout(() => {
    ripples.value = ripples.value.filter(r => r.id !== id)
  }, 600)
  
  onClick(event)
  emit('click', event)
}
</script>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: 
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-normal) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);
  position: relative;
  overflow: hidden;
  user-select: none;
  white-space: nowrap;
  will-change: transform;
}

/* 涟漪效果 */
.ripple {
  position: absolute;
  width: 100px;
  height: 100px;
  margin-left: -50px;
  margin-top: -50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  animation: ripple-effect var(--duration-slower) var(--ease-standard);
  pointer-events: none;
}

@keyframes ripple-effect {
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: transform var(--duration-fast) var(--ease-spring);
}

/* Primary 按钮 */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 120, 212, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.35);
  transform: translateY(-2px);
}

.btn-primary:hover:not(:disabled) .btn-icon {
  transform: scale(1.1);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
  transition: transform var(--duration-instant) var(--ease-standard);
}

/* Secondary 按钮 */
.btn-secondary {
  background-color: var(--bg-surface-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-surface-active);
  border-color: var(--text-secondary);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-secondary:hover:not(:disabled) .btn-icon {
  transform: scale(1.1);
}

.btn-secondary:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
  transition: transform var(--duration-instant) var(--ease-standard);
}

/* Outline 按钮 */
.btn-outline {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--bg-surface-hover);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 120, 212, 0.1);
}

.btn-outline:hover:not(:disabled) .btn-icon {
  transform: scale(1.1);
}

.btn-outline:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
  transition: transform var(--duration-instant) var(--ease-standard);
}

/* Text 按钮 */
.btn-text {
  background-color: transparent;
  color: var(--text-secondary);
}

.btn-text:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.btn-text:hover:not(:disabled) .btn-icon {
  transform: scale(1.1);
}

.btn-text:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
  transition: transform var(--duration-instant) var(--ease-standard);
}

/* Ghost 按钮 - 用于图标按钮 */
.btn-ghost {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid transparent;
}

.btn-ghost:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.btn-ghost:hover:not(:disabled) .btn-icon {
  transform: scale(1.1);
}

.btn-ghost:active:not(:disabled) {
  transform: translateY(0) scale(0.92);
  transition: transform var(--duration-instant) var(--ease-standard);
}

[data-theme="dark"] .btn-ghost:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.08);
}

/* Danger 按钮 */
.btn-danger {
  background-color: var(--color-error);
  color: white;
  box-shadow: 0 2px 4px rgba(255, 77, 79, 0.2);
}

.btn-danger:hover:not(:disabled) {
  background-color: #d13438;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.35);
  transform: translateY(-2px);
}

.btn-danger:hover:not(:disabled) .btn-icon {
  transform: scale(1.1);
}

.btn-danger:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
  transition: transform var(--duration-instant) var(--ease-standard);
}

/* 尺寸 - 默认 */
.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
  height: 28px;
}

.btn-md {
  padding: 8px 16px;
  font-size: 14px;
  height: 36px;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 16px;
  height: 48px;
}

/* 形状 - 圆形按钮 */
.btn-circle {
  border-radius: 50%;
  aspect-ratio: 1;
  padding: 0 !important;
}

.btn-circle.btn-sm {
  width: 28px;
  height: 28px;
}

.btn-circle.btn-md {
  width: 36px;
  height: 36px;
}

.btn-circle.btn-lg {
  width: 48px;
  height: 48px;
}

/* 方形按钮 */
.btn-square {
  border-radius: var(--radius-sm);
  aspect-ratio: 1;
  padding: 0 !important;
}

.btn-square.btn-sm {
  width: 28px;
  height: 28px;
}

.btn-square.btn-md {
  width: 36px;
  height: 36px;
}

.btn-square.btn-lg {
  width: 48px;
  height: 48px;
}

/* 图标专用按钮（无文字时） */
.is-icon-only.btn-sm {
  width: 28px;
  padding: 0;
}

.is-icon-only.btn-md {
  width: 36px;
  padding: 0;
}

.is-icon-only.btn-lg {
  width: 48px;
  padding: 0;
}

.is-icon-only .btn-icon {
  margin: 0;
}

/* 状态 */
.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.is-loading {
  cursor: wait;
}

/* 加载动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>