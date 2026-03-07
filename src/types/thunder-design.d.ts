// src/types/thunder-design.d.ts
// 第三方库类型声明

declare module 'thunder-design' {
  // 基础声明（允许任何类型）
  const content: any
  export default content
  
  // 如果有具名导出
  export const Button: any
  export const Input: any
}

declare module 'vue-devui' {
  import type { App } from 'vue'
  const DevUI: {
    install: (app: App) => void
  }
  export default DevUI
}

// ========== pywebview API类型定义 ==========

export interface PyWebViewAPI {
  // 测试连接
  ping(): Promise<any>
  
  // 窗口控制
  minimize_window(): Promise<any>
  close_window(): Promise<any>
  
  // 背景图配置
  get_background_config(): Promise<any>
  get_background_image(): Promise<any>
  update_background_config(config: any): Promise<any>
  update_background_image(image_type: string, image_path: string): Promise<any>
  load_image_from_url(url: string): Promise<any>
  load_image_from_local(file_path: string): Promise<any>
  select_local_image(): Promise<any>
  
  // 游戏配置
  get_game_config(): Promise<any>
  update_game_config(game_config: any): Promise<any>
  
  // 主题配置
  get_theme_config(): Promise<any>
  update_theme_config(theme_config: any): Promise<any>
  
  // 下载配置
  get_download_config(): Promise<any>
  update_download_config(download_config: any): Promise<any>
  
  // 文件选择
  select_directory(): Promise<any>
  
  // 版本管理（新增）
  get_minecraft_versions?(filter?: any): Promise<any>
  get_version_details?(versionId: string): Promise<any>
  install_version?(versionId: string, options?: any): Promise<any>
  uninstall_version?(versionId: string): Promise<any>
  check_version_update?(versionId: string): Promise<any>
  
  // 实例管理（新增）
  get_game_instances?(): Promise<any>
  get_instance_details?(instanceId: string): Promise<any>
  create_instance?(request: any): Promise<any>
  update_instance?(instanceId: string, updates: any): Promise<any>
  delete_instance?(instanceId: string): Promise<any>
  launch_instance?(instanceId: string): Promise<any>
  
  // 模组管理（新增）
  get_instance_mods?(instanceId: string): Promise<any>
  search_mods?(filter: any): Promise<any>
  install_mod?(instanceId: string, modId: string): Promise<any>
  uninstall_mod?(instanceId: string, modId: string): Promise<any>
  toggle_mod?(instanceId: string, modId: string, enabled: boolean): Promise<any>
  
  // 下载管理（新增）
  get_download_tasks?(): Promise<any>
  get_download_task?(taskId: string): Promise<any>
  pause_download_task?(taskId: string): Promise<any>
  resume_download_task?(taskId: string): Promise<any>
  cancel_download_task?(taskId: string): Promise<any>
  
  // 窗口位置（新增）
  get_window_position?(): Promise<any>
  set_window_position?(position: any): Promise<any>
  
  // 文件选择（新增）
  select_file?(filters?: any[]): Promise<any>
  
  // Java管理（新增）
  get_java_list?(): Promise<any>
  
  // 诊断工具（新增）
  diagnose_api?(): Promise<any>
}

declare global {
  interface Window {
    pywebview?: {
      api: PyWebViewAPI
    }
  }
}

export {}