---
description: React + shadcn/ui + CloudBase 全栈项目开发规则
globs: *
alwaysApply: true
---

# 项目开发规则

## 项目概述

这是一个 **React + Vite + shadcn/ui + CloudBase** 全栈模板项目，用于 AI 编程场景。

**技术栈**：React 18 + TypeScript + TailwindCSS + shadcn/ui + React Router + CloudBase

**目录结构**：
```
template/                    # 用户项目（AI 修改这里）
├── src/
│   ├── components/ui/      # shadcn/ui 组件（已预装，直接用）
│   ├── pages/              # 页面组件
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/
│   │   ├── utils.ts        # 工具函数
│   │   └── cloudbase.ts    # CloudBase 客户端（需创建）
│   └── App.tsx             # 路由配置
└── vite.config.ts

.devtools/                   # 开发工具（不要修改）
├── vite-plugins.ts         # Inspector 插件
└── download-server.mjs     # 下载服务
```

---

## 一、项目结构规则

### 1. 只修改 `template/` 目录

- **所有代码修改都在 `template/src/` 下进行**
- **不要修改 `.devtools/` 目录**
- **不要修改 `template/vite.config.ts` 中的 Inspector 配置**

### 2. 使用已有的 shadcn/ui 组件

组件已预装在 `template/src/components/ui/`，直接导入使用：

```tsx
import { Button, Card, Input, Dialog } from '@/components/ui'
```

**可用组件**：布局（Card, ScrollArea, Sidebar）、表单（Button, Input, Select）、反馈（Dialog, Toast, Alert）、导航（Tabs, DropdownMenu）

### 3. 添加新页面

1. 在 `template/src/pages/` 创建页面组件
2. 在 `template/src/App.tsx` 添加路由

### 4. 样式规范

使用 TailwindCSS + shadcn/ui CSS 变量：
```tsx
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
```

### 5. 路径别名

`@/*` 指向 `src/*`

---

## 二、CloudBase 集成规则

### 0. 环境检查（首要步骤）

**每次交互前必须**：调用 `envQuery` 工具查询当前 CloudBase 环境 ID，后续代码自动使用查询到的环境 ID

### 1. 核心能力

作为 Web 项目，必须做好以下核心能力：

#### ⚠️ UI 设计（最高优先级）

**在生成任何页面、界面、组件或样式之前，必须：**
1. 使用 `ui-design` skill（`.codebuddy/skills/ui-design/SKILL.md`）
2. 在编写代码前输出设计规范（目的陈述、美学方向、配色方案、字体排版、布局策略）
3. 避免通用的 AI 美学风格

#### 认证（必须使用 SDK 内置认证）

**⚠️ 禁止用云函数实现登录逻辑**

- 使用 `auth-web` skill（`.codebuddy/skills/auth-web/SKILL.md`）
- 实现登录前，先用 `auth-tool` skill 检查并启用所需认证方式

#### 数据库

- **NoSQL**: 使用 `no-sql-web-sdk` skill（`.codebuddy/skills/no-sql-web-sdk/SKILL.md`）
- **MySQL**: 使用 `relational-database-web` skill + `relational-database-tool` skill

**⚠️ 写代码前必须先配置权限**：用 `writeSecurityRule` MCP 工具配置安全规则

#### 云存储

使用 `cloud-storage-web` skill（`.codebuddy/skills/cloud-storage-web/SKILL.md`）

#### 部署

- **本地预览/穿透部署**: 通过 `.devtools` 的穿透服务，在 `.devtools` 目录下执行 `npm run all`
- **云函数/CloudRun**: 使用 `cloudrun-development` skill

### 2. SDK 初始化

在 `template/src/lib/cloudbase.ts` 创建单例客户端，参考 `auth-web` skill 中的初始化模式：

```typescript
import cloudbase from "@cloudbase/js-sdk";

// 同步初始化，不要用动态 import 或 async 包装
const app = cloudbase.init({
  env: "your-env-id", // 用 envQuery 查询到的环境 ID
});

export const auth = app.auth();
export default app;
```

