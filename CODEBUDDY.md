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
**⚠️ 任何涉及到用户登录的逻辑都必须通过这两个 skill 来实现**

- 使用 `auth-web` skill（`.codebuddy/skills/auth-web/SKILL.md`）
- 实现登录前，先用 `auth-tool` skill 检查并启用所需认证方式（`.codebuddy/skills/auth-tool/SKILL.md`）

#### 数据库

- **NoSQL**: 使用 `no-sql-web-sdk` skill（`.codebuddy/skills/no-sql-web-sdk/SKILL.md`）
- **MySQL**: 使用 `relational-database-web` skill + `relational-database-tool` skill（`.codebuddy/skills/relational-database-web/SKILL.md`）

**⚠️ 写代码前必须先配置权限**：用 `writeSecurityRule` MCP 工具配置安全规则，不要使用自定义安全规则（CUSTOM），该规则太过复杂，容易出错

#### 云存储

使用 `cloud-storage-web` skill（`.codebuddy/skills/cloud-storage-web/SKILL.md`）

#### 部署

- **本地预览/穿透部署**: 通过 `.devtools` 的穿透服务，在 `.devtools` 目录下执行 `npm run all`
- **云函数/CloudRun**: 使用 `cloudrun-development` skill（`.codebuddy/skills/cloudrun-development/SKILL.md`）

### 2. SDK 初始化

在 `template/src/lib/cloudbase.ts` 创建单例客户端，参考 `web-development` skill 中的初始化模式：

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

## 三、需求分析与规划（最重要）

**⚠️ 在编写任何代码之前，必须完成以下分析步骤**

### 1. 需求拆分（必做）

当用户提出一个简单需求时，**必须主动进行详细的需求拆分**：

**分析框架：**
```
用户需求：[原始需求描述]

一、功能模块拆分
1. 核心功能
   - 功能点 1：xxx
   - 功能点 2：xxx
2. 辅助功能
   - 功能点 1：xxx
3. 扩展功能（可选）
   - 功能点 1：xxx

二、页面规划
1. 页面列表
   - 页面 1：xxx（路由：/xxx）
   - 页面 2：xxx（路由：/xxx）
2. 页面间关系和导航流程

三、用户角色分析
1. 角色 1：xxx
   - 可执行操作：xxx
   - 可访问数据：xxx
2. 角色 2：xxx（如有）
```

**示例：**
- 用户说"做一个待办应用" → 需拆分出：任务增删改查、任务状态切换、任务分类/标签、截止日期、优先级、搜索过滤等
- 用户说"做一个记账应用" → 需拆分出：收支记录、分类管理、统计报表、预算设置、多账户等

### 2. 数据模型设计（必做）

根据需求拆分结果，**必须设计完整的数据模型**：

**设计框架：**
```
一、数据集合/表设计
集合名：xxx
├── 字段 1: string (必填) - 说明
├── 字段 2: number (可选) - 说明
├── _openid: string (系统字段) - 创建者 ID
├── createdAt: timestamp - 创建时间
└── updatedAt: timestamp - 更新时间

二、集合间关系
- 集合 A 与集合 B：一对多关系
- 关联方式：xxx

三、索引设计（如需要）
- 索引 1：字段 xxx（用于 xxx 查询）
```

### 3. 权限与登录联合规划（必做）

**⚠️ 权限设计和登录方式必须一起考虑，不能割裂！**

**核心原则：**
- 使用 `accessKey` 初始化时会**自动进行匿名登录**，匿名用户也算"已登录"状态
- 只要涉及"自己的数据"（读或写），就需要区分用户身份 → 需要真实登录
- "读所有数据，不能改"权限不需要区分用户 → 匿名登录即可

**权限分析框架：**
```
集合：xxx
├── 数据是否需要区分用户？
│   ├── 是（每个用户有自己的数据）→ 需要真实登录（手机号/邮箱）
│   │   ├── 数据公开展示 → "读所有数据，改自己数据"
│   │   └── 数据仅自己可见 → "读写自己数据"
│   └── 否（所有用户共享/只读）→ 匿名登录即可
│       └── 只读配置/公告 → "读所有数据，不能改"
```

**安全规则类型：**
| 权限类型 | 读权限 | 写权限 | 需要登录？ | 适用场景 |
|----------|--------|--------|-----------|----------|
| **读所有数据，改自己数据** | 所有数据 | 仅自己的 | ✅ 需要（区分用户） | 公开内容（文章、商品、帖子） |
| **读写自己数据** | 仅自己的 | 仅自己的 | ✅ 需要（区分用户） | 私有数据（用户资料、个人设置、待办） |
| **读所有数据，不能改** | 所有数据 | ❌ 无 | ❌ 不需要 | 配置数据（系统设置、公告） |
| **无权限** | ❌ 无 | ❌ 无 | - | 敏感数据（需服务端处理） |

### 4. 登录方案决策（根据权限推导）

**根据权限规划结果，决定登录方案：**

```
判断流程：
├── 是否有集合需要"区分用户"（读写自己数据）？
│   ├── 否 → 方案 A：仅匿名登录（accessKey 初始化即可）
│   └── 是 → 需要真实登录，继续判断 ↓
│
├── 用户需要在多设备同步数据吗？
│   ├── 是 → 方案 B：手机号/邮箱登录（推荐手机号）
│   └── 否 → 方案 C：可用匿名登录，但数据仅本设备可见
```

**登录方案对照表：**
| 方案 | 登录方式 | 适用场景 | 用户体验 |
|------|----------|----------|----------|
| A | 匿名登录（自动） | 只读数据、不区分用户 | 无感知，直接使用 |
| B | 手机号/邮箱登录 | 私有数据、多设备同步 | 需要验证，数据可迁移 |
| C | 匿名登录 | 私有数据、单设备 | 无感知，换设备数据丢失 |

