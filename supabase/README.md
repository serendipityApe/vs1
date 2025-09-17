# Supabase 迁移与配置指南

这个 README 汇总了把项目切换到 Supabase 所需的 SQL 执行步骤、OAuth 配置、环境变量与 Row Level Security (RLS) 示例策略。按照顺序操作即可在 Supabase 控制台完成迁移并验证。

## 检查点（任务清单）
- [x] 在仓库中已有 SQL 文件：
  - `supabase/migrations/1680000000000_create_tables.sql`
  - `supabase/migrations/1680000000005_full_wipe_and_recreate.sql` (一键重置并重建触发器，推荐用于回到干净状态)
- [ ] 在 Supabase 控制台按顺序执行上面两个 SQL 文件
- [ ] 在 Supabase Dashboard 配置 Google / GitHub OAuth
- [ ] 在 Supabase Dashboard 设置环境变量（见下文）并在部署平台配置服务角色密钥
- [ ] 启用 RLS 并按示例创建策略
- [ ] 验证用户注册/登录、项目提交、评论和投票功能

## 1) 在 Supabase 执行 SQL 迁移
顺序很重要：先创建表，再注册触发器。

1. 打开 Supabase 控制台 → SQL Editor → New query。
2. 复制并执行 `supabase/migrations/1680000000000_create_tables.sql` 的内容。
3. 确认表 `public.users`, `public.projects`, `public.votes`, `public.comments` 已创建。

4. 推荐执行顺序：

- 若你只需要为一个新项目初始化：运行 `supabase/migrations/1680000000000_create_tables.sql`。
- 若你想把现有 Supabase 项目完全回到“干净”状态（删除 auth 与 public 数据并重建触发器），运行 `supabase/migrations/1680000000005_full_wipe_and_recreate.sql`（该文件会同时创建一个健壮的触发器函数）。
- 若你只需要把历史 `auth.users` 同步到 `public.users`（触发器已就绪），运行 `supabase/migrations/1680000000003_sync_existing_auth_users.sql`。

注意：`1680000000005_full_wipe_and_recreate.sql` 是不可逆的一键重置脚本，执行前请确保已备份任何需要保留的数据。

> 备选：你也可以把这两份 SQL 放入 Supabase 的 Migrations（Projects → Migrations）以便将来追踪。

## 2) 配置 OAuth（Google、GitHub）
在 Supabase 控制台：Authentication → Providers。

- Google / GitHub：填写从 Google Cloud Console / GitHub OAuth Apps 获得的 Client ID 和 Client Secret。
- 回调 URL（redirect URI）必须设置为：
  - `https://<YOUR-SUPABASE-URL>/auth/v1/callback`
  - 例如：`https://xyzcompany.supabase.co/auth/v1/callback`

注意：不需要在应用端写回调处理，supabase-js 会在客户端处理登录回流。

## 3) 环境变量（本地与部署）
在本地创建 `.env.local`（Next.js）或在部署平台（Vercel/Netlify）设置环境变量。

示例 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key-from-supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key-from-supabase
```

说明：
- `NEXT_PUBLIC_*` 前缀会被前端读取（匿名 key）。
- `SUPABASE_SERVICE_ROLE_KEY` 是敏感的服务密钥，仅在服务器端使用（不要暴露给浏览器或提交到源码）。

## 4) 启用 RLS 并添加示例策略
在 SQL Editor 里，针对每个表启用 RLS，并创建策略。下面给出可直接执行的示例（以 `projects`、`comments`、`votes`、`users` 为例）：

-- 启用 RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- projects: 允许所有人读取，认证用户新增，只有作者可更新/删除
CREATE POLICY "projects_select_public" ON public.projects FOR SELECT USING (true);
CREATE POLICY "projects_insert_authenticated" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (author_id = auth.uid());

-- comments: 允许所有人读取，认证用户新增，只有作者可删除
CREATE POLICY "comments_select_public" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_authenticated" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE USING (author_id = auth.uid());

-- votes: 允许所有人读取，认证用户新增/删除（投票取消）
CREATE POLICY "votes_select_public" ON public.votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_authenticated" ON public.votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "votes_delete_own" ON public.votes FOR DELETE USING (user_id = auth.uid());

-- users: 允许用户读取自己的记录，公开只读非敏感字段（如 username / name / avatar_url)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_public_limited" ON public.users FOR SELECT USING (true);
-- 如果你想限制用户只能查看自己完整信息，可以改成：
-- CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (id = auth.uid());

注意：根据你的业务可能需要微调策略（例如 admin 角色、公开字段限制、审核字段等）。

## 5) 验证步骤
1. 用浏览器打开你的前端（或本地运行 `pnpm dev` 并确保 `.env.local` 已正确配置）。
2. 尝试使用邮箱注册（Supabase 邮箱登录）并登录，或使用 Google/GitHub 登录。
3. 在 Supabase → Table Editor 查看 `public.users`，确认新注册的用户被触发器同步（trigger 会在 auth.users 变化时触发）。

如果 `auth.users` 有数据但 `public.users` 为空，可以按下列步骤排查并修复：

 - 确认触发器存在并指向正确表：
```sql
SELECT tgname, tgrelid::regclass AS table, pg_get_triggerdef(oid)
FROM pg_trigger WHERE tgname = 'trg_sync_auth_user';
```

 - 确认触发器函数存在：
```sql
SELECT proname, pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'handle_auth_user_change';
```

 - 查看 `auth.users` 的样例行（确认字段名 / 结构），帮助判断触发器函数是否能正确读取 metadata：
```sql
SELECT id, created_at, row_to_json(auth.users) FROM auth.users LIMIT 5;
```

 - 如果触发器未正确工作，可执行 `1680000000005_full_wipe_and_recreate.sql` 来删除旧触发器与数据并重建一个健壮的触发器实现；如果不想清空数据，先仅执行 `1680000000003_sync_existing_auth_users.sql` 进行一次性同步，或检查触发器/函数定义并修复函数实现后再重试。
4. 在前端尝试提交一个项目、发表评论或投票，确认 API 路由正常工作。

## 6) 服务端与安全注意事项
- 任何需要绕过 RLS（例如后台管理、数据同步脚本）必须使用 `SUPABASE_SERVICE_ROLE_KEY`。该密钥应只在后端安全存储。
- 不要把 `SUPABASE_SERVICE_ROLE_KEY` 放到前端或提交至仓库。

## 7) 可选：从旧 DB 迁移现有数据
- 如果你之前使用 Prisma/SQLite，本地导出数据为 CSV/SQL 后在 Supabase 控制台导入。
- 注意字段名需转换为 snake_case（仓库中 API 已按 snake_case 设计）。

## 8) 常见问题
- 如果 API 返回 NULL 或字段缺失：确认后端查询使用的是 snake_case 列名，前端期待的是 camelCase（仓库里 API 已做了映射）。
- 如果触发器没有同步 `auth.users`：检查触发器 SQL 是否已执行并确认 `auth.users` 表存在于你的 Supabase 项目。

---
若你愿意，我可以把上面生成的一份更精简的 `SUPABASE_SETUP.md` 放到项目根，或者直接把 RLS 策略写成单独的 SQL 文件并提交到 `supabase/migrations/`。要我继续吗？
