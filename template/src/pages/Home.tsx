import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* 头部导航 */}
      <header className="max-w-6xl mx-auto mb-12">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg" />
            <span className="text-white text-xl font-bold">DevStudio</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-300 hover:text-white transition">功能</a>
            <a href="#" className="text-gray-300 hover:text-white transition">定价</a>
            <a href="#" className="text-gray-300 hover:text-white transition">文档</a>
            <Button variant="outline" className="text-white border-white/20">登录</Button>
            <Button>开始使用</Button>
          </div>
        </nav>
      </header>

      {/* 主标题区域 */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <Badge className="mb-4" variant="secondary">🚀 v2.0 全新发布</Badge>
        <h1 className="text-5xl font-bold text-white mb-6">
          构建现代化 Web 应用的
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> 最佳选择</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          基于 Vite + React + shadcn/ui 的开发模板，让你专注于业务逻辑
        </p>
        <div className="flex justify-center gap-4">
          <Input placeholder="输入你的邮箱" className="w-64 bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
          <Button size="lg">立即体验</Button>
        </div>
      </section>

      {/* 特性卡片 */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <CardTitle>极速开发</CardTitle>
            <CardDescription className="text-gray-400">
              Vite 的闪电般热更新，让开发体验飞起来
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop" 
              alt="代码编辑器"
              className="w-full h-32 object-cover rounded-lg"
            />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <CardTitle>精美组件</CardTitle>
            <CardDescription className="text-gray-400">
              shadcn/ui 提供开箱即用的高质量组件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=200&fit=crop" 
              alt="UI 设计"
              className="w-full h-32 object-cover rounded-lg"
            />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <CardTitle>类型安全</CardTitle>
            <CardDescription className="text-gray-400">
              TypeScript 全面支持，告别运行时错误
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop" 
              alt="TypeScript 代码"
              className="w-full h-32 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      </section>

      {/* 用户评价 */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-8">用户评价</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                  alt="用户头像"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-gray-300 mb-2">"这个模板让我的开发效率提升了 3 倍，强烈推荐！"</p>
                  <p className="text-sm text-gray-500">张三 · 前端工程师</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" 
                  alt="用户头像"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-gray-300 mb-2">"组件质量很高，文档也很清晰，上手非常快。"</p>
                  <p className="text-sm text-gray-500">李四 · 全栈开发者</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="max-w-4xl mx-auto text-center">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-white">准备好开始了吗？</CardTitle>
            <CardDescription className="text-blue-100">
              立即使用这个模板，开启你的下一个项目
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center gap-4">
            <Button variant="secondary" size="lg">查看文档</Button>
            <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">
              GitHub
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* 页脚 */}
      <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2024 DevStudio. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">隐私政策</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">服务条款</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
