# 设置指南

## 前置条件

- [Node.js](https://nodejs.org/)（v18+）
- 一个 [Cloudflare 账户](https://dash.cloudflare.com/sign-up)（免费层即可）

## 本地开发

```bash
git clone https://github.com/wassertim/holler.git
cd holler
npm install
npx wrangler d1 migrations apply holler-db --local
npm run dev
```

这会在 `http://localhost:8787` 启动一个本地服务器，并使用本地 D1 数据库。首次运行前必须先应用迁移。

当未配置 `TURNSTILE_SECRET` 时，会跳过 Turnstile 验证，因此本地开发无需任何设置即可运行。

### 管理员访问（本地）

在项目根目录创建 `.dev.vars` 文件：

```
ADMIN_TOKEN=test123
```

然后访问 `http://localhost:8787/?token=test123`，即可在每个帖子上看到管理员控件（状态下拉菜单、删除按钮）。

## 手动部署

如果你更喜欢手动部署，而不是使用一键按钮：

### 1. 创建 D1 数据库

```bash
npx wrangler d1 create holler-db
```

从输出中复制 `database_id`，并更新 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "holler-db"
database_id = "your-database-id-here"
migrations_dir = "migrations"
```

### 2. 部署

```bash
npm run deploy
```

这会在部署前自动应用 D1 迁移。

### 3. 设置 Turnstile（可选）

Turnstile 是 Cloudflare 提供的免费、隐私友好的 CAPTCHA 替代方案。它可以保护反馈表单免受垃圾提交。

#### 创建 Turnstile 小部件

1. 前往 [Cloudflare 仪表板](https://dash.cloudflare.com/)，导航到 **Turnstile**
2. 选择 **添加小部件**
3. 输入**小部件名称**（例如 “Holler Feedback”）
4. 在 **主机名管理** 下，添加将部署 Holler 的域名
5. 选择**小部件模式**：
   - **托管**（推荐）——由 Cloudflare 决定是否需要交互
   - **非交互式**——访客无需交互，挑战在后台运行
   - **不可见**——完全不显示小部件
6. 点击 **创建**
7. 复制你的 **站点密钥** 和 **密钥**

#### 配置密钥

```bash
npx wrangler secret put TURNSTILE_SITE_KEY
# 提示时粘贴你的站点密钥

npx wrangler secret put TURNSTILE_SECRET
# 提示时粘贴你的密钥
```

站点密钥会嵌入 HTML 表单中以渲染小部件。密钥用于服务端，通过 [Turnstile siteverify API](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) 验证令牌。

### 4. 设置管理员认证（可选）

```bash
npx wrangler secret put ADMIN_TOKEN
# 提示时输入一个安全令牌
```

在任何页面 URL 后附加 `?token=YOUR_TOKEN` 即可进入管理员模式。

## 环境变量

| 变量 | 必需 | 描述 |
|----------|----------|-------------|
| `TURNSTILE_SITE_KEY` | 否 | Turnstile 小部件公钥。未设置时表单提交无需验证码。 |
| `TURNSTILE_SECRET` | 否 | 用于服务端验证的 Turnstile 密钥。未设置时跳过验证。 |
| `ADMIN_TOKEN` | 否 | 管理员访问令牌。未设置时管理员路由返回 503。 |

本地开发时，将这些放入 `.dev.vars` 文件。生产环境请使用 `npx wrangler secret put <NAME>`。

## 命令

| 命令 | 描述 |
|---------|-------------|
| `npm run dev` | 使用 wrangler 进行本地开发 |
| `npm run build` | 生产构建（试运行） |
| `npm run deploy` | 应用迁移并部署到 Cloudflare Workers |

## 项目结构

```
holler/
├── src/
│   ├── index.tsx          # Worker 入口 + Hono 路由
│   ├── db.ts              # D1 查询 + 类型
│   └── components/
│       ├── Layout.tsx      # HTML 外壳、HTMX/CSS 引入
│       ├── PostCard.tsx    # 反馈帖展示
│       ├── PostForm.tsx    # 提交表单
│       └── VoteButton.tsx  # 投票切换按钮
├── migrations/
│   └── 0001_initial.sql   # D1 模式（posts、votes、FTS5）
├── public/
│   └── styles.css         # 极简自定义 CSS
├── wrangler.toml
└── package.json
```