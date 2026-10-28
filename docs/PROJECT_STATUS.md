# Project status

## Implemented
- FastAPI service with health, chat, knowledge, metrics, and escalation endpoints.
- SQLite persistence for synthetic knowledge, escalation metadata, and minimal audit events.
- Lexical retrieval with source scores and a low-evidence clarification path.
- Optional OpenAI-compatible Chat Completions adapter with a versioned grounding prompt, timeout, response validation, and deterministic fallback.
- Pattern-based instruction-override checks and escalation routing for fraud, complaints, human support, account-specific requests, and credential exposure.
- Responsive React/TypeScript operations console with workspace chat, source references, knowledge browser, handoff queue, runtime status, metrics, and reduced-motion-aware transitions.
- Request ID propagation, input validation, synthetic data, and API/adapter tests.
- Docker Compose, Nginx reverse proxy, runbook, architecture, evaluation, security, and voice integration design documentation.

## Verification status
Backend tests: 20 passed. The fixed synthetic routing evaluation matched 6/6 expected statuses. TypeScript transpilation syntax checks passed. Full npm dependency installation, typecheck, production build, and Docker build/runtime remain unverified because dependency installation timed out in this environment. See `docs/IMPLEMENTATION_NOTES.md`. The small evaluation is a routing smoke test, not proof of production reliability.

## Explicitly not implemented
- Speech-to-text, text-to-speech, telephony, WebRTC, or a live voice agent.
- Real lender, payment, CRM, identity, account, or human-support integrations.
- Production authentication/authorization, tenant isolation, rate limiting, secrets management, compliance sign-off, or full observability.

## Next production steps
Implement identity and tenant controls, secret management, privacy/retention policy, stronger retrieval and evaluation, adversarial testing, monitoring, CI/CD, and verified integrations before any real customer use.
