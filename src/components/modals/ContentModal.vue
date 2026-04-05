<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @after-enter="onAfterEnter"
      @after-leave="onAfterLeave"
    >
      <div
        v-show="visible"
        :class="['content-modal', { 'is-fullscreen': fullscreen, [`is-${type}`]: true, 'has-backdrop': showBackdrop }]"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div
          ref="modalRef"
          class="modal-wrapper"
          :class="{ 'no-title': !showHeader, [`type-${type}`]: true }"
          @click.stop
        >
          <!-- 头部 - 全屏模式下隐藏（标题显示在 TitleBar） -->
          <header v-if="showHeader && !fullscreen" class="modal-header">
            <div class="header-content">
              <slot name="header">
                <div class="header-title">
                  <i v-if="iconType" :class="['icon', iconType]" class="type-icon" />
                  <h3 :id="titleId" class="modal-title">{{ title }}</h3>
                </div>
              </slot>
            </div>
            <UiButton
              v-if="closable && showCloseBtn"
              variant="ghost"
              shape="circle"
              size="sm"
              icon="icon-close"
              class="close-btn"
              :title="t('common.close')"
              @click="close"
            />
          </header>

          <!-- 内容 -->
          <main class="modal-body" :class="bodyClass">
            <slot />
            <!-- 默认内容插槽（用于简单文本内容） -->
            <slot name="content">
              <p v-if="content" class="modal-content-text">{{ content }}</p>
            </slot>
          </main>

          <!-- 底部按钮区域 - 根据类型自动显示（协议类型在全屏模式下也显示） -->
          <footer v-if="showFooter && (!fullscreen || type === 'agreement')" class="modal-footer">
            <slot name="footer">
              <!-- 协议类型：同意/不同意 -->
              <template v-if="type === 'agreement'">
                <UiButton variant="secondary" @click="handleCancel">
                  {{ cancelText || t('modal.disagree') }}
                </UiButton>
                <UiButton variant="primary" @click="handleConfirm">
                  {{ confirmText || t('modal.agree') }}
                </UiButton>
              </template>
              
              <!-- 确认类型：取消/确认 -->
              <template v-else-if="type === 'confirm'">
                <UiButton variant="secondary" @click="handleCancel">
                  {{ cancelText || t('modal.cancel') }}
                </UiButton>
                <UiButton :variant="danger ? 'danger' : 'primary'" @click="handleConfirm">
                  {{ confirmText || t('modal.confirm') }}
                </UiButton>
              </template>
              
              <!-- 警告/提示类型：确定 -->
              <template v-else-if="type === 'alert' || type === 'warning'">
                <UiButton :variant="type === 'warning' ? 'danger' : 'primary'" @click="handleConfirm">
                  {{ confirmText || t('modal.ok') }}
                </UiButton>
              </template>
            </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useFullscreenModal } from '@/composables/useFullscreenModal'
import { useI18n } from 'vue-i18n'
import UiButton from '@/components/ui/Button.vue'

const { t } = useI18n()

// 弹窗类型
export type ModalType = 'content' | 'agreement' | 'confirm' | 'alert' | 'warning'

// Props 定义
interface Props {
  /** 是否可见 */
  visible: boolean
  /** 弹窗类型：content-普通内容, agreement-协议, confirm-确认, alert-提示, warning-警告 */
  type?: ModalType
  /** 标题文本 */
  title?: string
  /** 内容文本（简单内容时可用） */
  content?: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 是否危险操作（confirm类型下确认按钮变红） */
  danger?: boolean
  /** 是否可关闭 */
  closable?: boolean
  /** 是否显示关闭按钮 */
  showCloseBtn?: boolean
  /** 是否显示底部按钮区域 */
  showFooter?: boolean
  /** 是否全屏显示（覆盖整个内容区） */
  fullscreen?: boolean
  /** 点击遮罩是否关闭（已废弃，不再支持点击外部关闭） */
  maskClosable?: boolean
  /** 内容区域自定义类名 */
  bodyClass?: string
  /** 是否锁定背景滚动 */
  lockScroll?: boolean
  /** 是否显示背景遮罩，默认不显示 */
  showBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'content',
  closable: true,
  showCloseBtn: true,
  showFooter: true,
  fullscreen: false,
  maskClosable: false,
  lockScroll: true,
  danger: false,
  showBackdrop: false
})

