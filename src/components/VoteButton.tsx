import type { FC } from 'hono/jsx'

type VoteButtonProps = {
  postId: number
  votes: number
  voted: boolean
}

export const VoteButton: FC<VoteButtonProps> = ({ postId, votes, voted }) => {
  return (
    <form
      action={`/posts/${postId}/vote`}
      method="POST"
      hx-post={`/posts/${postId}/vote`}
      hx-swap="outerHTML"
      class="vote-form"
    >
      <button type="submit" class={`vote-button ${voted ? 'voted' : ''}`}>
        <span class="vote-arrow">{voted ? '\u25B2' : '\u25B3'}</span>
        <span class="vote-count">{votes}</span>
      </button>
    </form>
  )
}
