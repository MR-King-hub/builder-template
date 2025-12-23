# Vite + React + TypeScript + shadcn/ui 项目

## 技术栈

- **Vite** - 构建工具
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **TailwindCSS** - 样式框架
- **shadcn/ui** - UI 组件库
- **React Router** - 路由管理

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
src/
├── components/
│   └── ui/              # shadcn/ui 组件
├── hooks/               # 自定义 Hooks
├── lib/
│   └── utils.ts         # 工具函数 (cn)
├── pages/               # 页面组件
├── assets/              # 静态资源
├── App.tsx              # 根组件 (路由配置)
├── main.tsx             # 入口文件
└── index.css            # 全局样式 + Tailwind
```

## 路径别名

项目配置了 `@/*` 别名指向 `src/*`：

```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

## 已安装的 shadcn/ui 组件

所有组件位于 `src/components/ui/` 目录，支持两种导入方式：

```tsx
// 方式1: 从 index 统一导入
import { Button, Card, Input } from '@/components/ui'

// 方式2: 从单独文件导入
import { Button } from '@/components/ui/button'
```

**可用组件列表：**

| 类别 | 组件 |
|------|------|
| 布局 | `aspect-ratio`, `card`, `resizable`, `scroll-area`, `separator`, `sidebar` |
| 表单 | `button`, `checkbox`, `form`, `input`, `input-otp`, `label`, `radio-group`, `select`, `slider`, `switch`, `textarea` |
| 数据展示 | `avatar`, `badge`, `calendar`, `card-stack`, `carousel`, `chart`, `progress`, `skeleton`, `table` |
| 反馈 | `alert`, `alert-dialog`, `dialog`, `drawer`, `sheet`, `sonner`, `toast`, `toaster`, `tooltip` |
| 导航 | `breadcrumb`, `command`, `context-menu`, `dropdown-menu`, `menubar`, `navigation-menu`, `pagination`, `tabs` |
| 其他 | `accordion`, `collapsible`, `date-picker`, `hover-card`, `popover`, `toggle`, `toggle-group` |

**Hooks：**
- `useToast` - Toast 通知
- `useIsMobile` - 移动端检测

## 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}
```

## 使用组件示例

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>标题</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="请输入..." />
        <Button>提交</Button>
      </CardContent>
    </Card>
  )
}
```
