import sqlite3
from contextlib import contextmanager
from pathlib import Path
from app.core.config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS knowledge_articles (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL,
 content TEXT NOT NULL, keywords TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS escalations (
 id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL,
 category TEXT NOT NULL, reason TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 status TEXT NOT NULL DEFAULT 'open'
);
CREATE TABLE IF NOT EXISTS audit_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL,
 event_type TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""

@contextmanager
def connect():
    path = Path(settings.database_path)
    if str(path) != ":memory:":
        path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

def init_db():
    with connect() as conn:
        conn.executescript(SCHEMA)

def seed_knowledge(articles: list[dict]):
    with connect() as conn:
        for item in articles:
            conn.execute("INSERT OR REPLACE INTO knowledge_articles(id,title,category,content,keywords) VALUES(?,?,?,?,?)",
                         (item['id'], item['title'], item['category'], item['content'], ','.join(item.get('keywords', []))))

def get_knowledge() -> list[dict]:
    with connect() as conn:
        rows = conn.execute("SELECT id,title,category,content,keywords FROM knowledge_articles ORDER BY category,title").fetchall()
        return [dict(r) | {'keywords': [x for x in r['keywords'].split(',') if x]} for r in rows]

def add_escalation(request_id: str, category: str, reason: str) -> int:
    with connect() as conn:
        cur = conn.execute("INSERT INTO escalations(request_id,category,reason) VALUES(?,?,?)", (request_id, category, reason[:240]))
        return int(cur.lastrowid)

def audit(request_id: str, event_type: str, detail: str):
    with connect() as conn:
        conn.execute("INSERT INTO audit_events(request_id,event_type,detail) VALUES(?,?,?)", (request_id, event_type, detail[:240]))


def list_escalations(limit: int = 50) -> list[dict]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, request_id, category, created_at, status FROM escalations ORDER BY id DESC LIMIT ?",
            (max(1, min(int(limit), 100)),),
        ).fetchall()
        return [dict(row) for row in rows]


def get_metrics() -> dict:
    with connect() as conn:
        events = conn.execute("SELECT event_type, COUNT(*) AS count FROM audit_events GROUP BY event_type").fetchall()
        escalation_count = conn.execute("SELECT COUNT(*) FROM escalations").fetchone()[0]
        article_count = conn.execute("SELECT COUNT(*) FROM knowledge_articles").fetchone()[0]
    return {"events": {row["event_type"]: row["count"] for row in events}, "escalations": escalation_count, "knowledge_articles": article_count}
