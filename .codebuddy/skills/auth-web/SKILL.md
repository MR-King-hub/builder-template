---
name: auth-web-cloudbase
description: CloudBase Auth v2 Web SDK (@cloudbase/js-sdk@2.x) 完整指南 - 包含所有登录流程、用户管理、验证码处理和最佳实践。
alwaysApply: false
---

## 何时使用此 Skill

在 CloudBase 项目中进行**前端 Web 认证**时使用此 skill，基于**新版认证系统 (Auth v2)** 和 `@cloudbase/js-sdk@2.x`。

适用场景：

- 在浏览器应用中设计和实现登录/注册流程
- 将 CloudBase 身份（`uid`、tokens）与自有后端集成
- 在前端管理会话和用户资料

**默认登录方式：** 如未特别指定，默认使用**手机号 + 短信验证码（免密登录）**。

**不适用于：**

- 服务端认证（Node SDK）
- 直接 HTTP API 调用（请使用 **CloudBase HTTP Auth** skill，位于 `skills/auth-http-api-skill`）
- 数据库或存储操作（请使用数据库/存储相关 skill）



cloudbaes/js-sdk 进行了 supabase-js 兼容重构，auth & storage & rdb（一个 mysql 数据库） 模块对齐 supabase-js 的api，使用时遵照 supabase-js 的方式使用。

** 直接使用 supabase-js 标准 API 操作 auth & storage & rdb 模块。下方具体说明了兼容差异，此外按照 supabase 官方方式进行使用。**

## 初始化

可以使用类似 supabase-js 的方式，使用 accesskey 初始化

```js
const app = cloudbase.init({
  env: "your-env-id", // 替换为您的环境id
  accessKey: "Publishable Key", // 填入生成的 Publishable Key
});
```

## Auth

cloudbase.auth == supabase.auth，可以使用类似 cloudbase.auth.getSession() 的方式调用 API

### signUp

注册新用户，发送验证码后通过 `verifyOtp` 回调完成注册。

```typescript
// 1. 发送验证码
const { data, error } = await auth.signUp({
  email: "user@example.com",
  password: "password123",
})

// 2. 验证码验证完成注册
const { data: result, error: verifyError } = await data.verifyOtp({ token: "123456" })
```

### signInWithOtp

OTP 验证码登录，发送验证码后通过 `verifyOtp` 回调完成登录。

```typescript
// 1. 发送验证码
const { data, error } = await auth.signInWithOtp({
  phone: "13800138000",
})

// 2. 验证码验证完成登录
const { data: result, error: verifyError } = await data.verifyOtp({ token: "123456" })
```

### updateUser

更新用户信息。更新邮箱/手机号时需要验证码验证，更新其他字段直接生效。

**更新基本信息（无需验证码）：**
```typescript
const { data, error } = await auth.updateUser({
  nickname: "新昵称",
  avatar_url: "https://example.com/avatar.jpg",
})
```

**更新邮箱/手机号（需要验证码）：**
```typescript
// 1. 发起更新，发送验证码到新邮箱/手机
const { data, error } = await auth.updateUser({
  email: "newemail@example.com",
})

// 2. 验证码验证完成更新
const { data: result, error: verifyError } = await data.verifyOtp({
  email: "newemail@example.com",
  token: "123456",
})
```

**更新密码（需要通过 reauthenticate）：**
```typescript
// 1. 重新认证，发送验证码
const { data, error } = await auth.reauthenticate()

// 2. 验证码 + 新密码完成修改
const { data: result, error: updateError } = await data.updateUser({
  nonce: "123456",
  password: "newPassword123",
})
```

## Storage

cloudbase.storage.from() == supabase.storage.from('xxx')，可以使用 cloudbase.storage.from().update(xxxx) 进行上传操作，其余 api 类似。

cloudbase api 与 supapase-js 存在如下差异：
1. 读取文件时，使用 fileid 作为查询标识，而非使用 path。
2. 不支持 list 的 api。
3. cloudbase 只支持单桶，并且桶权限默认为私有读写权限。
4. RLS 的部分需要需要设置存储桶安全规则

## RDB

cloudbase.rdb() 对齐 supabase 关系型数据库 API，注意：
1. 当写入日期时间类型数据时，格式为 TIMESTAMP，写入数据时需要满足 'YYYY-MM-DD HH:MM:SS'
2. IMPORTANT: 不支持使用 ilike，使用 like 代替