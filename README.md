# 反馈板

为观颐斋收集功能请求和反馈。开源、易于品牌化、一键部署。

无需服务器。无需容器。无需管理数据库。完全运行在 Cloudflare 免费层上，永久免费运行。

**在线地址**：<https://feedback.acuherb.xyz>

## 功能

- **投票**——每位访客一票
- **全文搜索**——由 SQLite FTS5 提供支持，支持中文子串搜索
- **状态跟踪**——开放中、已计划、进行中、已完成、已关闭
- **管理员控制**——更新状态和删除帖子
- **防垃圾**——Cloudflare Turnstile（免费）
- **无需 JavaScript 也能工作**——渐进增强
- **亮色 / 暗色主题**——跟随系统或手动切换

## 工作原理

反馈板运行在 [Cloudflare Workers](https://workers.cloudflare.com/) 上，使用 [D1](https://developers.cloudflare.com/d1/) SQLite 数据库。UI 是服务端渲染的 HTML，并通过 [HTMX](https://htmx.org/) 增强——无需前端构建步骤，无需客户端框架。

## 部署

本项目通过 Cloudflare Workers Builds 自动部署：

- 推送到 `main` 分支 → Cloudflare 自动构建并部署
- 生产地址：<https://feedback.acuherb.xyz>
- 默认地址：<https://feedback.14650990.workers.dev>

如果你要自己部署一份：

1. Fork 本仓库；
2. 在 Cloudflare 控制台创建 D1 数据库 `feedback-db`，复制其 UUID；
3. 修改 `wrangler.toml` 中的 `database_id`；
4. 在 Cloudflare 控制台用 Git 集成创建 Worker，关联本仓库；
5. 首次部署后，在 D1 控制台执行 `migrations/0001_initial.sql` 创建表结构；
6. 可选配置 Turnstile 和管理员 token，详见[设置指南](docs/setup.md)。

## 本地开发

```bash
git clone https://github.com/acuherb/feedback.git
cd feedback
npm install
npx wrangler d1 migrations apply feedback-db --local
npm run dev
```

在 `http://localhost:8787` 打开。本地会跳过 Turnstile。管理员访问和配置请参阅[设置指南](docs/setup.md)。

## 管理反馈

设置 `ADMIN_TOKEN` 后，通过以下地址进入管理员模式：

```
https://feedback.acuherb.xyz/?token=你的ADMIN_TOKEN
```

进入后每条反馈下方会显示状态下拉菜单和删除按钮。

## 配置

| 变量 | 说明 |
|------|------|
| `ADMIN_TOKEN` | 管理员令牌，用于状态更新和删除操作 |
| `TURNSTILE_SITE_KEY` | Turnstile 站点密钥（前端渲染） |
| `TURNSTILE_SECRET` | Turnstile 密钥（服务端验证） |

在 Cloudflare 控制台 → Worker → **Settings** → **Variables and Secrets** 中设置。

## 致谢

本项目基于 [wassertim/holler](https://github.com/wassertim/holler) 修改和汉化，感谢原作者的开源工作。

## 许可证

MIT
