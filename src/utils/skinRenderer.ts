/**
 * Minecraft 皮肤头像渲染器
 * 参考 MCCAG 原理，裁剪仅头部（带帽子层）
 */

export interface SkinRenderOptions {
  size?: number
  showHat?: boolean
  defaultSkin?: string
}

// 皮肤坐标定义
const SKIN_COORDS = {
  head: { x: 8, y: 8, w: 8, h: 8 },
  hat: { x: 40, y: 8, w: 8, h: 8 },
}

/**
 * 从 UUID 获取头像 URL (Crafatar)
 */
export function getAvatarUrlByUuid(
  uuid: string | undefined,
  options: SkinRenderOptions = {}
): string {
  // 所有账户统一使用 Crafatar 3D 头部渲染（无背景、无留白）
  const cleanUuid = uuid?.replace(/-/g, '') || '8667ba71b85a4004af54457a9734eed7'
  // scale=4 提供高清渲染，renders/head 是 3D 头部渲染，没有边距
  return `https://crafatar.com/renders/head/${cleanUuid}?scale=4&overlay=true&default=Steve`
}

/**
 * 从用户名获取 MCCAG 风格头像（使用 Crafatar 3D 渲染）
 * 通过获取 UUID 后使用渲染端点获取无背景头部
 */
export function getMCCAGAvatarUrl(
  username: string | undefined,
  options: { type?: 'head' | 'half' | 'full' } = {}
): string {
  // 使用 Crafatar render 端点直接渲染头部（无背景）
  // 这种渲染方式会紧密裁剪头部，没有多余边距
  const name = username || 'Steve'
  return `https://crafatar.com/renders/head/${name}?scale=4&overlay=true&default=Steve`
}

/**
 * 裁剪皮肤图片生成透明头像（Canvas）
 * @param skinImage - 皮肤图片对象
 * @param options - 渲染选项
 * @returns Canvas 元素
 */
export function renderSkinAvatar(
  skinImage: HTMLImageElement,
  options: SkinRenderOptions = {}
): HTMLCanvasElement {
  const { size = 64, showHat = true } = options
  
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  
  const ctx = canvas.getContext('2d')!
  
  // 关键：关闭平滑，保持像素清晰
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, size, size)
  
  // 检测是否为高清皮肤
  const isHdSkin = skinImage.width >= 128
  const scale = isHdSkin ? 2 : 1
  
  const { head, hat } = SKIN_COORDS
  
  // 绘制头部层
  ctx.drawImage(
    skinImage,
    head.x * scale, head.y * scale, head.w * scale, head.h * scale,
    0, 0, size, size
  )
  
  // 绘制帽子层（覆盖在头部上）
  if (showHat) {
    ctx.drawImage(
      skinImage,
      hat.x * scale, hat.y * scale, hat.w * scale, hat.h * scale,
      0, 0, size, size
    )
  }
  
  return canvas
}

/**
 * 将 Canvas 转换为 Data URL
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  type: string = 'image/png'
): string {
  return canvas.toDataURL(type)
}

/**
 * 下载 Canvas 为图片文件
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string = 'avatar.png'
): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

/**
 * 加载皮肤图片
 */
export function loadSkinImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
