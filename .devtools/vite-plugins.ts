/**
 * Vite 开发插件集合
 * 
 * 包含：
 * - devInspectorPlugin: 开发模式元素检查器（支持 postMessage 通讯）
 * - babelPluginSourceLocation: Babel 源码位置注入
 * 
 * 通讯协议：
 * 
 * 父页面 → iframe 命令:
 * { type: 'DEV_INSPECTOR_COMMAND', command: 'toggle' | 'selectByPath', path?: string }
 * 
 * iframe → 父页面 事件:
 * { type: 'DEV_INSPECTOR_EVENT', action: 'ready' | 'status' | 'select' | 'navigate', ... }
 */

import type { PluginOption } from 'vite'

// ==================== Dev Inspector Plugin ====================

/**
 * 元素检查器插件配置选项
 */
export interface InspectorPluginOptions {
  /** 是否在生产构建中也启用（默认 false，仅开发模式） */
  enableInBuild?: boolean
}

/**
 * 元素检查器插件
 * - 支持 Alt+Shift+I 快捷键切换
 * - 支持 postMessage 通讯（用于 iframe 嵌入场景）
 * - 点击元素时发送元素信息和源码位置
 * 
 * @param options.enableInBuild - 设为 true 可在生产构建中启用
 */
export function devInspectorPlugin(options?: InspectorPluginOptions): PluginOption {
  const { enableInBuild = false } = options || {}
  
  return {
    name: 'vite-plugin-dev-inspector',
    apply: enableInBuild ? undefined : 'serve',
    transformIndexHtml(html) {
      const inspectorScript = `
<script>
(function() {
  let enabled = false;
  
  // ========== 样式 ==========
  const style = document.createElement('style');
  style.textContent = \`
    /* 选择器激活时的全局光标 */
    body.inspector-active,
    body.inspector-active * {
      cursor: crosshair !important;
    }
    
    /* hover 高亮框样式（青色/蓝绿色） */
    #inspector-hover-box {
      position: fixed;
      pointer-events: none;
      z-index: 999991;
      border: 2px solid #06b6d4;
      background: rgba(6, 182, 212, 0.08);
      transition: all 0.1s ease-out;
    }
    
    /* 选中高亮框样式（腾讯蓝） */
    #inspector-selected-box {
      position: fixed;
      pointer-events: none;
      z-index: 999990;
      border: 2px solid #0052d9;
      background: rgba(0, 82, 217, 0.08);
    }
    
    /* 通用标签样式 */
    .inspector-tag-top {
      position: fixed;
      pointer-events: none;
      z-index: 999992;
      display: flex;
      gap: 4px;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11px;
      transform: translateY(-100%);
      padding-bottom: 4px;
    }
    .inspector-tag-bottom {
      position: fixed;
      pointer-events: none;
      z-index: 999992;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11px;
      padding-top: 4px;
    }
    
    /* hover 标签颜色（青色系） */
    #inspector-hover-tag-top .tag-name {
      background: #06b6d4;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
    }
    #inspector-hover-tag-top .tag-id {
      background: #0891b2;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
    }
    #inspector-hover-tag-top .tag-class {
      background: #14b8a6;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
    }
    #inspector-hover-tag-top .tag-size {
      background: #64748b;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
    }
    #inspector-hover-tag-bottom .file-info {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f8fafc;
      padding: 4px 8px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      gap: 6px;
      border-left: 3px solid #06b6d4;
    }
    #inspector-hover-tag-bottom .file-icon {
      color: #22d3ee;
    }
    #inspector-hover-tag-bottom .file-path {
      color: #94a3b8;
    }
    #inspector-hover-tag-bottom .file-line {
      color: #22d3ee;
      font-weight: 600;
    }
    
    /* 选中标签颜色（腾讯蓝系） */
    #inspector-selected-tag-top .tag-name {
      background: #0052d9;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
    }
    #inspector-selected-tag-top .tag-id {
      background: #0034b5;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
    }
    #inspector-selected-tag-top .tag-class {
      background: #366ef4;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
    }
    #inspector-selected-tag-top .tag-size {
      background: #64748b;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
    }
    #inspector-selected-tag-top .tag-selected {
      background: linear-gradient(135deg, #0052d9 0%, #478cff 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 3px;
      font-weight: 600;
    }
    #inspector-selected-tag-bottom .file-info {
      background: linear-gradient(135deg, #001a57 0%, #0034b5 100%);
      color: #f8fafc;
      padding: 4px 8px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      gap: 6px;
      border-left: 3px solid #0052d9;
    }
    #inspector-selected-tag-bottom .file-icon {
      color: #66a6ff;
    }
    #inspector-selected-tag-bottom .file-path {
      color: #96bbff;
    }
    #inspector-selected-tag-bottom .file-line {
      color: #66a6ff;
      font-weight: 600;
    }

  \`;
  document.head.appendChild(style);

  // 创建 hover 高亮框（青色）
  const hoverBox = document.createElement('div');
  hoverBox.id = 'inspector-hover-box';
  hoverBox.style.display = 'none';
  document.body.appendChild(hoverBox);
  
  // 创建选中高亮框（紫色）
  const selectedBox = document.createElement('div');
  selectedBox.id = 'inspector-selected-box';
  selectedBox.style.display = 'none';
  document.body.appendChild(selectedBox);
  
  // 创建 hover 上方标签
  const hoverTagTop = document.createElement('div');
  hoverTagTop.id = 'inspector-hover-tag-top';
  hoverTagTop.className = 'inspector-tag-top';
  hoverTagTop.style.display = 'none';
  document.body.appendChild(hoverTagTop);
  
  // 创建 hover 下方标签
  const hoverTagBottom = document.createElement('div');
  hoverTagBottom.id = 'inspector-hover-tag-bottom';
  hoverTagBottom.className = 'inspector-tag-bottom';
  hoverTagBottom.style.display = 'none';
  document.body.appendChild(hoverTagBottom);
  
  // 创建选中上方标签
  const selectedTagTop = document.createElement('div');
  selectedTagTop.id = 'inspector-selected-tag-top';
  selectedTagTop.className = 'inspector-tag-top';
  selectedTagTop.style.display = 'none';
  document.body.appendChild(selectedTagTop);
  
  // 创建选中下方标签
  const selectedTagBottom = document.createElement('div');
  selectedTagBottom.id = 'inspector-selected-tag-bottom';
  selectedTagBottom.className = 'inspector-tag-bottom';
  selectedTagBottom.style.display = 'none';
  document.body.appendChild(selectedTagBottom);

  // 当前 hover 和选中的元素
  let hoverEl = null;
  let selectedEl = null;

  // ========== 工具函数 ==========
  
  // 获取元素的源码位置（Babel 注入的 data-source-* 属性）
  function getSourceInfo(el) {
    let target = el;
    while (target && target !== document.body) {
      const file = target.getAttribute('data-source-file');
      const line = target.getAttribute('data-source-line');
      const col = target.getAttribute('data-source-col');
      if (file) {
        return {
          file: file,
          line: parseInt(line) || 0,
          column: parseInt(col) || 0,
          // sourceId 作为唯一标识，用于导航定位
          sourceId: file + ':' + line + ':' + col,
          el: target
        };
      }
      target = target.parentElement;
    }
    return null;
  }
  
  // 通过 sourceId 查找元素
  function getElementBySourceId(sourceId) {
    const [file, line, col] = sourceId.split(':');
    if (!file || !line) return null;
    
    // 查找匹配的元素
    const selector = '[data-source-file="' + file + '"][data-source-line="' + line + '"]' + 
                     (col ? '[data-source-col="' + col + '"]' : '');
    return document.querySelector(selector);
  }
  
  // 生成元素标签（用于导航按钮显示）
  function getElementLabel(el) {
    let label = el.tagName.toLowerCase();
    if (el.id) label += '#' + el.id;
    else if (el.className && typeof el.className === 'string') {
      const cls = el.className.split(' ').filter(c => c && !c.startsWith('data-'))[0];
      if (cls) label += '.' + cls;
    }
    return label;
  }
  
  // 构建元素信息对象
  function buildElementInfo(el) {
    const source = getSourceInfo(el);
    return {
      // 用 sourceId 作为定位标识，而不是 DOM 路径
      sourceId: source ? source.sourceId : null,
      tagName: el.tagName.toLowerCase(),
      id: el.id || '',
      classList: Array.from(el.classList || []),
      textContent: (el.textContent || '').trim().slice(0, 200),
      source: source ? {
        file: source.file,
        line: source.line,
        column: source.column
      } : null
    };
  }
  
  // 构建家族信息（父/子/兄弟元素）- 使用 sourceId 定位
  function buildFamilyInfo(el) {
    const family = { parents: [], children: [], siblings: [] };
    
    // 父元素链（最多3层，只取有 source 的）
    let parent = el.parentElement;
    let depth = 0;
    while (parent && parent !== document.body && depth < 5) {
      const source = getSourceInfo(parent);
      if (source && source.el === parent) {
        family.parents.push({
          sourceId: source.sourceId,
          label: getElementLabel(parent)
        });
        depth++;
      }
      parent = parent.parentElement;
      if (family.parents.length >= 3) break;
    }
    
    // 子元素（递归查找有 source 的，最多5个）
    function findSourceChildren(node, result, maxDepth) {
      if (result.length >= 5 || maxDepth <= 0) return;
      Array.from(node.children).forEach(child => {
        if (result.length >= 5) return;
        const source = getSourceInfo(child);
        if (source && source.el === child) {
          result.push({
            sourceId: source.sourceId,
            label: getElementLabel(child)
          });
        } else {
          findSourceChildren(child, result, maxDepth - 1);
        }
      });
    }
    findSourceChildren(el, family.children, 3);
    
    // 兄弟元素（有 source 的）
    if (el.parentElement) {
      const siblings = Array.from(el.parentElement.children);
      const idx = siblings.indexOf(el);
      const nearby = [
        ...siblings.slice(Math.max(0, idx - 3), idx),
        ...siblings.slice(idx + 1, idx + 4)
      ];
      nearby.forEach(sib => {
        if (family.siblings.length >= 4) return;
        const source = getSourceInfo(sib);
        if (source && source.el === sib) {
          family.siblings.push({
            sourceId: source.sourceId,
            label: getElementLabel(sib)
          });
        }
      });
    }
    
    return family;
  }

  // ========== 通讯函数 ==========

  function postEvent(action, data = {}) {
    const event = {
      type: 'DEV_INSPECTOR_EVENT',
      action: action,
      timestamp: Date.now(),
      ...data
    };
    // 发送给父窗口（iframe 场景）
    if (window.parent !== window) {
      window.parent.postMessage(event, '*');
    }
    // 同时打印到控制台
    console.log('[Inspector]', action, data);
  }
  
  function setEnabled(value) {
    enabled = value;
    postEvent('status', { enabled: enabled });
    if (enabled) {
      document.body.classList.add('inspector-active');
    } else {
      document.body.classList.remove('inspector-active');
      clearAll();
    }
  }
  
  // 清除所有高亮
  function clearAll() {
    hoverBox.style.display = 'none';
    hoverTagTop.style.display = 'none';
    hoverTagBottom.style.display = 'none';
    selectedBox.style.display = 'none';
    selectedTagTop.style.display = 'none';
    selectedTagBottom.style.display = 'none';
    hoverEl = null;
    selectedEl = null;
  }
  
  // 清除 hover 高亮
  function clearHover() {
    hoverBox.style.display = 'none';
    hoverTagTop.style.display = 'none';
    hoverTagBottom.style.display = 'none';
    hoverEl = null;
  }
  
  // 更新 hover 高亮框（青色）
  function updateHoverHighlight(el) {
    if (!el || el === selectedEl) {
      clearHover();
      return;
    }
    
    const rect = el.getBoundingClientRect();
    
    // 更新 hover 框
    hoverBox.style.display = 'block';
    hoverBox.style.left = rect.left + 'px';
    hoverBox.style.top = rect.top + 'px';
    hoverBox.style.width = rect.width + 'px';
    hoverBox.style.height = rect.height + 'px';
    
    // 构建上方标签内容
    let topHtml = '<span class="tag-name">' + el.tagName.toLowerCase() + '</span>';
    if (el.id) {
      topHtml += '<span class="tag-id">#' + el.id + '</span>';
    }
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c && !c.startsWith('data-')).slice(0, 2);
      classes.forEach(cls => {
        topHtml += '<span class="tag-class">.' + cls + '</span>';
      });
    }
    topHtml += '<span class="tag-size">' + Math.round(rect.width) + ' × ' + Math.round(rect.height) + '</span>';
    
    hoverTagTop.innerHTML = topHtml;
    hoverTagTop.style.display = 'flex';
    hoverTagTop.style.left = rect.left + 'px';
    hoverTagTop.style.top = rect.top + 'px';
    
    // 构建下方标签内容（文件信息）
    const source = getSourceInfo(el);
    if (source) {
      hoverTagBottom.innerHTML = '<div class="file-info">' +
        '<span class="file-icon">📄</span>' +
        '<span class="file-path">' + source.file + '</span>' +
        '<span class="file-line">:' + source.line + ':' + source.column + '</span>' +
        '</div>';
    } else {
      hoverTagBottom.innerHTML = '<div class="file-info">' +
        '<span class="file-icon">⚠️</span>' +
        '<span class="file-path" style="color:#fbbf24">no source info</span>' +
        '</div>';
    }
    hoverTagBottom.style.display = 'block';
    hoverTagBottom.style.left = rect.left + 'px';
    hoverTagBottom.style.top = (rect.bottom) + 'px';
    
    // 确保标签不超出视口
    const topRect = hoverTagTop.getBoundingClientRect();
    if (topRect.top < 0) {
      hoverTagTop.style.top = (rect.bottom + 4) + 'px';
      hoverTagTop.style.transform = 'none';
      hoverTagTop.style.paddingBottom = '0';
      hoverTagTop.style.paddingTop = '4px';
    } else {
      hoverTagTop.style.transform = 'translateY(-100%)';
      hoverTagTop.style.paddingBottom = '4px';
      hoverTagTop.style.paddingTop = '0';
    }
    
    const bottomRect = hoverTagBottom.getBoundingClientRect();
    if (bottomRect.bottom > window.innerHeight) {
      hoverTagBottom.style.top = (rect.top - bottomRect.height - 4) + 'px';
    }
    
    hoverEl = el;
  }
  
  // 更新选中高亮框（紫色）
  function updateSelectedHighlight(el) {
    if (!el) {
      selectedBox.style.display = 'none';
      selectedTagTop.style.display = 'none';
      selectedTagBottom.style.display = 'none';
      selectedEl = null;
      return;
    }
    
    const rect = el.getBoundingClientRect();
    
    // 更新选中框
    selectedBox.style.display = 'block';
    selectedBox.style.left = rect.left + 'px';
    selectedBox.style.top = rect.top + 'px';
    selectedBox.style.width = rect.width + 'px';
    selectedBox.style.height = rect.height + 'px';
    
    // 构建上方标签内容（带选中标记）
    let topHtml = '<span class="tag-selected">✓ SELECTED</span>';
    topHtml += '<span class="tag-name">' + el.tagName.toLowerCase() + '</span>';
    if (el.id) {
      topHtml += '<span class="tag-id">#' + el.id + '</span>';
    }
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c && !c.startsWith('data-')).slice(0, 2);
      classes.forEach(cls => {
        topHtml += '<span class="tag-class">.' + cls + '</span>';
      });
    }
    topHtml += '<span class="tag-size">' + Math.round(rect.width) + ' × ' + Math.round(rect.height) + '</span>';
    
    selectedTagTop.innerHTML = topHtml;
    selectedTagTop.style.display = 'flex';
    selectedTagTop.style.left = rect.left + 'px';
    selectedTagTop.style.top = rect.top + 'px';
    
    // 构建下方标签内容（文件信息）
    const source = getSourceInfo(el);
    if (source) {
      selectedTagBottom.innerHTML = '<div class="file-info">' +
        '<span class="file-icon">📄</span>' +
        '<span class="file-path">' + source.file + '</span>' +
        '<span class="file-line">:' + source.line + ':' + source.column + '</span>' +
        '</div>';
    } else {
      selectedTagBottom.innerHTML = '<div class="file-info">' +
        '<span class="file-icon">⚠️</span>' +
        '<span class="file-path" style="color:#fbbf24">no source info</span>' +
        '</div>';
    }
    selectedTagBottom.style.display = 'block';
    selectedTagBottom.style.left = rect.left + 'px';
    selectedTagBottom.style.top = (rect.bottom) + 'px';
    
    // 确保标签不超出视口
    const topRect = selectedTagTop.getBoundingClientRect();
    if (topRect.top < 0) {
      selectedTagTop.style.top = (rect.bottom + 4) + 'px';
      selectedTagTop.style.transform = 'none';
      selectedTagTop.style.paddingBottom = '0';
      selectedTagTop.style.paddingTop = '4px';
    } else {
      selectedTagTop.style.transform = 'translateY(-100%)';
      selectedTagTop.style.paddingBottom = '4px';
      selectedTagTop.style.paddingTop = '0';
    }
    
    const bottomRect = selectedTagBottom.getBoundingClientRect();
    if (bottomRect.bottom > window.innerHeight) {
      selectedTagBottom.style.top = (rect.top - bottomRect.height - 4) + 'px';
    }
    
    selectedEl = el;
  }
  
  // 获取元素的样式信息
  function getStyleInfo(el) {
    const className = typeof el.className === 'string' ? el.className : '';
    const inlineStyle = el.getAttribute('style') || '';
    const computedStyle = window.getComputedStyle(el);

    // 解析 inline styles
    const styles = [];
    if (inlineStyle) {
      inlineStyle.split(';').forEach(s => {
        const [prop, val] = s.split(':').map(x => x.trim());
        if (prop && val) {
          styles.push({ prop, value: val });
        }
      });
    }

    return {
      className: className,
      inlineStyle: inlineStyle,
      styles: styles,
      // 常用的计算样式
      computed: {
        width: computedStyle.width,
        height: computedStyle.height,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontSize: computedStyle.fontSize,
        display: computedStyle.display,
        position: computedStyle.position
      }
    };
  }

  // 选中元素并发送事件
  function selectElement(el, action = 'select') {
    // 更新选中框
    updateSelectedHighlight(el);
    // 清除 hover（因为点击的元素就是当前 hover 的）
    clearHover();

    const elementInfo = buildElementInfo(el);
    const familyInfo = buildFamilyInfo(el);
    const styleInfo = getStyleInfo(el);

    postEvent(action, {
      element: elementInfo,
      family: familyInfo,
      style: styleInfo
    });
  }

  // ========== 事件处理 ==========

  // 检查是否是 inspector 自身的元素
  function isInspectorElement(el) {
    return el === hoverBox || el === selectedBox || el === hoverTagTop || el === hoverTagBottom ||
           el === selectedTagTop || el === selectedTagBottom;
  }

  function onMouseMove(e) {
    if (!enabled) return;

    const el = e.target;
    if (isInspectorElement(el) || el === document.body || el === document.documentElement) return;

    // 更新 hover 高亮（即使有选中元素也显示）
    updateHoverHighlight(el);
  }

  function onClick(e) {
    if (!enabled) return;

    const el = e.target;
    // 如果点击的是 inspector 元素，不处理
    if (isInspectorElement(el)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    selectElement(el, 'select');
    return false;
  }

  // 阻止所有可能触发按钮行为的事件
  function blockEvent(e) {
    if (!enabled) return;
    // 如果是 inspector 元素，不阻止
    if (isInspectorElement(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }

  function onKeyDown(e) {
    // Alt + Shift + I 切换检查器
    if (e.altKey && e.shiftKey && e.key === 'I') {
      setEnabled(!enabled);
    }
    // ESC 关闭检查器
    if (e.key === 'Escape' && enabled) {
      setEnabled(false);
    }
  }

  // ========== postMessage 命令处理 ==========

  window.addEventListener('message', function(e) {
    if (!e.data || e.data.type !== 'DEV_INSPECTOR_COMMAND') return;

    const { command, path } = e.data;

    switch (command) {
      case 'toggle':
        setEnabled(!enabled);
        break;

      case 'enable':
        setEnabled(true);
        break;

      case 'disable':
        setEnabled(false);
        break;

      case 'selectByPath':
        // 兼容旧的 path 参数，但优先使用 sourceId
        const sourceId = e.data.sourceId || path;
        if (sourceId) {
          const el = getElementBySourceId(sourceId);
          if (el) {
            selectElement(el, 'navigate');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        break;

      case 'updateClassName':
        // 更新选中元素的 className
        if (selectedEl && typeof e.data.className === 'string') {
          selectedEl.className = e.data.className;
          // 更新高亮框位置（尺寸可能变化）
          updateSelectedHighlight(selectedEl);
          postEvent('styleUpdated', {
            type: 'className',
            value: e.data.className,
            style: getStyleInfo(selectedEl)
          });
        }
        break;

      case 'updateStyle':
        // 更新选中元素的 inline style
        if (selectedEl && typeof e.data.style === 'string') {
          if (e.data.style) {
            selectedEl.setAttribute('style', e.data.style);
          } else {
            selectedEl.removeAttribute('style');
          }
          // 更新高亮框位置（尺寸可能变化）
          updateSelectedHighlight(selectedEl);
          postEvent('styleUpdated', {
            type: 'style',
            value: e.data.style,
            style: getStyleInfo(selectedEl)
          });
        }
        break;

      case 'resetStyle':
        // 重置选中元素的样式到原始状态（需要配合 select 事件保存的原始样式）
        if (selectedEl && e.data.originalClassName !== undefined) {
          selectedEl.className = e.data.originalClassName;
        }
        if (selectedEl && e.data.originalStyle !== undefined) {
          if (e.data.originalStyle) {
            selectedEl.setAttribute('style', e.data.originalStyle);
          } else {
            selectedEl.removeAttribute('style');
          }
        }
        updateSelectedHighlight(selectedEl);
        postEvent('styleReset', { style: getStyleInfo(selectedEl) });
        break;
    }
  });

  // ========== 初始化 ==========

  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('mousedown', blockEvent, true);
  document.addEventListener('mouseup', blockEvent, true);
  document.addEventListener('pointerdown', blockEvent, true);
  document.addEventListener('pointerup', blockEvent, true);
  document.addEventListener('touchstart', blockEvent, true);
  document.addEventListener('touchend', blockEvent, true);
  document.addEventListener('keydown', onKeyDown);

  // 鼠标离开文档时清除 hover 高亮
  document.addEventListener('mouseleave', function() {
    if (enabled) {
      clearHover();
    }
  });

  // 滚动时更新高亮框位置
  function onScroll() {
    if (!enabled) return;
    if (hoverEl) {
      updateHoverHighlight(hoverEl);
    }
    if (selectedEl) {
      updateSelectedHighlight(selectedEl);
    }
  }
  window.addEventListener('scroll', onScroll, true);
  
  // 页面加载完成后发送 ready 事件
  if (document.readyState === 'complete') {
    postEvent('ready');
  } else {
    window.addEventListener('load', function() {
      postEvent('ready');
    });
  }
  
  console.log('[Inspector] Press Alt+Shift+I to toggle element inspector');
})();
</script>
      `
      return html.replace('</body>', `${inspectorScript}</body>`)
    },
  }
}

