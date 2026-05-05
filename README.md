# 有回音

AI 闭环习惯训练工具。把承诺、任务和沟通变成可追踪的闭环，让每件事都有交代。

## 本地运行

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`。

## 当前版本

- iPhone 优先 PWA App 界面
- 闭环收集箱
- AI 拆解 mock
- 事项详情和状态流转
- 周报页
- PWA manifest、App 图标、Service Worker

## 后续接入

复制 `.env.example` 为 `.env.local`，填入 Supabase 和 OpenAI 配置。

Supabase 表结构在 `supabase/schema.sql`。

## 接入 Supabase

1. 在 Supabase 新建项目。
2. 打开 SQL Editor，执行 `supabase/schema.sql`。
3. 在项目根目录创建 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的项目 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon 或 publishable key
```

4. 在 Supabase Auth 的 URL Configuration 里，把本地和线上地址加入 Redirect URLs，例如：

```text
http://localhost:3000
http://localhost:3001
你的线上域名
```

配置完成后，应用会自动从“本地预览”切换为“云端数据库”模式。
