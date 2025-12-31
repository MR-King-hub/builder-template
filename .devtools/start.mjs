#!/usr/bin/env node
import { spawn, execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { appendFileSync, writeFileSync, readFileSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = resolve(__dirname, '../template')
const LOG_FILE = resolve(__dirname, 'tunnel.log')

function cleanup() {
  [3456, 5173].forEach(p => {
    try { execSync(`lsof -ti:${p} | xargs kill -9`, { stdio: 'ignore' }) } catch {}
  })
  try { execSync(`pkill -f 'cloudflared tunnel'`, { stdio: 'ignore' }) } catch {}
  console.log('✅ 端口已清理')
}

function build() {
  console.log('📦 正在构建项目...')
  try {
    execSync('npm run build', { cwd: TEMPLATE_DIR, stdio: 'inherit' })
    console.log('✅ 构建完成')
    return true
  } catch { return false }
}

function start() {
  return new Promise((res, rej) => {
    console.log('🚀 正在启动服务...')
    writeFileSync(LOG_FILE, '')
    
    // 用 nohup 启动，完全脱离终端
    const child = spawn('nohup', [
      'npx', 'concurrently', '-k',
      `npm run --prefix ${TEMPLATE_DIR} dev -- --port 5173 --strictPort`,
      `node ${__dirname}/download-server.mjs ${TEMPLATE_DIR}`,
      `npx cloudflared tunnel --protocol http2 --url http://localhost:3456`
    ], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
      env: { ...process.env, FORCE_COLOR: '0' }
    })
    
    child.unref()
    
    let found = false
    const timeout = setTimeout(() => !found && rej(new Error('超时')), 60000)
    
    const check = (d) => {
      const s = d.toString()
      appendFileSync(LOG_FILE, s)
      const m = s.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i)
      if (m && !found) {
        found = true
        clearTimeout(timeout)
        setTimeout(() => {
          console.log('\n' + '='.repeat(60))
          console.log('✅ 部署成功！')
          console.log('='.repeat(60))
          console.log(`\n预览地址: ${m[0]}`)
          console.log(`下载地址: ${m[0]}/__download__\n`)
          console.log('<!-- TUNNEL_URL: ' + m[0] + ' -->')
          console.log('\n服务在后台运行，日志: ' + LOG_FILE)
          res(m[0])
        }, 2000)
      }
    }
    
    child.stdout.on('data', check)
    child.stderr.on('data', check)
  })
}

async function main() {
  cleanup()
  if (!build()) process.exit(1)
  await start()
  process.exit(0)
}

main().catch(e => { console.error('失败:', e.message); process.exit(1) })
