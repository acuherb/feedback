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
        <label for="title">标题 *</label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxlength={200}
          placeholder="请简要描述您的反馈或建议"
        />
      </div>
      <div class="form-group">
        <label for="description">详细描述</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxlength={2000}
          placeholder="补充更多细节（选填）"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="email">邮箱（选填）</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="留下邮箱，状态变化时通知您"
        />
      </div>
      {turnstileSiteKey && (
        <div class="cf-turnstile" data-sitekey={turnstileSiteKey}></div>
      )}
      <button type="submit">提交反馈</button>
    </form>
  )
}
