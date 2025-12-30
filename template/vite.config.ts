import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 是否启用 Inspector（开发工具）
// 设为 true 时，构建产物会包含元素检查器，用于外部预览定位源码
const ENABLE_INSPECTOR = true

// 动态加载开发工具插件
async function loadDevToolsPlugins(): Promise<{ plugins: PluginOption[]; babelPlugins: any[] }> {
  if (!ENABLE_INSPECTOR) {
    return { plugins: [], babelPlugins: [] }
  }

  try {
    // 从 .devtools 目录加载插件
    const devPlugins = await import('../.devtools/vite-plugins')

    return {
      plugins: [devPlugins.devInspectorPlugin({ enableInBuild: true })] as PluginOption[],
      babelPlugins: [devPlugins.babelPluginSourceLocation],
    }
  } catch {
    // 插件不存在时静默忽略（用户项目不需要这些插件）
    return { plugins: [], babelPlugins: [] }
  }
}

export default defineConfig(async () => {
  const { plugins: devPlugins, babelPlugins } = await loadDevToolsPlugins()

  return {
    plugins: [
      react({
        babel: {
          plugins: babelPlugins,
        },
      }),
      ...devPlugins,
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      allowedHosts: true as const,
    },
  }
})