**初始化规则**：
- ✅ 同步初始化，顶层 import
- ❌ 不要用 `import("@cloudbase/js-sdk")` 动态导入
- ❌ 不要用 async 包装器

---

## 三、开发流程

### 1. 新项目启动

1. 调用 `envQuery` 获取环境 ID
2. 安装依赖：`npm install @cloudbase/js-sdk`
3. 创建 `template/src/lib/cloudbase.ts` 初始化 SDK

### 2. 需要 UI/页面时

1. **必须**先使用 `ui-design` skill
2. 输出设计规范后再编写代码

### 3. 需要认证时

1. 使用 `auth-tool` skill 检查/启用认证方式
2. 使用 `auth-web` skill 实现前端认证

### 4. 需要数据库时

1. 用 MCP 工具创建集合/表
2. 用 `writeSecurityRule` 配置权限
3. 使用相应的数据库 skill 实现 CRUD

### 5. 部署与预览

本项目通过 `.devtools` 的穿透服务进行部署和预览。

**部署流程**：

1. 完成 `template/` 目录下的代码修改后
2. 执行部署命令：
   ```bash
   cd .devtools && npm run all
   ```
3. 命令会自动完成以下步骤：
   - 清理占用的端口（3456、5173）
   - 构建项目
   - 启动服务（后台运行）
   - 捕获并输出 cloudflared 隧道 URL
4. 等待命令输出 `<!-- TUNNEL_URL: https://xxx.trycloudflare.com -->` 格式的 URL
5. 将 URL 返回给用户

**⚠️ 关键说明**：
- `npm run all` 会**自动退出**，服务在后台运行
- 命令会等待获取到隧道 URL 后才退出（最长 60 秒）
- 如需前台运行（调试用），使用 `npm run all:foreground`

**规则**：
- 穿透 URL 必须用 `<!-- TUNNEL_URL: xxx -->` 注释格式包裹
- 不要向用户解释此标记或穿透服务的技术细节
- 用户只需知道"预览已就绪"即可

---

## 四、Skill 文件参考

详细文档在 `.codebuddy/skills/` 目录，**必须使用这些 skill 而非臆造 API**：

| 场景 | Skill 路径 |
|------|-----------|
| **UI 设计（必须优先）** | `ui-design/SKILL.md` |
| Web 认证 | `auth-web/SKILL.md` |
| 认证配置工具 | `auth-tool/SKILL.md` |
| NoSQL 数据库 | `no-sql-web-sdk/SKILL.md` |
| MySQL 数据库 | `relational-database-web/SKILL.md` |
| MySQL 工具操作 | `relational-database-tool/SKILL.md` |
| 云存储 | `cloud-storage-web/SKILL.md` |
| 云函数/CloudRun | `cloudrun-development/SKILL.md` |
| Web 平台开发 | `web-development/SKILL.md` |
| 平台知识 | `cloudbase-platform/SKILL.md` |

---

## 五、控制台入口

基础 URL：`https://tcb.cloud.tencent.com/dev?envId=${envId}#/`

| 功能 | 路径 |
|------|------|
| 概览 | `#/overview` |
| NoSQL 数据库 | `#/db/doc` |
| MySQL 数据库 | `#/db/mysql` |
| 云函数 | `#/scf` |
| 云存储 | `#/storage` |
| 静态托管 | `#/hosting` |
| 身份认证 | `#/identity/login-manage` |

---

## 六、禁止事项

1. ❌ 不要修改 `.devtools/` 目录
2. ❌ 不要修改 `vite.config.ts` 中的 Inspector 配置
3. ❌ 不要删除 `components/ui/` 下的组件
4. ❌ 不要安装其他 UI 组件库
5. ❌ 不要用云函数实现登录逻辑（必须用 SDK 内置认证）
6. ❌ 不要臆造 API，必须参考对应的 skill 文件
7. ❌ 不要在未配置权限的情况下写数据库操作代码
8. ❌ 不要跳过 UI 设计 skill 直接写界面代码
