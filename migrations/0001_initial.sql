-- Posts table
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  email TEXT,
  votes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Votes table (one vote per visitor per post)
CREATE TABLE votes (
  post_id INTEGER,
  visitor_id TEXT,
  PRIMARY KEY (post_id, visitor_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Full-text search with FTS5 (use lowercase 'fts5' -- case-sensitive on D1)
CREATE VIRTUAL TABLE posts_fts USING fts5(
  title,
  description,
  content='posts',
  content_rowid='id'
);

-- Triggers to keep FTS index in sync
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
