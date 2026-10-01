import type { FC, PropsWithChildren } from 'hono/jsx'
import { ThemeToggle } from './ThemeToggle'

type LayoutProps = PropsWithChildren<{
  title?: string
  includeTurnstile?: boolean
  theme?: 'light' | 'dark'
}>

export const Layout: FC<LayoutProps> = ({ title, includeTurnstile, theme = 'light', children }) => {
  return (
    <html lang="en" class={theme === 'dark' ? 'theme-dark' : ''}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title ? `${title} - Holler` : 'Holler'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" />
        <link rel="stylesheet" href="/styles.css" />
        <script src="https://unpkg.com/htmx.org@2.0.4" integrity="sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+" crossorigin="anonymous"></script>
        <style dangerouslySetInnerHTML={{ __html: '.js-enabled .noscript-submit { display: none; }' }} />
        <script dangerouslySetInnerHTML={{ __html: '(function(){var d=document.documentElement;d.classList.add("js-enabled");var t=localStorage.getItem("holler-theme");if(!t){t=window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";localStorage.setItem("holler-theme",t);}if(t==="dark")d.classList.add("theme-dark");else d.classList.remove("theme-dark");})();' }} />
        {includeTurnstile && (
          <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
        )}
      </head>
      <body>
        <header>
          <div class="header-row">
            <a href="/">
              <h1>Holler</h1>
            </a>
            <ThemeToggle currentTheme={theme} />
          </div>
          <p>Share your feedback and feature requests</p>
        </header>
        <main>
          {children}
        </main>
        <footer>
          <p>Powered by <a href="https://github.com/wassertim/holler">Holler</a></p>
        </footer>
        <script src="/theme.js"></script>
      </body>
    </html>
  )
}
