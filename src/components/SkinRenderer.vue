<template>
  <div class="skin-container" :style="containerStyle">
    <canvas 
      ref="backCanvas" 
      class="skin-layer back" 
      :width="size" 
      :height="size" 
    />
    <canvas 
      v-if="showHair" 
      ref="foreCanvas" 
      class="skin-layer fore" 
      :width="size" 
      :height="size" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/utils/api'

interface Props {
  src?: string          // 皮肤图片 URL (向后兼容)
  uuid?: string         // 玩家 UUID (推荐使用)
  typeName?: string     // 皮肤服务器类型: Mojang, Nide, Auth
  customServer?: string // 自定义服务器地址
  size?: number         // 输出尺寸（默认 64）
  scale?: number        // 强制缩放（可选，默认自动计算）
}

const props = withDefaults(defineProps<Props>(), {
  typeName: 'Mojang',
  size: 64
})

const backCanvas = ref<HTMLCanvasElement>()
const foreCanvas = ref<HTMLCanvasElement>()
const showHair = ref(false)
const detectedScale = ref(1)

const avatarCache = new Map<string, HTMLImageElement>()

interface AvatarCacheEntry {
  image: HTMLImageElement
  timestamp: number
}

const avatarCacheWithTimestamp = new Map<string, AvatarCacheEntry>()
const CACHE_TTL = 30 * 60 * 1000 // 30分钟缓存过期时间

import type { CSSProperties } from 'vue'

const containerStyle = computed<CSSProperties>(() => ({ 
  width: `${props.size}px`, 
  height: `${props.size}px`, 
  position: 'relative' 
}))

// 通过后端获取玩家头像
  async function loadAvatarFromBackend(): Promise<HTMLImageElement | null> {
    if (!props.uuid) return null

    const cacheKey = `${props.uuid}-${props.typeName}-${props.customServer || ''}-${props.size}`
    
    const cached = avatarCacheWithTimestamp.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.image
    }

    // 将前端的 account.type 映射为后端期望的 typeName
    const backendTypeName = props.typeName.toLowerCase() === 'microsoft' ? 'Mojang' : props.typeName
    
    // 判断是否为离线用户，离线用户直接使用默认皮肤
    const useDefaultSkin = backendTypeName.toLowerCase() === 'offline'
    
    const result = await api.getAvatarDataUrl(props.uuid, backendTypeName, props.customServer, props.size, useDefaultSkin)
    if (!result.success || !result.data?.dataUrl) {
      return null
    }

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      avatarCacheWithTimestamp.set(cacheKey, {
        image: img,
        timestamp: Date.now()
      })
      resolve(img)
    }
    img.onerror = () => resolve(null)
    img.src = result.data?.dataUrl || ''
  })
}

// 加载图片并解析 
async function loadSkin(): Promise<HTMLImageElement | null> { 
  if (!props.src) return null 
  
  return new Promise((resolve) => { 
    const img = new Image() 
    img.crossOrigin = 'anonymous' 
    img.onload = () => resolve(img) 
    img.onerror = () => resolve(null)  // 直接返回 null，不在这里调用代理
    img.src = props.src || '' 
  }) 
}

// 获取像素颜色 
function getPixel( 
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number 
): { r: number, g: number, b: number, a: number } { 
  const data = ctx.getImageData(x, y, 1, 1).data 
  return { r: data[0], g: data[1], b: data[2], a: data[3] } 
}

// 颜色比较 
function colorEqual( 
  c1: { r: number, g: number, b: number, a: number }, 
  c2: { r: number, g: number, b: number, a: number } 
): boolean { 
  return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a 
}

// 检测是否应该显示头发层 
function shouldShowHair( 
  ctx: CanvasRenderingContext2D, 
  scale: number, 
  width: number, 
  height: number 
): boolean { 
  // 必须有足够尺寸容纳头发层区域 
  if (width < 64 || height < 32) return false 

  const headColor = getPixel(ctx, scale * 41, scale * 9) 

  // 检查三个角落像素 
  const corner1 = getPixel(ctx, 1, 1) 
  const corner2 = getPixel(ctx, width - 1, height - 1) 
  const corner3 = getPixel(ctx, width - 2, Math.floor(height / 2) - 2) 

  // 条件1：任何角落透明 
  const hasTransparent = corner1.a === 0 || corner2.a === 0 || corner3.a === 0 
  if (hasTransparent) return true 

  // 条件2：头部颜色与所有角落都不同（说明是双层皮肤） 
  const allCornersDifferent = 
    !colorEqual(corner1, headColor) && 
    !colorEqual(corner2, headColor) && 
    !colorEqual(corner3, headColor) 

  return allCornersDifferent 
}

