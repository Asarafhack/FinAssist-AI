from pydantic import BaseModel, Field, ConfigDict
from typing import Literal

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    conversation_id: str | None = Field(default=None, max_length=100)

class Source(BaseModel):
    id: str
    title: str
    category: str
    score: float

class ChatResponse(BaseModel):
    request_id: str
    answer: str
    status: Literal['answered','clarification_needed','escalated','refused']
    escalated: bool
    escalation_id: int | None = None
    sources: list[Source] = []
    mode: Literal['deterministic_demo','llm_configured'] = 'deterministic_demo'
    prompt_version: str = 'finassist-grounded-v1.1'
    disclaimer: str = 'Demonstration only. This is not a real lender, account system, or financial advice service.'

class EscalationRequest(BaseModel):
    request_id: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=80)
    reason: str = Field(min_length=1, max_length=1000)

class EscalationResponse(BaseModel):
    escalation_id: int
    status: Literal['open'] = 'open'
    message: str = 'Your request has been recorded in this local demo. No real support team has been contacted.'
