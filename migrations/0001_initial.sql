-- 帖子表
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  email TEXT,
  votes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 投票表（每位访客对每条反馈只能投一票）
CREATE TABLE votes (
  post_id INTEGER,
  visitor_id TEXT,
  PRIMARY KEY (post_id, visitor_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 使用 FTS5 进行全文搜索（'fts5' 必须小写，D1 上大小写敏感）
-- 使用 trigram 分词器以支持中文子串搜索
CREATE VIRTUAL TABLE posts_fts USING fts5(
  title,
  description,
  content='posts',
  content_rowid='id',
  tokenize='trigram'
);

-- 保持 FTS 索引同步的触发器
CREATE TRIGGER posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER posts_ad AFTER DELETE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, description)
  VALUES('delete', old.id, old.title, old.description);
END;

CREATE TRIGGER posts_au AFTER UPDATE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, description)
  VALUES('delete', old.id, old.title, old.description);
  INSERT INTO posts_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;