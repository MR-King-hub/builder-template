#!/usr/bin/env node
/**
 * 部署启动脚本
 * 
 * 功能：
 * 1. 清理占用的端口
 * 2. 构建项目
 * 3. 前台启动服务（保持运行）
 * 4. 捕获 cloudflared 隧道 URL 并输出
 */

import { spawn, execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = resolve(__dirname, '../template')

// 清理端口和旧进程
function cleanupPorts() {
  const ports = [3456, 5173]
  for (const port of ports) {
    try {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { stdio: 'ignore' })
    } catch {}
  }
  
  // 清理旧的 cloudflared 进程
  try {
    execSync(`pkill -f 'cloudflared tunnel' 2>/dev/null`, { stdio: 'ignore' })
  } catch {}
  
  console.log('✅ 端口已清理')
}

// 构建项目
function buildProject() {
  console.log('📦 正在构建项目...')
  try {
    execSync('npm run build', { cwd: TEMPLATE_DIR, stdio: 'inherit' })
    console.log('✅ 构建完成')
    return true
  } catch (err) {
    console.error('❌ 构建失败')
    return false
  }
}

// 启动服务并捕获 URL
function startServices() {
  return new Promise((resolvePromise, reject) => {
    console.log('🚀 正在启动服务...')
    
    // 使用 concurrently 启动所有服务
    const child = spawn('npx', [
      'concurrently', 
      '-k',  // kill all on exit
      '-n', 'vite,proxy,tunnel', 
      '-c', 'blue,green,yellow',
      `npm run --prefix ${TEMPLATE_DIR} dev -- --port 5173 --strictPort`,
      `node ${resolve(__dirname, 'download-server.mjs')} ${TEMPLATE_DIR}`,
      `npx cloudflared tunnel --protocol http2 --url http://localhost:3456`
    ], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
      env: { ...process.env, FORCE_COLOR: '0' }
    })

    let urlFound = false
    const timeout = setTimeout(() => {
      if (!urlFound) {
        console.error('❌ 超时：未能获取隧道 URL')
        reject(new Error('Timeout waiting for tunnel URL'))
      }
    }, 60000)

    const handleOutput = (data) => {
      const output = data.toString()
      
      // 捕获 cloudflared 输出的隧道 URL
      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i)
      if (match && !urlFound) {
        urlFound = true
        clearTimeout(timeout)
        const tunnelUrl = match[0]
        
        // 等待一下确保隧道稳定
        setTimeout(() => {
          console.log('\n' + '='.repeat(60))
          console.log('✅ 部署成功！')
          console.log('='.repeat(60))
          console.log(`\n预览地址: ${tunnelUrl}`)
          console.log(`下载地址: ${tunnelUrl}/__download__\n`)
          console.log('<!-- TUNNEL_URL: ' + tunnelUrl + ' -->')
          console.log('\n服务已在后台运行，关闭终端不会影响服务。')
          console.log('如需停止服务，运行: pkill -f "cloudflared tunnel"')
          
          // 让父进程退出，子进程继续运行
          child.unref()
          resolvePromise(tunnelUrl)
        }, 2000)
      }
    }

    child.stdout.on('data', handleOutput)
    child.stderr.on('data', handleOutput)

    child.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

// 主流程
async function main() {
  try {
    cleanupPorts()
    
    if (!buildProject()) {
      process.exit(1)
    }
    
    await startServices()
    process.exit(0)
  } catch (err) {
    console.error('部署失败:', err.message)
    process.exit(1)
  }
}

main()
