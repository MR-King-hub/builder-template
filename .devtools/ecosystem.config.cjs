const path = require('path')

const TEMPLATE_DIR = path.resolve(__dirname, '../template')
const DEVTOOLS_DIR = __dirname

module.exports = {
  apps: [
    {
      name: 'vite-dev',
      script: 'npx',
      args: 'vite --host --port 5173 --strictPort',
      cwd: TEMPLATE_DIR,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      env: {
        FORCE_COLOR: '1'
      }
    },
    {
      name: 'download-server',
      script: path.join(DEVTOOLS_DIR, 'download-server.mjs'),
      args: TEMPLATE_DIR,
      cwd: DEVTOOLS_DIR,
      watch: false,
      autorestart: true,
      max_restarts: 10
    },
    {
      name: 'cloudflare-tunnel',
      script: 'npx',
      args: 'cloudflared tunnel --protocol http2 --url http://localhost:3456',
      cwd: DEVTOOLS_DIR,
      watch: false,
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000
    }
  ]
}
