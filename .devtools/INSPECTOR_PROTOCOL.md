# Dev Inspector 通讯协议

元素检查器 (Dev Inspector) 通过 `postMessage` 实现父页面与 iframe 之间的双向通讯。

## 概述

```
┌─────────────────────┐                    ┌─────────────────────┐
│   父页面 (外部)      │                    │   iframe (预览)      │
│                     │  ── 命令 ──────▶  │                     │
│   - 控制面板        │                    │   - Inspector 脚本   │
│   - 样式编辑器      │  ◀────── 事件 ──   │   - 元素选择高亮     │
│                     │                    │                     │
└─────────────────────┘                    └─────────────────────┘
```

---

## 命令 (父页面 → iframe)

父页面通过 `postMessage` 发送命令到 iframe：

```javascript
iframe.contentWindow.postMessage({
  type: 'DEV_INSPECTOR_COMMAND',
  command: 'xxx',
  ...params
}, '*');
```

### 可用命令

| 命令 | 参数 | 说明 |
|------|------|------|
| `toggle` | 无 | 切换检查器开关 |
| `enable` | 无 | 开启检查器 |
| `disable` | 无 | 关闭检查器 |
| `selectByPath` | `sourceId: string` | 通过源码位置选中元素 |
| `updateClassName` | `className: string` | 更新选中元素的 className |
| `updateStyle` | `style: string` | 更新选中元素的 inline style |
| `resetStyle` | `originalClassName?: string, originalStyle?: string` | 重置样式到原始状态 |

### 命令示例

```javascript
// 开启/关闭检查器
sendCommand('toggle');

// 导航到指定元素
sendCommand('selectByPath', { 
  sourceId: 'src/pages/HomePage.tsx:42:8' 
});

// 更新 className
sendCommand('updateClassName', { 
  className: 'flex items-center gap-4 p-4 bg-blue-500' 
});

// 更新 inline style
sendCommand('updateStyle', { 
  style: 'color: red; font-size: 16px;' 
});

// 重置样式
sendCommand('resetStyle', { 
  originalClassName: 'flex p-4',
  originalStyle: '' 
});
```

---

## 事件 (iframe → 父页面)

iframe 通过 `postMessage` 向父页面发送事件：

```javascript
// 父页面监听
window.addEventListener('message', (e) => {
  if (e.data?.type === 'DEV_INSPECTOR_EVENT') {
    console.log(e.data.action, e.data);
  }
});
```

### 事件类型

| 事件 | 触发时机 | 数据 |
|------|----------|------|
| `ready` | 页面加载完成 | `{ timestamp }` |
| `status` | 检查器状态变化 | `{ enabled: boolean }` |
| `select` | 用户点击选中元素 | `{ element, family, style }` |
| `navigate` | 通过命令导航到元素 | `{ element, family, style }` |
| `styleUpdated` | 样式更新成功 | `{ type, value, style }` |
| `styleReset` | 样式重置成功 | `{ style }` |

### 数据结构

#### element (元素信息)
```typescript
{
  sourceId: string;       // 源码位置标识 "file:line:col"
  tagName: string;        // 标签名
  id: string;             // 元素 ID
  classList: string[];    // class 列表
  textContent: string;    // 文本内容（截断）
  source: {
    file: string;         // 源文件路径
    line: number;         // 行号
    column: number;       // 列号
  } | null;
}
```

#### family (家族信息)
```typescript
{
  parents: Array<{ sourceId: string; label: string }>;   // 父元素链（最多3个）
  children: Array<{ sourceId: string; label: string }>;  // 子元素（最多5个）
  siblings: Array<{ sourceId: string; label: string }>;  // 兄弟元素（最多4个）
}
```

#### style (样式信息)
```typescript
{
  className: string;      // 当前 className
  inlineStyle: string;    // 当前 inline style 字符串
  styles: Array<{         // 解析后的 inline styles
    prop: string;
    value: string;
  }>;
  computed: {             // 常用计算样式
    width: string;
    height: string;
    padding: string;
    margin: string;
    backgroundColor: string;
    color: string;
    fontSize: string;
    display: string;
    position: string;
  };
}
```

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Alt + Shift + I` | 切换检查器开关 |
| `Esc` | 关闭检查器 |

---

## 使用流程

1. **开启检查器**: 发送 `toggle` 或 `enable` 命令
2. **选中元素**: 用户在 iframe 中点击，收到 `select` 事件
3. **编辑样式**: 发送 `updateClassName` 或 `updateStyle` 命令
4. **收到反馈**: 监听 `styleUpdated` 事件确认更新成功
5. **重置样式**: 发送 `resetStyle` 命令恢复原始状态

