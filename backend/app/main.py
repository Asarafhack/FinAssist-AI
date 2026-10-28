from contextlib import asynccontextmanager
from uuid import uuid4
import re
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db, seed_knowledge, get_knowledge, add_escalation, audit, list_escalations, get_metrics
from app.retrieval.knowledge import retrieve
from app.schemas import ChatRequest, ChatResponse, Source, EscalationRequest, EscalationResponse
from app.seed import ARTICLES
from app.services.safety import detect_injection, escalation_category, redact_pii
from app.services.llm import generate_grounded_answer, PROMPT_VERSION

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_knowledge(ARTICLES)
    yield

app = FastAPI(title=settings.app_name, version="1.0.0", description="Grounded synthetic financial-support agent demo; not a real financial institution.", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=False, allow_methods=["GET", "POST", "OPTIONS"], allow_headers=["*"])

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    candidate_id = request.headers.get("X-Request-ID", "")[:100]
    request.state.request_id = candidate_id if re.fullmatch(r"[A-Za-z0-9._:-]{1,100}", candidate_id) else str(uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response

@app.get("/health")
def health():
    return {"status":"ok", "service":"finassist-ai", "mode":"llm_configured" if settings.llm_enabled else "deterministic_demo", "llm_configured":settings.llm_enabled, "llm_model":settings.llm_model if settings.llm_enabled else None, "prompt_version":PROMPT_VERSION, "production_ready":False}

@app.get("/api/knowledge")
def knowledge():
    articles = get_knowledge()
    return {"items":[{"id":a['id'],"title":a['title'],"category":a['category']} for a in articles], "count":len(articles), "source":"synthetic demonstration content"}

@app.get("/api/escalations")
def escalations():
    # Deliberately excludes the reason field to keep potentially sensitive context out of the dashboard list.
    items = list_escalations()
    return {"items": items, "count": len(items)}

@app.get("/api/metrics")
def metrics():
    return get_metrics()

@app.post("/api/escalations", response_model=EscalationResponse)
def create_escalation(payload: EscalationRequest):
    escalation_id = add_escalation(payload.request_id, payload.category, redact_pii(payload.reason))
    audit(payload.request_id, "escalation_created", payload.category)
    return EscalationResponse(escalation_id=escalation_id)

@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, request: Request):
    request_id = request.state.request_id
    message = payload.message.strip()
    # Never persist raw message text. Audit only the category and a redacted, bounded summary.
    if not message:
        raise HTTPException(status_code=422, detail="Message cannot be blank")
    if detect_injection(message):
        audit(request_id, "request_refused", "instruction_override_pattern_detected")
        return ChatResponse(request_id=request_id, answer="I can only help with supported financial-support topics using the demonstration knowledge base. I can't override safety rules or reveal hidden instructions.", status="refused", escalated=False)
    category = escalation_category(message)
    if category:
        escalation_id = add_escalation(request_id, category, redact_pii(message))
        audit(request_id, "request_escalated", category)
        return ChatResponse(request_id=request_id, answer="This request needs a verified support channel or human review. I recorded a simulated escalation in this local demo; no real support team was contacted.", status="escalated", escalated=True, escalation_id=escalation_id)
    results = retrieve(message)
    if not results or results[0]['score'] < settings.retrieval_threshold:
        audit(request_id, "clarification_needed", "insufficient_knowledge_match")
        return ChatResponse(request_id=request_id, answer="I don't have enough supported information to answer that reliably. Could you clarify whether your question is about application documents, repayment, a payment issue, privacy, or general loan information? For account-specific help, use the lender's verified official channel.", status="clarification_needed", escalated=False)
    best = results[0]
    selected = [r for r in results if r['score'] >= max(settings.retrieval_threshold, best['score'] * 0.55)]
    # If configured, the model may rewrite retrieved facts; without a provider or on provider failure,
    # deterministic retrieval remains the reliable fallback. Raw chat is never persisted by this endpoint.
    model_answer = generate_grounded_answer(message, selected)
    answer = model_answer or best['content']
    mode = "llm_configured" if model_answer else "deterministic_demo"
    audit(request_id, "grounded_answer", best['id'])
    if model_answer:
        audit(request_id, "llm_answer_generated", settings.llm_model)
    sources = [Source(id=r['id'], title=r['title'], category=r['category'], score=r['score']) for r in selected]
    return ChatResponse(request_id=request_id, answer=answer, status="answered", escalated=False, sources=sources, mode=mode)