// Emits 定义
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'closed'): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

// 根据类型获取图标
const iconType = computed(() => {
  switch (props.type) {
    case 'confirm':
      return 'icon-help-circle'
    case 'alert':
      return 'icon-info'
    case 'warning':
      return 'icon-alert-triangle'
    case 'agreement':
      return 'icon-file-text'
    default:
      return ''
  }
})

// 全屏弹窗状态管理
const fullscreenModal = useFullscreenModal()

// Refs
const modalRef = ref<HTMLElement | null>(null)
const titleId = computed(() => `modal-title-${Math.random().toString(36).slice(2, 9)}`)

// Computed
const showHeader = computed(() => props.title || props.closable || slots.header)

// Slots
const slots = defineSlots<{
  default?: () => any
  header?: () => any
  footer?: () => any
  content?: () => any
}>()

// 关闭方法
const close = () => {
  // 全屏模式下同步关闭 TitleBar 状态
  if (props.fullscreen) {
    fullscreenModal.close()
  }
  emit('update:visible', false)
  emit('close')
}

// 打开方法
const open = () => {
  emit('update:visible', true)
  emit('open')
}

// 确认按钮处理
const handleConfirm = () => {
  emit('confirm')
  // 协议类型不自动关闭，由外部控制
  if (props.type !== 'agreement') {
    close()
  }
}

// 取消按钮处理
const handleCancel = () => {
  emit('cancel')
  // 协议类型不自动关闭，由外部控制
  if (props.type !== 'agreement') {
    close()
  }
}

// 点击遮罩处理（已废弃，不再支持点击外部关闭）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleBackdropClick = () => {
  // 点击外部不再关闭弹窗
}

// 键盘 ESC 关闭
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible && props.closable) {
    close()
  }
}

// 生命周期钩子
const onAfterEnter = () => {
  emit('opened')
}

const onAfterLeave = () => {
  emit('closed')
}

// 页面内容滑出/滑入控制
const togglePageContent = (isOpen: boolean) => {
  if (!props.fullscreen) return
  
  // 找到页面内容容器（.page-container）
  const pageContent = document.querySelector('.page-container') as HTMLElement
  if (!pageContent) return
  
  if (isOpen) {
    pageContent.classList.add('modal-page-slide-out')
  } else {
    pageContent.classList.remove('modal-page-slide-out')
  }
}

// 监听 visible 变化
watch(() => props.visible, (val) => {
  console.log('[ContentModal] watch visible 变化:', val, 'fullscreen:', props.fullscreen, 'title:', props.title)
  if (val) {
    nextTick(() => {
      modalRef.value?.focus()
    })
    document.addEventListener('keydown', handleKeydown)
    if (props.lockScroll) {
      const mainContent = document.querySelector('.main-content') as HTMLElement | null
      if (mainContent) {
        mainContent.style.overflow = 'hidden'
      }
    }
    // 全屏弹窗打开时，页面内容右滑离开
    togglePageContent(true)
    // 全屏模式下同步更新 TitleBar
    if (props.fullscreen && props.title) {
      console.log('[ContentModal] 打开全屏弹窗状态')
      fullscreenModal.open(props.title, close)
    }
  } else {
    document.removeEventListener('keydown', handleKeydown)
    if (props.lockScroll) {
      const mainContent = document.querySelector('.main-content') as HTMLElement | null
      if (mainContent) {
        mainContent.style.overflow = ''
      }
    }
    // 全屏弹窗关闭时，页面内容滑回，并重置全屏状态
    togglePageContent(false)
    // 只有关闭的是全屏弹窗时，才重置全屏弹窗状态
    if (props.fullscreen) {
      console.log('[ContentModal] 关闭全屏弹窗，重置 fullscreenModal')
      fullscreenModal.reset()
    }
  }
}, { immediate: true })

