import type { FC } from 'hono/jsx'
import type { Post } from '../db'
import { VoteButton } from './VoteButton'

type PostCardProps = {
  post: Post
  voted: boolean
  isAdmin?: boolean
  adminToken?: string
}

const statusLabels: Record<string, string> = {
  open: 'Open',
  planned: 'Planned',
  in_progress: 'In Progress',
  done: 'Done',
  closed: 'Closed',
}

const allStatuses = ['open', 'planned', 'in_progress', 'done', 'closed']

export const PostCard: FC<PostCardProps> = ({ post, voted, isAdmin, adminToken }) => {
  return (
    <article class="post-card">
      <VoteButton postId={post.id} votes={post.votes} voted={voted} />
      <div class="post-content">
        <h2 class="post-title">{post.title}</h2>
        {post.description && <p class="post-description">{post.description}</p>}
        <div class="post-meta">
          <span class={`status-badge status-${post.status}`}>
            {statusLabels[post.status] || post.status}
          </span>
          <time datetime={post.created_at}>{post.created_at}</time>
        </div>
        {isAdmin && (
          <form class="admin-controls" method="post" action={`/posts/${post.id}/status?token=${adminToken}`}>
            <select
              name="status"
              hx-post={`/posts/${post.id}/status`}
              hx-headers={JSON.stringify({ Authorization: `Bearer ${adminToken}` })}
              hx-trigger="change"
              hx-target="closest .post-card"
              hx-swap="outerHTML"
            >
              {allStatuses.map((s) => (
                <option value={s} selected={post.status === s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
            <button type="submit" class="noscript-submit">Update</button>
            <button
              type="button"
              hx-delete={`/posts/${post.id}`}
              hx-headers={JSON.stringify({ Authorization: `Bearer ${adminToken}` })}
              hx-target="closest .post-card"
              hx-swap="outerHTML"
              hx-confirm="Delete this post?"
              class="delete-button"
            >
              Delete
            </button>
          </form>
        )}
      </div>
    </article>
  )
}
