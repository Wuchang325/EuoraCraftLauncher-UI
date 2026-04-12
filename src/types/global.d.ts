// 全局类型声明
interface Window {
  pywebview?: {
    api: {
      minimize_window: () => Promise<any>
      close_window: () => Promise<any>
      get_user_agreement_status: () => Promise<any>
      save_user_agreement: () => Promise<any>
      clear_user_agreement: () => Promise<any>
      // 可以添加更多API方法
      [key: string]: any
    }
  }
}

export {}