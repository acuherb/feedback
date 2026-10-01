export interface Post {
  id: number
  title: string
  description: string | null
  email: string | null
  votes: number
  status: string
  created_at: string
}

export type PostStatus = 'open' | 'planned' | 'in_progress' | 'done' | 'closed'

export type SortOption = 'votes' | 'newest' | 'oldest'

export async function listPosts(
  db: D1Database,
  options: {
    status?: string
    sort?: SortOption
    search?: string
  } = {}
): Promise<Post[]> {
  const { status, sort = 'votes', search } = options

  // 如果提供了搜索词，优先使用 FTS5
  // trigram 分词器要求查询词至少 3 个字符，短词走 LIKE 兜底
  if (search) {
    if (search.length >= 3) {
      const query = `
        SELECT p.* FROM posts p
        INNER JOIN posts_fts ON posts_fts.rowid = p.id
        WHERE posts_fts MATCH ?
        ${status ? 'AND p.status = ?' : ''}
        ORDER BY rank
      `
      const bindings: string[] = [search]
      if (status) bindings.push(status)
      const result = await db.prepare(query).bind(...bindings).all<Post>()
      return result.results
    }

    // 短查询（1-2 个字符）：使用 LIKE 模糊匹配兜底
    const like = `%${search}%`
    const query = `
      SELECT * FROM posts
      WHERE (title LIKE ? OR description LIKE ?)
      ${status ? 'AND status = ?' : ''}
      ORDER BY votes DESC, created_at DESC
    `
    const bindings = status ? [like, like, status] : [like, like]
    const result = await db.prepare(query).bind(...bindings).all<Post>()
    return result.results
  }

  // 标准列表展示，可选状态过滤
  let orderClause: string
  switch (sort) {
    case 'newest': orderClause = 'p.created_at DESC'; break
    case 'oldest': orderClause = 'p.created_at ASC'; break
    default: orderClause = 'p.votes DESC, p.created_at DESC'; break
  }

  const query = `
    SELECT p.* FROM posts p
    ${status ? 'WHERE p.status = ?' : ''}
    ORDER BY ${orderClause}
  `
  const bindings: string[] = []
  if (status) bindings.push(status)
  const result = await db.prepare(query).bind(...bindings).all<Post>()
  return result.results
}

export async function getPost(db: D1Database, id: number): Promise<Post | null> {
  const result = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first<Post>()
  return result
}

export async function createPost(
  db: D1Database,
  data: { title: string; description?: string; email?: string }
): Promise<Post> {
  const result = await db
    .prepare('INSERT INTO posts (title, description, email) VALUES (?, ?, ?) RETURNING *')
    .bind(data.title, data.description || null, data.email || null)
    .first<Post>()
  if (!result) {
    throw new Error('创建反馈失败：未返回数据行')
  }
  return result
}

export async function toggleVote(
  db: D1Database,
  postId: number,
  visitorId: string
): Promise<{ voted: boolean; votes: number }> {
  // 尝试插入投票；如果已存在（唯一约束），则 IGNORE
  const insertResult = await db
    .prepare('INSERT OR IGNORE INTO votes (post_id, visitor_id) VALUES (?, ?)')
    .bind(postId, visitorId)
    .run()

  if (insertResult.meta.changes > 0) {
    // 插入成功——新增投票
    await db.prepare('UPDATE posts SET votes = votes + 1 WHERE id = ?')
      .bind(postId).run()
  } else {
    // 插入被忽略——已经投过票，因此移除投票
    await db.prepare('DELETE FROM votes WHERE post_id = ? AND visitor_id = ?')
      .bind(postId, visitorId).run()
    await db.prepare('UPDATE posts SET votes = votes - 1 WHERE id = ?')
      .bind(postId).run()
  }

  const post = await db.prepare('SELECT votes FROM posts WHERE id = ?')
    .bind(postId).first<{ votes: number }>()
  if (!post) {
    throw new Error('投票切换后未找到该反馈')
  }

  return { voted: insertResult.meta.changes > 0, votes: post.votes }
}

export async function hasVoted(
  db: D1Database,
  postId: number,
  visitorId: string
): Promise<boolean> {
  const result = await db
    .prepare('SELECT 1 FROM votes WHERE post_id = ? AND visitor_id = ?')
    .bind(postId, visitorId)
    .first()
  return !!result
}

export async function getVotedPostIds(
  db: D1Database,
  postIds: number[],
  visitorId: string
): Promise<Set<number>> {
  if (postIds.length === 0) return new Set()
  const placeholders = postIds.map(() => '?').join(',')
  const result = await db
    .prepare(`SELECT post_id FROM votes WHERE visitor_id = ? AND post_id IN (${placeholders})`)
    .bind(visitorId, ...postIds)
    .all<{ post_id: number }>()
  return new Set(result.results.map((r) => r.post_id))
}

export async function updatePostStatus(
  db: D1Database,
  id: number,
  status: PostStatus
): Promise<Post | null> {
  const result = await db
    .prepare('UPDATE posts SET status = ? WHERE id = ? RETURNING *')
    .bind(status, id)
    .first<Post>()
  return result
}

export async function deletePost(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run()
  return result.meta.changes > 0
}