import { ref, computed } from 'vue'

interface FullscreenModalState {
  visible: boolean
  title: string
  onClose?: () => void
}

// 使用栈来管理多个全屏弹窗状态
const modalStack = ref<FullscreenModalState[]>([])

export function useFullscreenModal() {
  // 当前顶层全屏弹窗状态
  const currentModal = computed(() => modalStack.value.length > 0 ? modalStack.value[modalStack.value.length - 1] : null)
  const isVisible = computed(() => modalStack.value.length > 0)
  const title = computed(() => currentModal.value?.title || '')

  const open = (title: string, onClose?: () => void) => {
    console.log('[FullscreenModal] open 被调用，标题:', title)
    const newState: FullscreenModalState = {
      visible: true,
      title,
      onClose
    }
    modalStack.value.push(newState)
    console.log('[FullscreenModal] open 后栈长度:', modalStack.value.length, '栈顶:', newState)
  }

  const close = () => {
    console.log('[FullscreenModal] close 被调用，当前栈长度:', modalStack.value.length)
    if (modalStack.value.length === 0) {
      console.log('[FullscreenModal] 弹窗栈为空，无需关闭')
      return
    }
    
    // 获取栈顶弹窗状态
    const topModal = modalStack.value.pop()!
    console.log('[FullscreenModal] 即将关闭的弹窗:', topModal)
    
    // 先保存并清空 onClose，避免递归调用
    const onClose = topModal.onClose
    topModal.onClose = undefined
    topModal.visible = false
    topModal.title = ''
    
    // 最后执行回调
    onClose?.()
    console.log('[FullscreenModal] close 后栈长度:', modalStack.value.length)
  }
  
  // 强制重置状态（用于应用启动时或清理所有弹窗）
  const reset = () => {
    console.log('[FullscreenModal] 重置状态，当前栈长度:', modalStack.value.length)
    // 执行所有待关闭的回调
    while (modalStack.value.length > 0) {
      const modal = modalStack.value.pop()!
      modal.onClose?.()
    }
    console.log('[FullscreenModal] 重置后栈长度:', modalStack.value.length)
  }

  return {
    isVisible,
    title,
    open,
    close,
    reset
  }
}