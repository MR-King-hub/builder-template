# 开发工具

沙箱环境下的穿透和下载工具，**不会影响主项目模板**。

## 安装

```bash
cd .devtools
npm install
```

## 使用（在 .devtools 目录下执行）

```bash
# 开发 + 穿透预览
npm run tunnel

# 开发 + 构建 + 穿透预览 + 下载
npm run all

# 仅下载服务
npm run download
```

所有命令会自动 `cd ..` 到项目根目录执行。

## 访问地址

启动后 cloudflared 会输出 `https://xxx.trycloudflare.com`：

| 路径 | 功能 |
|------|------|
| `/` | Vite 预览 |
| `/__download__` | 下载页面 |
| `/__download__/project.tar.gz` | 下载源码 |
| `/__download__/dist.tar.gz` | 下载构建产物 |

## 服务器部署

```bash
# 下载构建产物
wget https://xxx.trycloudflare.com/__download__/dist.tar.gz
tar -xzf dist.tar.gz

# 或下载源码
wget https://xxx.trycloudflare.com/__download__/project.tar.gz
tar -xzf project.tar.gz
npm install && npm run build
```