// 暴露方法
defineExpose({
  close,
  open
})
</script>

<style scoped>
/* ==================== 基础样式（普通弹窗模式） ==================== */
.content-modal {
  /* 固定定位，从顶部栏下方开始 */
  position: fixed;
  top: 50px; /* 顶部栏高度 */
  left: 0;
  width: 100vw;
  height: calc(100vh - 50px);
  z-index: 100; /* 低于顶部栏的 1000 */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* 默认无背景遮罩 */
  background: transparent;
  border-radius: 0;
}

/* 显示背景遮罩时 - 亮色模式为白色半透明 */
.content-modal.has-backdrop {
  background: rgba(255, 255, 255, 0.6);
}

/* 全屏模式 - 从顶部栏下方开始 */
.content-modal.is-fullscreen {
  background: transparent;
  align-items: center;
  justify-content: center;
}

/* 全屏模式显示背景遮罩 */
.content-modal.is-fullscreen.has-backdrop {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* ==================== 弹窗容器 ==================== */
.modal-wrapper {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface, rgba(255, 255, 255, 0.85));
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  
  /* 尺寸限制 */
  min-width: 420px;
  max-width: 90%;
  max-height: 90%;
  
  /* 动画性能优化 */
  will-change: transform, opacity;
  transform-origin: center center;
}

/* 全屏模式下的容器 - 与页面内容区协调 */
.is-fullscreen .modal-wrapper {
  width: 85vw;
  height: 80vh;
  max-width: 1100px;
  max-height: 700px;
  border-radius: var(--radius-lg);
  /* 半透明背景 */
  background: var(--bg-surface, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(var(--blur-lg));
  -webkit-backdrop-filter: blur(var(--blur-lg));
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* 无标题时的顶部圆角 */
.modal-wrapper.no-title {
  overflow: hidden;
}

/* ==================== 头部 ==================== */
.modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  gap: 12px;
}

/* 全屏模式下不显示头部（标题在 TitleBar 中显示） */
.is-fullscreen .modal-header {
  display: none;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  line-height: 1.4;
}

.is-fullscreen .modal-title {
  font-size: 16px;
}

/* 关闭按钮 */
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #666);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-standard);
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--hover-bg, rgba(0, 0, 0, 0.05));
  color: var(--text-primary, #1a1a1a);
}

.close-btn:active {
  transform: scale(0.95);
}

.close-btn .icon {
  font-size: 18px;
  line-height: 1;
}

/* ==================== 内容区域 ==================== */
.modal-body {
  flex: 1;
  overflow: auto;
  padding: 16px;
  color: var(--text-primary);
}

/* 全屏模式内容区 */
.is-fullscreen .modal-body {
  padding: 16px 20px;
}

/* ==================== 底部 ==================== */
.modal-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-app);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.is-fullscreen .modal-footer {
  border-radius: 0;
  padding: 12px 20px;
  /* 全屏时底部 */
  background: var(--bg-surface);
}

