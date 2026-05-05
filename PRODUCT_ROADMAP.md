# 有回音 MVP 落地路线

## 当前已完成

- iPhone 优先的 App 界面壳
- 首页闭环收集箱
- 新建事项拆解页
- 事项详情和状态流转
- 周报页
- PWA manifest、App 图标、Service Worker
- Supabase 数据表结构草案

## 下一步

1. 部署到 Vercel，拿到 HTTPS 地址。
2. 在 iPhone Safari 打开，添加到主屏幕。
3. 创建 Supabase 项目，执行 `supabase/schema.sql`。
4. 接入 Supabase Auth 和数据库读写。
5. 接入 OpenAI API，把本地 mock 拆解换成真实 AI。
6. 做站内提醒，再升级到邮件或 iOS Web Push。
