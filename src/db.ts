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

  // If search query provided, use FTS5
  if (search) {
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

  // Standard listing with optional status filter
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
    throw new Error('Failed to create post: no row returned')
  }
  return result
}

export async function toggleVote(
  db: D1Database,
  postId: number,
  visitorId: string
): Promise<{ voted: boolean; votes: number }> {
  // Try to insert the vote; IGNORE if it already exists (unique constraint)
  const insertResult = await db
    .prepare('INSERT OR IGNORE INTO votes (post_id, visitor_id) VALUES (?, ?)')
    .bind(postId, visitorId)
    .run()

  if (insertResult.meta.changes > 0) {
    // Insert succeeded — new vote
    await db.prepare('UPDATE posts SET votes = votes + 1 WHERE id = ?')
      .bind(postId).run()
  } else {
    // Insert was ignored — already voted, so remove it
    await db.prepare('DELETE FROM votes WHERE post_id = ? AND visitor_id = ?')
      .bind(postId, visitorId).run()
    await db.prepare('UPDATE posts SET votes = votes - 1 WHERE id = ?')
      .bind(postId).run()
  }

  const post = await db.prepare('SELECT votes FROM posts WHERE id = ?')
    .bind(postId).first<{ votes: number }>()
  if (!post) {
    throw new Error('Post not found after vote toggle')
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