/* ==================== 动画效果 ==================== */
.modal-enter-active,
.modal-leave-active {
  transition: 
    opacity var(--duration-slow) var(--ease-standard),
    backdrop-filter var(--duration-slow) var(--ease-standard);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 弹窗内容动画 */
.modal-enter-active .modal-wrapper {
  transition: 
    transform var(--duration-slow) var(--ease-smooth),
    opacity var(--duration-slow) var(--ease-standard);
}

.modal-leave-active .modal-wrapper {
  transition: 
    transform var(--duration-normal) var(--ease-standard),
    opacity var(--duration-fast) var(--ease-standard);
}

/* 普通模式 - 缩放弹入 */
.content-modal:not(.is-fullscreen) .modal-wrapper {
  transform-origin: center center;
}

.modal-enter-from .modal-wrapper {
  transform: scale(0.92);
  opacity: 0;
}

.modal-leave-to .modal-wrapper {
  transform: scale(0.96);
  opacity: 0;
}

/* 全屏模式 - 替换式动画 */
/* 进入：从右侧滑入 */
.is-fullscreen.modal-enter-from .modal-wrapper {
  transform: translateX(100%);
}

.is-fullscreen.modal-enter-active .modal-wrapper {
  transform: translateX(0);
}

/* 离开：向左滑出 */
.is-fullscreen.modal-leave-to .modal-wrapper {
  transform: translateX(-100%);
}

/* ==================== 暗色主题（使用 data-theme 属性） ==================== */
[data-theme="dark"] .content-modal {
  /* 默认无背景遮罩 */
  background: transparent;
}

/* 暗色主题显示背景遮罩 */
[data-theme="dark"] .content-modal.has-backdrop {
  background: rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] .content-modal.is-fullscreen {
  background: transparent;
  border: none;
}

[data-theme="dark"] .content-modal.is-fullscreen.has-backdrop {
  background: rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] .modal-wrapper {
  background: var(--bg-surface, rgba(30, 41, 59, 0.85));
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.03);
}

[data-theme="dark"] .is-fullscreen .modal-wrapper {
  /* 暗色全屏背景 */
  background: var(--bg-surface, rgba(30, 41, 59, 0.98));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] .modal-title {
  color: var(--text-primary, #f1f5f9);
}

[data-theme="dark"] .close-btn {
  color: var(--text-secondary, #94a3b8);
}

[data-theme="dark"] .close-btn:hover {
  background: var(--hover-bg, rgba(255, 255, 255, 0.08));
  color: var(--text-primary, #f1f5f9);
}

[data-theme="dark"] .modal-body {
  color: var(--text-primary, #f1f5f9);
}

[data-theme="dark"] .modal-header,
[data-theme="dark"] .modal-footer {
  border-color: var(--border-color, rgba(255, 255, 255, 0.08));
}

/* ==================== 类型图标 ==================== */
.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.is-confirm .type-icon {
  color: var(--color-primary, #1890ff);
}

.is-alert .type-icon {
  color: var(--color-info, #13c2c2);
}

.is-warning .type-icon {
  color: var(--color-warning, #faad14);
}

.is-agreement .type-icon {
  color: var(--color-primary, #1890ff);
}

/* ==================== 内容文本 ==================== */
.modal-content-text {
  margin: 0;
  line-height: 1.6;
  color: var(--text-secondary, #666);
  font-size: 14px;
}

/* ==================== 协议类型按钮样式 ==================== */
/* 同意按钮 - 不再变色，保留动画 */
.modal-footer :deep(.btn-primary) {
  transition: 
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-normal) var(--ease-standard);
}

.modal-footer :deep(.btn-primary:hover) {
  background-color: var(--color-primary) !important;
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.35);
}

.modal-footer :deep(.btn-primary:hover .btn-icon) {
  transform: scale(1.1);
}

/* 不同意按钮 - 不再变色，保留动画 */
.modal-footer :deep(.btn-secondary) {
  transition: 
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-normal) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);
}

.modal-footer :deep(.btn-secondary:hover) {
  background-color: var(--bg-surface-hover) !important;
  border-color: var(--border-color) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.modal-footer :deep(.btn-secondary:hover .btn-icon) {
  transform: scale(1.1);
}

/* 点击反馈 */
.modal-footer :deep(.ui-btn:active) {
  transform: translateY(0) scale(0.96);
}

/* ==================== 响应式适配 ==================== */
@media (max-width: 640px) {
  .content-modal:not(.is-fullscreen) {
    padding: 16px;
  }
  
  .modal-wrapper {
    min-width: auto;
    width: 100%;
    max-height: 100%;
  }
  
  .modal-body {
    padding: 16px;
  }
}
</style>