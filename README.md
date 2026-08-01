# 你的无畏契约本命特工是谁？

移动端人格测试 H5 Beta。用户完成 10 题后获得本命特工、专属传播文案与可保存的竖版海报。

## 本地启动

```bash
pnpm install
pnpm run dev
```

本环境未预装全局 npm 时，可使用 `pnpm` 或本地 Node 运行 `next dev`。生产检查执行 `pnpm run build`。

## 环境变量

复制 `.env.example` 为 `.env`。`DATABASE_URL` 配置 PostgreSQL 后，`/api/analytics` 会持久化事件；未配置时埋点安全降级，不影响用户闭环。

| 变量 | 用途 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `NEXT_PUBLIC_APP_URL` | 部署后的站点地址，例如 `https://your-project.vercel.app` |
| `ADMIN_SECRET` | 管理后台登录口令；生产环境必须使用高强度随机值 |
| `NEXT_PUBLIC_ADS_ENABLED` | 预留广告开关，Beta 保持关闭 |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | 预留支付开关，Beta 保持关闭 |

## 部署

项目兼容 Vercel。完整流程：

1. 在 GitHub 新建仓库 `valorant-personality-test-h5`（显示名称可使用“无畏契约人格测试H5”），提交并推送当前项目。
2. 登录 Vercel，选择 **Add New → Project**，导入该 GitHub 仓库；Framework Preset 保持 Next.js，构建命令使用默认值。
3. 在 Vercel Project Settings → Environment Variables 配置 `DATABASE_URL`、`ADMIN_SECRET`、`NEXT_PUBLIC_APP_URL`，三者均选择 Production 环境。
4. 在连接到生产 PostgreSQL 的安全终端执行 `npx prisma generate`，随后执行 `npx prisma db push`。
5. 在 Vercel 触发 Production Deployment；部署完成后使用 Vercel 分配的 `https://*.vercel.app` 地址完成 10 题并验证海报保存。
6. 访问 `/admin/login` 输入 `ADMIN_SECRET`，确认概览页记录新增事件；`/admin/overview` 与统计 API 对未授权访问返回 404。

部署前必须同步数据库，使 `UserEvent` 的 `eventType`、`source`、`agentResult` 与索引写入数据库。

## 手机 Beta 测试流程

1. 用微信或抖音打开测试链接，例如 `https://example.com/?source=wechat`、`?source=douyin` 或分享链接 `?source=share`。
2. 完成 10 道题，确认扫描动画、结果页首屏、稀有度标签和完整报告入口正常。
3. 点击“看看你的队友是什么特工人格”；系统分享不可用时，点击“生成我的本命特工海报”，长按预览图保存分享。
4. 刷新结果页，确认分享奖励的 30 分钟完整版仍保持解锁。
5. 记录机型、浏览器版本、图片保存表现与异常截图。

## 项目目录

```text
src/app                 Next.js 页面与 API
src/components/home     首页动效
src/components/test     题目流程与交互
src/components/result   结果、报告和海报
src/data                29 名特工与 10 道题数据
src/lib                 匹配、埋点、分享奖励等逻辑
src/store               Zustand 持久化状态
src/config              Beta 功能配置
public/images           本地头像占位资源
```

## 渠道与漏斗数据

链接支持 `?source=douyin`、`?source=wechat`、`?source=friend`、`?source=share`，未传入时归为 `direct`。所有埋点会写入来源字段，覆盖 `page_view`、`question_start`、题目查看/作答/流失、完成、特工结果、海报生成和分享点击。配置数据库后访问 `/admin/overview` 可查看 PV、开始/完成测试人数、完成率、分享率与英雄 TOP 10。

## 后续商业模块接入位置

Beta 不启用广告或支付。后续可通过 `src/config/appConfig.json` 与 `src/lib/featureFlag.ts` 启用开关；广告位在 `src/components/ads`，支付统一入口在 `src/lib/paymentService.ts`，无需改动测试主链路。
