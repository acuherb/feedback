# CLAUDE.md

轻量级、开源反馈板。HTMX + Cloudflare Workers + D1。一键部署。

## 关键规则——首先阅读

**任何地方都绝不要添加 CLAUDE 署名——永远不要**

不得在以下位置提及 AI 协助、Claude 或自动生成：

- Git 提交或 PR 描述
- 代码注释或文档
- GitHub issue 或任何输出

**此规则零例外。**

## 开发原则

**YAGNI**——只构建当前所需。不要推测性功能。

**KISS**——能工作的最简单方案。不要过早优化。

**良好架构**——关注点清晰分离、模式可预测、结构可维护。

## 技术栈

| 层级 | 技术 |
|-------|------------|
| 前端 | HTMX + 极简 CSS |
| 模板 | Hono JSX（服务端渲染） |
| API | Cloudflare Workers + Hono |
| 数据库 | D1 (SQLite) + FTS5 用于搜索 |
| 防垃圾 | Turnstile |
| 管理员认证 | Cloudflare Access 或简单 token |

## 项目结构

```
holler/
├── src/
│   ├── index.tsx         # Worker 入口 + Hono 路由
│   ├── db.ts             # D1 查询
│   ├── components/       # Hono JSX 组件
│   │   ├── Layout.tsx    # HTML 外壳、head、HTMX/CSS 引入
│   │   ├── PostCard.tsx  # 单条反馈帖展示
│   │   ├── PostForm.tsx  # 反馈提交表单
│   │   └── VoteButton.tsx
│   └── schema.sql
├── migrations/
│   └── 0001_initial.sql
├── public/
│   └── styles.css
├── wrangler.toml
├── package.json
└── CLAUDE.md
```

## 关键模式

### HTMX

- 使用 `hx-post`、`hx-get`、`hx-swap`、`hx-target` 进行交互
- 渐进增强：将 HTMX 元素包裹在 `<form>` 中，作为无 JS 回退
- 从 API 端点返回 HTML 片段，用于 HTMX 交换
- 检查 `c.req.header('HX-Request')` 以区分 HTMX 请求与完整页面请求

### Hono JSX

- 所有 HTML 都通过 Hono JSX 组件服务端渲染
- 使用 `c.html(...)` 返回 HTML 响应
- Layout 组件用 `<head>`、HTMX script、CSS 包裹所有页面

### D1 / SQLite

- 通过 `c.env.DB` 绑定访问
- 参数化查询：`db.prepare('...').bind(val).all()`
- 使用 FTS5 进行全文搜索
- 迁移文件位于 `migrations/` 目录

### Cloudflare Workers

- 绑定配置在 `wrangler.toml`
- 通过 `https://challenges.cloudflare.com/turnstile/v0/siteverify` 进行 Turnstile 验证
- 部署：`wrangler deploy`
- 本地开发：`wrangler dev`

## 命令

```bash
npm run dev        # 使用 wrangler 进行本地开发
npm run build      # 生产构建
npm run deploy     # 部署到 Cloudflare Workers
```

## AI 命令

| 命令 | 描述 |
|---------|-------------|
| `/implement [issue] [--auto]` | 以自主模式或经典模式实现功能 |
| `/review` | 审查当前 PR 并将审查结果发布到 GitHub |
| `/fix-remarks [all \| specific]` | 修复 PR 审查评论 |
| `/brainstorm [idea]` | 交互式发现，将模糊想法精炼为清晰的任务规格 |

## AI 代理

| 代理 | 模型 | 用例 |
|-------|-------|----------|
| `implementation-planner` | opus | 功能规划，包含阶段和依赖分析 |
| `holler-coder` | opus | 从计划中实现单个阶段（全新上下文） |
| `code-reviewer` | opus | 审查 PR 变更，并通过 bot token 发布到 GitHub |
| `technical-researcher` | opus | 研究技术主题、模式和竞品方法 |

## GitHub Bot

审查通过机器人账号使用 `.claude/scripts/gh-bot` 发布。设置 `GH_BOT_TOKEN` 环境变量，值为具有 repo 访问权限的 GitHub PAT。

## 自托管

通过 “Deploy to Cloudflare” 按钮一键部署。D1 数据库 + 迁移自动配置。用户只需手动创建 Turnstile 小部件。