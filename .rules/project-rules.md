# 项目规范 - Vite + React + shadcn/ui

## 技术栈
- Vite 6 + React 18 + TypeScript
- TailwindCSS + shadcn/ui (default style)
- React Router v6

## 目录结构
```
src/
├── components/ui/     # shadcn/ui 组件 (已预装)
├── hooks/             # 自定义 Hooks
├── lib/utils.ts       # cn() 工具函数
├── pages/             # 页面组件
├── assets/            # 静态资源
├── App.tsx            # 路由配置
└── main.tsx           # 入口 (已配置 BrowserRouter)
```

## 路径别名
- `@/*` → `src/*`

## 组件导入规范

```tsx
// 推荐: 从 index 统一导入
import { Button, Card, Input, Dialog } from '@/components/ui'

// 或从单独文件导入
import { Button } from '@/components/ui/button'
```

## 可用的 shadcn/ui 组件

### 布局组件
- `AspectRatio` - 宽高比容器
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`
- `ScrollArea`, `ScrollBar`
- `Separator`
- `Sidebar`, `SidebarProvider`, `SidebarTrigger`, `SidebarContent`, `SidebarHeader`, `SidebarFooter`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`

### 表单组件
- `Button` - 按钮 (variants: default, destructive, outline, secondary, ghost, link)
- `Checkbox`
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` (需配合 react-hook-form)
- `Input`
- `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`
- `Label`
- `RadioGroup`, `RadioGroupItem`
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`
- `Slider`
- `Switch`
- `Textarea`

### 数据展示
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `Badge` - 徽章 (variants: default, secondary, destructive, outline)
- `Calendar`
- `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`
- `Chart` (ChartContainer, ChartTooltip, ChartLegend 等)
- `Progress`
- `Skeleton`
- `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`

### 反馈组件
- `Alert`, `AlertTitle`, `AlertDescription`
- `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`
- `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose`
- `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`
- `Sonner` - Toast 通知 (来自 sonner 库)
- `Toast`, `ToastAction` + `Toaster` + `useToast`
- `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`

### 导航组件
- `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`
- `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`
- `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`, `ContextMenuRadioGroup`
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuRadioGroup`
- `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, `MenubarSeparator`, `MenubarShortcut`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarSub`, `MenubarSubContent`, `MenubarSubTrigger`
- `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuContent`, `NavigationMenuTrigger`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`
- `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

### 其他组件
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`
- `DatePicker` (基于 Calendar + Popover)
- `HoverCard`, `HoverCardTrigger`, `HoverCardContent`
- `Popover`, `PopoverTrigger`, `PopoverContent`
- `Toggle` (variants: default, outline)
- `ToggleGroup`, `ToggleGroupItem`
- `PageWrapper` - 页面包装器

## 自定义 Hooks
- `useToast()` - Toast 通知管理
- `useIsMobile()` - 移动端检测

## 工具函数
```tsx
import { cn } from '@/lib/utils'

// cn() 用于合并 Tailwind 类名
<div className={cn("base-class", condition && "conditional-class")} />
```

## 添加新页面
1. 在 `src/pages/` 创建组件
2. 在 `src/App.tsx` 添加 Route

```tsx
// App.tsx
import { Routes, Route } from 'react-router-dom'
import NewPage from './pages/NewPage'

<Routes>
  <Route path="/new" element={<NewPage />} />
</Routes>
```

## 代码风格
- 使用函数组件 + Hooks
- 优先使用 shadcn/ui 组件
- 使用 TailwindCSS 进行样式设计
- 类型安全: 为 props 定义 TypeScript 接口

## 启动命令
```bash
npm run dev      # 开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
```