// ==================== Babel Plugin: Source Location ====================

/**
 * Babel 插件配置选项
 */
export interface SourceLocationPluginOptions {
  /** 要排除的路径模式（不注入 source 属性） */
  exclude?: (string | RegExp)[]
}

/**
 * Babel 插件：为 JSX 元素注入源码位置属性
 * 配合 devInspectorPlugin 使用
 * 
 * @param options.exclude - 排除的路径，默认排除 components/ui 和 node_modules
 */
export const babelPluginSourceLocation = function({ types: t }: { types: any }) {
  return {
    name: 'babel-plugin-source-location',
    visitor: {
      JSXOpeningElement(path: any, state: any) {
        const { node } = path
        const { filename, cwd } = state
        const { line, column } = node.loc.start
        
        // 获取配置选项
        const options: SourceLocationPluginOptions = state.opts || {}
        const excludePatterns = options.exclude || [
          /components\/ui\//,      // 排除 UI 组件库
          /node_modules/,          // 排除 node_modules
          /@radix-ui/,             // 排除 radix-ui
          /lucide-react/,          // 排除图标库
        ]
        
        // 检查是否应该排除此文件
        const filePath = filename || ''
        const shouldExclude = excludePatterns.some(pattern => {
          if (typeof pattern === 'string') {
            return filePath.includes(pattern)
          }
          return pattern.test(filePath)
        })
        
        if (shouldExclude) return

        // 跳过 Fragment 和已有属性的元素
        if (t.isJSXIdentifier(node.name) && node.name.name === 'Fragment') return
        if (node.attributes.some((attr: any) => 
          t.isJSXAttribute(attr) && attr.name.name === 'data-source-file'
        )) return

        // 转换为相对路径
        let relativePath = filename || 'unknown'
        if (cwd && relativePath.startsWith(cwd)) {
          relativePath = relativePath.slice(cwd.length + 1) // +1 去掉开头的 /
        }

        // 添加源码位置属性
        node.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier('data-source-file'),
            t.stringLiteral(relativePath)
          ),
          t.jsxAttribute(
            t.jsxIdentifier('data-source-line'),
            t.stringLiteral(String(line))
          ),
          t.jsxAttribute(
            t.jsxIdentifier('data-source-col'),
            t.stringLiteral(String(column))
          )
        )
      },
    },
  }
}
