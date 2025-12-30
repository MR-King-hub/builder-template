#!/usr/bin/env node
/**
 * 项目打包下载服务（与 Vite 预览共存）
 * 
 * 使用方式：
 *   node download-server.mjs <project-dir>
 * 
 * 访问：
 *   https://xxx.trycloudflare.com        -> Vite 预览
 *   https://xxx.trycloudflare.com/__download__  -> 下载页面
 */

import { createServer, request as httpRequest } from 'http'
import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { join, resolve } from 'path'

const PORT = 3456
const VITE_PORT = process.env.VITE_PORT || 5173
// 支持命令行参数传入项目目录
const PROJECT_DIR = resolve(process.argv[2] || process.cwd())

// 要排除的目录/文件
const EXCLUDES = [
  'node_modules',
  'dist',
  '.git',
  '.devtools',
  '*.tar.gz',
  '*.tsbuildinfo',
  '.env',
  '.env.local'
]

// 代理到 Vite
function proxyToVite(req, res) {
  const options = {
    hostname: 'localhost',
    port: VITE_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${VITE_PORT}`
    }
  }

  const proxyReq = httpRequest(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res)
  })

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message)
    res.statusCode = 502
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(`
      <h1>⏳ Vite 服务器启动中...</h1>
      <p>请稍等几秒后刷新页面</p>
      <p>错误: ${err.message}</p>
      <script>setTimeout(() => location.reload(), 3000)</script>
    `)
  })

  req.pipe(proxyReq)
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  
  // 下载相关路由
  if (url.pathname.startsWith('/__download__')) {
    const downloadPath = url.pathname.replace('/__download__', '') || '/'
    
    console.log(`[DOWNLOAD] ${req.method} ${downloadPath}`)

    // 下载完整项目
    if (downloadPath === '/project.tar.gz') {
      res.setHeader('Content-Type', 'application/gzip')
      res.setHeader('Content-Disposition', 'attachment; filename=project.tar.gz')
      
      const excludeArgs = EXCLUDES.flatMap(e => ['--exclude', e])
      const tar = spawn('tar', ['-czf', '-', ...excludeArgs, '.'], {
        cwd: PROJECT_DIR
      })
      
      tar.stdout.pipe(res)
      tar.stderr.on('data', d => console.error(d.toString()))
      tar.on('error', err => {
        console.error('tar error:', err)
        res.statusCode = 500
        res.end('Archive failed')
      })
      return
    }

    // 只下载 dist 目录
    if (downloadPath === '/dist.tar.gz') {
      const distPath = join(PROJECT_DIR, 'dist')
      if (!existsSync(distPath)) {
        res.statusCode = 404
        res.end('dist/ not found. Run "npm run build" first.')
        return
      }
      
      res.setHeader('Content-Type', 'application/gzip')
      res.setHeader('Content-Disposition', 'attachment; filename=dist.tar.gz')
      
      const tar = spawn('tar', ['-czf', '-', 'dist'], {
        cwd: PROJECT_DIR
      })
      tar.stdout.pipe(res)
      return
    }

    // 下载页面
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>Project Download</title>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
    a { display: block; padding: 15px; margin: 10px 0; background: #0070f3; color: white; 
        text-decoration: none; border-radius: 8px; text-align: center; }
    a:hover { background: #0051a8; }
    .back { background: #666; }
    pre { background: #1a1a1a; color: #fff; padding: 15px; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>📦 Project Download</h1>
  
  <a href="/__download__/project.tar.gz">⬇️ 下载源码 (不含 node_modules/dist)</a>
  <a href="/__download__/dist.tar.gz">⬇️ 下载构建产物 (dist/)</a>
  <a href="/" class="back">← 返回预览</a>
  
  <h3>服务器上执行：</h3>
  <pre>
# 获取隧道地址（替换 xxx）
TUNNEL_URL="https://xxx.trycloudflare.com"

# 下载源码
wget $TUNNEL_URL/__download__/project.tar.gz
tar -xzf project.tar.gz
npm install && npm run build

# 或只下载构建产物（直接部署）
wget $TUNNEL_URL/__download__/dist.tar.gz
tar -xzf dist.tar.gz</pre>
</body>
</html>
    `)
    return
  }

  // 其他请求代理到 Vite
  proxyToVite(req, res)

}).listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🚀 Dev + Download Server Started                            ║
║                                                              ║
║  预览:    http://localhost:${PORT}                             ║
║  下载页:  http://localhost:${PORT}/__download__                ║
║                                                              ║
║  等待 cloudflared 输出隧道地址...                             ║
╚══════════════════════════════════════════════════════════════╝
`)
})
