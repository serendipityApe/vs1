# Vibe Shit - 辉煌的失败展示平台

一个"反向Product Hunt"平台，专门展示那些辉煌失败的编程项目。在这里，bug不是缺陷，而是特色。

## 🎯 产品理念

- 庆祝创作过程，而非完美结果
- 为开发者提供一个安全的"失败"展示空间
- 将废弃项目转化为有趣的内容和学习资源

## ⚡ 核心功能 (MVP)

- **项目提交**：标题、链接、标语、"忏悔录"
- **日榜排行**：24小时重置的点赞排行榜
- **GitHub认证**：开发者身份验证
- **评论互动**：项目详情页讨论区

## 🛠 技术栈

- **框架**: Next.js 14 (App Router)
- **UI组件**: HeroUI v2
- **样式**: Tailwind CSS
- **数据库**: Prisma + PostgreSQL
- **认证**: NextAuth.js (GitHub OAuth)
- **部署**: Vercel

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 设置环境变量
cp .env.example .env.local
# 填入你的 GitHub OAuth 配置

# 运行数据库迁移
npx prisma db push

# 启动开发服务器
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
app/                    # Next.js 13+ App Router
├── api/               # API路由
├── submit/            # 项目提交页
├── project/           # 项目详情页
└── page.tsx           # 主页
components/            # React组件
├── ui/               # 基础UI组件
└── layout/           # 布局组件
lib/                  # 工具库和配置
types/                # TypeScript类型定义
```

## 🌟 愿景

从一个简单的"垃圾"项目展示平台，发展成为一个充满创造力和幽默感的开发者社区。

---

*"在这里，每个bug都是一个feature，每个崩溃都是一种艺术。"*
