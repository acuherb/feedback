# CLAUDE.md

Lightweight, open-source feedback board. HTMX + Cloudflare Workers + D1. Deploy in one click.

## CRITICAL RULE - READ FIRST

**NEVER ADD CLAUDE ATTRIBUTION ANYWHERE - EVER**

No mentions of AI assistance, Claude, or automated generation in:

- Git commits or PR descriptions
- Code comments or documentation
- GitHub issues or any output

**This rule has ZERO EXCEPTIONS.**

## Development Principles

**YAGNI** - Build only what's needed now. No speculative features.

**KISS** - Simplest solution that works. No premature optimization.

**Good Architecture** - Clean separation of concerns, predictable patterns, maintainable structure.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTMX + minimal CSS |
| Templating | Hono JSX (server-rendered) |
| API | Cloudflare Workers + Hono |
| Database | D1 (SQLite) + FTS5 for search |
| Spam prevention | Turnstile |
| Admin auth | Cloudflare Access or simple token |

## Project Structure

```
holler/
├── src/
│   ├── index.tsx         # Worker entry + Hono routes
│   ├── db.ts             # D1 queries
│   ├── components/       # Hono JSX components
│   │   ├── Layout.tsx    # HTML shell, head, HTMX/CSS includes
│   │   ├── PostCard.tsx  # Single feedback post display
│   │   ├── PostForm.tsx  # Feedback submission form
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

## Key Patterns

### HTMX

- Use `hx-post`, `hx-get`, `hx-swap`, `hx-target` for interactions
- Progressive enhancement: wrap HTMX elements in `<form>` for no-JS fallback
- Return HTML fragments from API endpoints for HTMX swaps
- Check `c.req.header('HX-Request')` to detect HTMX vs full page requests

### Hono JSX

- All HTML is server-rendered via Hono JSX components
- Use `c.html(...)` to return HTML responses
- Layout component wraps all pages with `<head>`, HTMX script, CSS

### D1 / SQLite

- Access via `c.env.DB` binding
- Parameterized queries: `db.prepare('...').bind(val).all()`
- FTS5 for full-text search
- Migrations in `migrations/` directory

### Cloudflare Workers

- Bindings in `wrangler.toml`
- Turnstile verification via `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- Deploy: `wrangler deploy`
- Local dev: `wrangler dev`

## Commands

```bash
npm run dev        # Local development with wrangler
npm run build      # Build for production
npm run deploy     # Deploy to Cloudflare Workers
```

## AI Commands

| Command | Description |
|---------|-------------|
| `/implement [issue] [--auto]` | Implement feature with autonomous or classical mode |
| `/review` | Review current PR and post review to GitHub |
| `/fix-remarks [all \| specific]` | Fix PR review comments |
| `/brainstorm [idea]` | Interactive discovery to refine vague ideas into clear task specs |

## AI Agents

| Agent | Model | Use Case |
|-------|-------|----------|
| `implementation-planner` | opus | Feature planning with phases and dependency analysis |
| `holler-coder` | opus | Implements single phases from plans (fresh context) |
| `code-reviewer` | opus | Reviews PR changes and posts to GitHub via bot token |
| `technical-researcher` | opus | Researches technical topics, patterns, and competitor approaches |

## GitHub Bot

Reviews are posted via a bot account using `.claude/scripts/gh-bot`. Set `GH_BOT_TOKEN` environment variable with a GitHub PAT that has repo access.

## Self-Hosting

One-click deploy via "Deploy to Cloudflare" button. D1 database + migrations auto-provisioned. Users only need to create a Turnstile widget manually.
