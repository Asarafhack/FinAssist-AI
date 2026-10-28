import httpx
from app.core.config import settings
from app.services import llm

def test_llm_adapter_uses_grounding_context(monkeypatch):
    monkeypatch.setattr(settings, 'llm_api_key', 'test-secret')
    monkeypatch.setattr(settings, 'llm_base_url', 'https://example.test/v1')
    monkeypatch.setattr(settings, 'llm_model', 'test-model')
    captured = {}
    class Response:
        def raise_for_status(self): pass
        def json(self): return {'choices':[{'message':{'content':'Use the official portal and keep your receipt.'}}]}
    def fake_post(url, **kwargs):
        captured['url'] = url
        captured.update(kwargs)
        return Response()
    monkeypatch.setattr(llm.httpx, 'post', fake_post)
    answer = llm.generate_grounded_answer('How do I resolve a payment?', [{'id':'payment','title':'Payment help','content':'Keep the transaction reference.'}])
    assert answer == 'Use the official portal and keep your receipt.'
    assert captured['url'] == 'https://example.test/v1/chat/completions'
    assert captured['json']['model'] == 'test-model'
    assert 'Keep the transaction reference.' in captured['json']['messages'][1]['content']
    assert captured['headers']['Authorization'] == 'Bearer test-secret'

def test_llm_adapter_falls_back_on_provider_error(monkeypatch):
    monkeypatch.setattr(settings, 'llm_api_key', 'test-secret')
    monkeypatch.setattr(settings, 'llm_base_url', 'https://example.test/v1')
    def fail(*args, **kwargs): raise httpx.TimeoutException('provider timed out')
    monkeypatch.setattr(llm.httpx, 'post', fail)
    answer = llm.generate_grounded_answer('question', [{'id':'a','title':'A','content':'Grounded facts.'}])
    assert answer is None

def test_llm_adapter_is_disabled_without_key(monkeypatch):
    monkeypatch.setattr(settings, 'llm_api_key', None)
    answer = llm.generate_grounded_answer('question', [{'id':'a','title':'A','content':'Grounded facts.'}])
    assert answer is None


def test_llm_adapter_redacts_common_pii_before_provider(monkeypatch):
    monkeypatch.setattr(settings, 'llm_api_key', 'test-secret')
    captured = {}
    class Response:
        def raise_for_status(self): pass
        def json(self): return {'choices':[{'message':{'content':'Use the official channel.'}}]}
    def fake_post(url, **kwargs):
        captured['body'] = kwargs['json']
        return Response()
    monkeypatch.setattr(llm.httpx, 'post', fake_post)
    llm.generate_grounded_answer('Contact me at person@example.com or 9876543210', [{'id':'a','title':'A','content':'Use official support.'}])
    question = captured['body']['messages'][1]['content']
    assert 'person@example.com' not in question
    assert '9876543210' not in question
    assert '[REDACTED_EMAIL]' in question