**⚠️ 避免矛盾配置：**
- ❌ 所有表都用"读写自己数据" + 只提供匿名登录 → 匿名用户无法操作
- ❌ 表只需要只读 + 实现复杂的手机号登录 → 过度设计
- ✅ 私有数据用"读写自己数据" + 手机号登录
- ✅ 公开内容用"读所有数据，改自己数据" + 手机号登录
- ✅ 配置/公告用"读所有数据，不能改" + 匿名登录

### 5. 输出规划文档

**完成以上分析后，必须输出完整的规划文档，并征得用户确认后再开始编码：**

```markdown
## 📋 需求规划文档

### 功能概述
[简要描述应用功能]

### 功能模块
1. xxx
2. xxx

### 页面结构
| 页面 | 路由 | 功能描述 |
|------|------|----------|
| xxx | /xxx | xxx |

### 数据模型
[数据集合设计]

### 权限设计
| 集合 | 安全规则 | 说明 |
|------|----------|------|
| xxx | creator | xxx |

### 登录方案
- 是否需要登录：是/否
- 登录方式：xxx
- 登录时机：xxx

---
以上规划是否符合您的预期？确认后我将开始实现。
```

---

## 四、开发流程

### 1. 新项目启动

1. **完成需求分析与规划**（第三节）
2. 调用 `envQuery` 获取环境 ID
3. 安装依赖：`npm install @cloudbase/js-sdk`
4. 创建 `template/src/lib/cloudbase.ts` 初始化 SDK

### 2. 配置数据库和权限

1. 根据数据模型设计，用 MCP 工具创建集合/表
2. 根据权限规划，用 `writeSecurityRule` 配置每个集合的安全规则
3. **必须在写任何数据库操作代码前完成权限配置**

### 3. 实现登录功能（如需要）

1. 根据登录需求分析结果，使用 `auth-tool` skill 检查/启用认证方式
2. 使用 `auth-web` skill 实现前端认证
3. 在需要的页面添加登录状态检查

### 4. 需要 UI/页面时

1. **必须**先使用 `ui-design` skill
2. 输出设计规范后再编写代码

### 5. 实现业务功能

1. 按功能模块逐个实现
2. 使用相应的数据库 skill 实现 CRUD
3. 确保操作权限与规划一致

### 5. 部署与预览

本项目通过 pm2 + cloudflared 进行部署和预览。

**部署流程**：

1. 完成 `template/` 目录下的代码修改后
2. 执行部署命令：
   ```bash
   cd .devtools && npm run all
   ```
3. 命令会自动完成以下步骤：
   - 启动/重启 pm2 服务（Vite + 下载服务 + 隧道）
   - 等待隧道建立
   - 输出 cloudflared 隧道 URL
4. 等待命令输出 `<!-- TUNNEL_URL: https://xxx.trycloudflare.com -->` 格式的 URL
5. 使用 `<!-- TUNNEL_URL: https://xxx.trycloudflare.com -->` 格式返回 URL

**⚠️ 关键说明**：
- **每次修改代码后都必须重新执行 `cd .devtools && npm run all` 进行部署**
- pm2 服务在后台持续运行，关闭终端不会停止服务
- 重复执行 `npm run all` 会重启服务（不会冲突）
- 重启后隧道 URL 会变化

**其他命令**：
- `npm run status` - 查看服务状态
- `npm run logs` - 查看实时日志
- `npm run stop` - 停止所有服务

**规则**：
- 穿透 URL 必须用 `<!-- TUNNEL_URL: xxx -->` 注释格式包裹
- 不要向用户解释此标记或穿透服务的技术细节
- 用户只需知道"预览已就绪"即可

---

## 五、Skill 文件参考

详细文档在 `.codebuddy/skills/` 目录，**必须使用这些 skill 而非臆造 API**：

| 场景 | Skill 路径 |
|------|-----------|
| **UI 设计（必须优先）** | `.codebuddy/skills/ui-design/SKILL.md` |
| Web 登录与认证 | `.codebuddy/skills/auth-web/SKILL.md` |
| 认证配置工具 | `.codebuddy/skills/auth-tool/SKILL.md` |
| NoSQL 数据库 | `.codebuddy/skills/no-sql-web-sdk/SKILL.md` |
| MySQL 数据库 | `.codebuddy/skills/relational-database-web/SKILL.md` |
| MySQL 工具操作 | `.codebuddy/skills/relational-database-tool/SKILL.md` |
| 云存储 | `.codebuddy/skills/cloud-storage-web/SKILL.md` |
| 云函数/CloudRun | `.codebuddy/skills/cloudrun-development/SKILL.md` |
| Web 平台开发 | `.codebuddy/skills/web-development/SKILL.md` |
| 平台知识 | `.codebuddy/skills/cloudbase-platform/SKILL.md` |

---

## 六、控制台入口

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

## 七、禁止事项

1. ❌ **不要跳过需求分析直接写代码**（必须先完成第三节的需求拆分、数据模型、权限规划）
2. ❌ **不要在未规划权限的情况下创建数据集合**
3. ❌ **不要在未分析登录需求的情况下实现认证功能**
4. ❌ 不要修改 `.devtools/` 目录
5. ❌ 不要修改 `vite.config.ts` 中的 Inspector 配置
6. ❌ 不要删除 `components/ui/` 下的组件
7. ❌ 不要安装其他 UI 组件库
8. ❌ 不要用云函数实现登录逻辑（必须用 SDK 内置认证）
9. ❌ 不要臆造 API，必须参考对应的 skill 文件
10. ❌ 不要在未配置权限的情况下写数据库操作代码
11. ❌ 不要跳过 UI 设计 skill 直接写界面代码
