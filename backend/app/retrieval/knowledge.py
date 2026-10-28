import re
from app.db.database import get_knowledge

STOP = {"the","a","an","is","are","i","my","me","to","for","of","and","or","in","on","can","you","please","what","how","do","does","with","about","tell","give","this","that"}
def tokens(text: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOP and len(w) > 1}

def retrieve(query: str, limit: int = 3) -> list[dict]:
    q = tokens(query)
    if not q:
        return []
    scored = []
    for article in get_knowledge():
        body = f"{article['title']} {article['category']} {article['content']} {' '.join(article['keywords'])}"
        body_tokens = tokens(body)
        overlap = len(q & body_tokens)
        # Query coverage penalizes generic articles; exact keyword/title matches receive a small boost.
        score = overlap / max(len(q), 1)
        title_tokens = tokens(article['title'])
        score += 0.18 * len(q & title_tokens) / max(len(q), 1)
        if score > 0:
            scored.append((score, article))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [{**article, 'score': round(score, 4)} for score, article in scored[:limit]]
