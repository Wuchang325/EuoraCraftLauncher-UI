import { ref, nextTick } from 'vue'
import gsap from 'gsap'

// 淡入动画
export function useFadeIn(
  elementRef: any, 
  options: { delay?: number; y?: number; duration?: number } = {}
) {
  const { delay = 0, y = 20, duration = 0.4 } = options
  
  const animate = () => {
    if (!elementRef.value) return
    
    gsap.fromTo(elementRef.value,
      { opacity: 0, y },
      { 
        opacity: 1, 
        y: 0, 
        duration, 
        delay,
        ease: 'power2.out' 
      }
    )
  }

  return { animate }
}

// 列表交错动画
export function useStagger(
  containerRef: any, 
  itemSelector: string = '> *',
  options: { delay?: number; stagger?: number } = {}
) {
  const { delay = 0.1, stagger = 0.05 } = options
  
  const animate = async () => {
    await nextTick()
    const container = containerRef.value?.$el || containerRef.value
    if (!container) return
    
    const items = container.querySelectorAll(itemSelector)
    if (items.length === 0) return

    gsap.fromTo(items,
      { opacity: 0, y: 15 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.3, 
        stagger,
        delay,
        ease: 'power2.out' 
      }
    )
  }

  return { animate }
}

// 页面过渡
export function usePageTransition() {
  const beforeEnter = (el: Element) => {
    gsap.set(el, { opacity: 0, y: 10 })
  }
  
  const enter = (el: Element, done: () => void) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.25,
      ease: 'power2.out',
      onComplete: done
    })
  }
  
  const leave = (el: Element, done: () => void) => {
    gsap.to(el, {
      opacity: 0,
      y: -10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: done
    })
  }

  return { beforeEnter, enter, leave }
}

// 按钮点击反馈
export function useButtonFeedback() {
  const onClick = (event: MouseEvent) => {
    const btn = event.currentTarget as HTMLElement
    gsap.to(btn, {
      scale: 0.97,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out'
    })
  }
  
  return { onClick }
}