# Engineering roadmap

## Delivered in this portfolio build
- [x] Responsive React + TypeScript support operations console.
- [x] FastAPI service and SQLite-backed synthetic knowledge/handoff metadata.
- [x] Retrieval-first responses with source references and low-evidence fallback.
- [x] Optional OpenAI-compatible model adapter with prompt versioning and deterministic fallback.
- [x] Safety pattern checks, escalation routing, request IDs, and minimal audit events.
- [x] API tests, adapter tests, and a small deterministic routing evaluation.
- [x] Docker Compose, Nginx proxy, setup/runbook/security/architecture documentation.

## Before an interview demo
- [ ] Run `npm install`, `npm run typecheck`, and `npm run build` in a network-enabled environment.
- [ ] Run backend tests and evaluation from a clean checkout.
- [ ] Optionally test with a provider key in a local environment; do not commit the key.
- [ ] Record a short demo and be explicit that all support data is synthetic.

## Future production work
- [ ] Implement authentication, authorization, tenant isolation, rate limiting, secrets management, and observability.
- [ ] Build real provider/CRM/support integrations with permissioned access and idempotent workflows.
- [ ] Implement voice/STT/TTS/telephony and streaming latency measurement.
- [ ] Add robust evaluation datasets, human review, red-team tests, and regression gates.
- [ ] Conduct security, privacy, legal, and institution-specific compliance reviews.
