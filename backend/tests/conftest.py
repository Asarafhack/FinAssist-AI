import os
import tempfile
import pytest
from fastapi.testclient import TestClient
from app.core.config import settings
from app.db.database import init_db, seed_knowledge
from app.seed import ARTICLES
from app.main import app

@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, 'database_path', str(tmp_path / 'test.db'))
    init_db(); seed_knowledge(ARTICLES)
    with TestClient(app) as c:
        yield c
