# EuoraCraft-Launcher Frontend

EuoraCraft-Launcher 的前端部分，使用 Vue 3、TypeScript 和 Naive UI 构建的现代化用户界面。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供静态类型检查
- **Naive UI** - Vue 3 组件库
- **Vite** - 下一代前端构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Vue Router** - Vue.js 官方路由管理器
- **vue-i18n** - Vue.js 国际化插件
- **GSAP** - GreenSock 动画平台

## 项目结构

```
src/
├── components/          # 可复用的 UI 组件
│   ├── bits/           # 小型功能组件
│   ├── layout/         # 布局组件
│   ├── modals/         # 弹窗组件
│   └── ui/             # 基础 UI 组件
├── composables/        # Vue 组合式 API 函数
├── i18n/              # 国际化配置
├── router/            # 路由配置
├── style/             # 样式文件
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
├── views/             # 页面视图组件
├── App.vue            # 根组件
└── main.ts            # 应用入口
```

## 功能特性

- **响应式设计** - 适配不同屏幕尺寸
- **国际化支持** - 支持中文和英文
- **深色/浅色主题** - 自动检测系统偏好
- **动画效果** - 使用 GSAP 创建流畅过渡
- **全屏弹窗** - 支持全屏和普通弹窗模式
- **模块化架构** - 组件和组合式函数分离

## 开发环境要求

- Node.js >= 20.0.0
- pnpm

## 安装与运行


1. 安装依赖

```bash
pnpm install
```

2. 启动开发服务器

```bash
pnpm run dev
```

3. 构建生产版本

```bash
npm run build
```

## 构建配置

前端使用 Vite 进行构建，具有以下特点：

- **快速冷启动** - 利用 ES 模块实现即时服务启动
- **按需编译** - 仅在请求时编译文件
- **热模块替换** - 保存时 即时更新，无需刷新页面
- **代码分割** - 自动分割代码，优化加载性能

## 与后端集成

前端通过 PyWebview 与后端进行通信，利用 `window.pywebview.api` 接口调用后端功能。项目设计为与 EuoraCraft-Launcher 后端紧密集成，提供了完整的 Minecraft 启动器体验。

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

GPL-3.0