// 裁剪并绘制区域到目标 canvas 
function clipAndDraw( 
  sourceCtx: CanvasRenderingContext2D, 
  targetCanvas: HTMLCanvasElement, 
  sx: number, sy: number, sw: number, sh: number 
) { 
  const targetCtx = targetCanvas.getContext('2d')! 
  // pixelData 变量未使用，移除声明
  sourceCtx.getImageData(sx, sy, sw, sh) 
  
  // 禁用平滑，保持像素风 
  targetCtx.imageSmoothingEnabled = false 
  targetCtx.clearRect(0, 0, props.size, props.size) 
  targetCtx.drawImage( 
    sourceCtx.canvas, 
    sx, sy, sw, sh, 
    0, 0, props.size, props.size 
  ) 
}

async function render() {
  let img: HTMLImageElement | null = null

  // 使用后端头像处理（后端已统一处理离线玩家和默认皮肤）
  if (props.uuid) {
    img = await loadAvatarFromBackend()
  }

  // 如果没有UUID，尝试传统方式（向后兼容）
  if (!img && props.src) {
    img = await loadSkin()
  }

  if (!img) {
    clearCanvases()
    return
  }

  // 创建临时 canvas 读取原始像素 
  const tempCanvas = document.createElement('canvas') 
  tempCanvas.width = img.width 
  tempCanvas.height = img.height 
  const tempCtx = tempCanvas.getContext('2d')! 

  async function renderImage(image: HTMLImageElement) {
    // 如果是通过后端头像API获取的图片，直接绘制（已经是处理好的头像）
    if (props.uuid) {
      const targetCtx = backCanvas.value?.getContext('2d')
      if (targetCtx) {
        targetCtx.imageSmoothingEnabled = false
        targetCtx.clearRect(0, 0, props.size, props.size)
        targetCtx.drawImage(image, 0, 0, props.size, props.size)
      }
      showHair.value = false // 后端已处理头发层
      return
    }

    // 传统皮肤处理逻辑
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
    tempCtx.drawImage(image, 0, 0)

    if (image.width < 32 || image.height < 32) {
      clearCanvases()
      throw new Error(`图片大小不足: ${image.width}x${image.height}`)
    }

    detectedScale.value = props.scale ?? (Math.floor(image.width / 64) || 1)
    const s = detectedScale.value

    showHair.value = shouldShowHair(tempCtx, s, image.width, image.height)

    if (backCanvas.value) {
      clipAndDraw(tempCtx, backCanvas.value, s * 8, s * 8, s * 8, s * 8)
    }

    if (showHair.value && foreCanvas.value) {
      clipAndDraw(tempCtx, foreCanvas.value, s * 40, s * 8, s * 8, s * 8)
    }
  }

  try {
    await renderImage(img)
  } catch (error) {
    console.error('[SkinRenderer] 渲染失败', error)
    clearCanvases()
  }
}

function clearCanvases() { 
  [backCanvas, foreCanvas].forEach(ref => { 
    const canvas = ref.value 
    if (!canvas) return 
    const ctx = canvas.getContext('2d')! 
    ctx.clearRect(0, 0, props.size, props.size) 
  }) 
  showHair.value = false 
}

onMounted(() => {
  // 等待API就绪后再渲染
  const checkAndRender = () => {
    if (window.pywebview?.api) {
      render()
    } else {
      // 如果API还没就绪，稍后重试
      setTimeout(checkAndRender, 100)
    }
  }
  checkAndRender()
}) 
watch(() => props.src, () => {
  if (window.pywebview?.api) render()
})
watch(() => props.size, () => {
  if (window.pywebview?.api) render()
})
watch(() => props.uuid, () => {
  if (window.pywebview?.api) render()
})
watch(() => props.typeName, () => {
  if (window.pywebview?.api) render()
}) 
</script>

<style scoped src="@/styles/components/SkinRenderer.css"></style>