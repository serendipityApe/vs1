# Vibe Shit - 开发文档

## 项目背景

"反向Product Hunt" - 一个专门展示辉煌失败项目的平台，将开发者的废弃项目转化为娱乐和学习内容。

## 开发原则

- **先做出来，再完善** - 避免过度分析，专注执行
- **最小可行产品(MVP)优先** - 核心功能：提交、展示、点赞、评论
- **社区氛围第一** - 庆祝创作过程，而非嘲笑创作者

## 技术架构

### 后端架构 (Next.js API Routes)

```
src/app/api/
├── auth/
│   └── [...nextauth]/route.ts    # NextAuth配置
├── projects/
│   ├── route.ts                  # GET /api/projects (列表+排行)
│   ├── submit/route.ts           # POST /api/projects/submit
│   └── [id]/
│       ├── route.ts              # GET /api/projects/:id
│       ├── vote/route.ts         # POST /api/projects/:id/vote
│       └── comments/route.ts     # GET/POST /api/projects/:id/comments
└── user/
    └── profile/route.ts          # GET /api/user/profile
```

### 数据库模型 (Prisma)

```prisma
model User {
  id          String    @id @default(cuid())
  githubId    Int       @unique
  username    String
  avatarUrl   String?
  createdAt   DateTime  @default(now())
  projects    Project[]
  votes       Vote[]
  comments    Comment[]
}

model Project {
  id          String    @id @default(cuid())
  title       String
  tagline     String
  url         String?
  confession  String    // "忏悔录" - 为什么这个项目垃圾
  imageUrl    String?
  tags        String[]
  createdAt   DateTime  @default(now())
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  votes       Vote[]
  comments    Comment[]

  @@map("projects")
}

model Vote {
  id        String   @id @default(cuid())
  userId    String
  projectId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  project   Project  @relation(fields: [projectId], references: [id])

  @@unique([userId, projectId])
  @@map("votes")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  userId    String
  projectId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  project   Project  @relation(fields: [projectId], references: [id])

  @@map("comments")
}
```

### API约定

#### 项目相关

**GET /api/projects**
```typescript
// Query参数
interface ProjectsQuery {
  limit?: number;    // 默认20
  offset?: number;   // 默认0
  sort?: 'votes' | 'recent';  // 默认votes
  date?: string;     // YYYY-MM-DD，筛选特定日期
}

// 响应
interface ProjectsResponse {
  projects: Array<{
    id: string;
    title: string;
    tagline: string;
    url?: string;
    imageUrl?: string;
    tags: string[];
    createdAt: string;
    votesCount: number;
    commentsCount: number;
    author: {
      username: string;
      avatarUrl?: string;
    };
  }>;
  total: number;
  hasMore: boolean;
}
```

**POST /api/projects/submit**
```typescript
interface SubmitProjectRequest {
  title: string;        // 必填，最大100字符
  tagline: string;      // 必填，最大60字符
  url?: string;         // 可选，必须是有效URL
  confession: string;   // 必填，最大2000字符，支持Markdown
  imageUrl?: string;    // 可选，头像URL
  tags?: string[];      // 可选，最多5个标签
}

interface SubmitProjectResponse {
  success: boolean;
  project?: Project;
  errors?: string[];
}
```

**GET /api/projects/:id**
```typescript
interface ProjectDetailResponse {
  project: {
    id: string;
    title: string;
    tagline: string;
    url?: string;
    confession: string;
    imageUrl?: string;
    tags: string[];
    createdAt: string;
    votesCount: number;
    hasVoted: boolean;    // 当前用户是否已点赞
    author: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
  };
}
```

**POST /api/projects/:id/vote**
```typescript
interface VoteRequest {
  action: 'upvote' | 'remove';
}

interface VoteResponse {
  success: boolean;
  votesCount: number;
  hasVoted: boolean;
}
```

#### 评论相关

**GET /api/projects/:id/comments**
```typescript
interface CommentsResponse {
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      username: string;
      avatarUrl?: string;
    };
  }>;
  total: number;
}
```

**POST /api/projects/:id/comments**
```typescript
interface CommentRequest {
  content: string;  // 必填，最大1000字符
}

interface CommentResponse {
  success: boolean;
  comment?: Comment;
  errors?: string[];
}
```

### 认证配置

使用NextAuth.js + GitHub OAuth：

```typescript
// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.githubId = profile.id;
        token.username = profile.login;
        token.avatarUrl = profile.avatar_url;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.githubId = token.githubId;
      session.user.username = token.username;
      session.user.avatarUrl = token.avatarUrl;
      return session;
    },
  },
};
```

## 环境配置

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

## 开发规范

### 代码约定
- 使用TypeScript严格模式
- 组件使用函数式写法
- API响应统一错误处理格式
- 所有用户输入必须验证和清理

### UI/UX原则
- **幽默但专业**：界面要干净，文案要有趣
- **移动端优先**：响应式设计
- **快速加载**：优化图片和API响应
- **无障碍性**：支持键盘导航和屏幕阅读器

### 数据处理
- 用户头像从GitHub API获取，缓存24小时
- 项目图片支持上传到Vercel Blob或Cloudinary
- 排行榜每天UTC 00:00重置
- 评论支持基础Markdown格式

## 部署清单

- [ ] 配置Vercel环境变量
- [ ] 设置PostgreSQL数据库 (Vercel Postgres或Railway)
- [ ] 配置GitHub OAuth应用
- [ ] 运行数据库迁移
- [ ] 设置域名和SSL证书

## 未来功能规划

- [ ] 项目标签系统和筛选
- [ ] 用户个人资料页
- [ ] "垃圾马拉松"活动页面
- [ ] 邮件通知系统
- [ ] API限流和反垃圾邮件

---

*记住：先做出MVP，然后迭代。不要被完美主义绑架。*