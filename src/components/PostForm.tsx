import type { FC } from 'hono/jsx'

type PostFormProps = {
  turnstileSiteKey?: string
}

export const PostForm: FC<PostFormProps> = ({ turnstileSiteKey }) => {
  return (
    <form
      action="/posts"
      method="POST"
      hx-post="/posts"
      hx-target="#post-list"
      hx-swap="afterbegin"
      hx-on--after-request="if(event.detail.successful) this.reset()"
      class="post-form"
    >
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxlength={200}
          placeholder="What's your feedback or feature request?"
        />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxlength={2000}
          placeholder="Add more details (optional)"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="email">Email (optional)</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Get notified about updates"
        />
      </div>
      {turnstileSiteKey && (
        <div class="cf-turnstile" data-sitekey={turnstileSiteKey}></div>
      )}
      <button type="submit">Submit Feedback</button>
    </form>
  )
}
