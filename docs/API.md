# API reference

Base URL: `http://127.0.0.1:8000`. Open `/docs` for the generated OpenAPI UI.

## `GET /health`
Returns service status, whether an LLM provider is configured, the configured model identifier (never the key), the prompt version, and an explicit `production_ready: false` marker.

## `GET /api/knowledge`
Returns article IDs, titles, categories, count, and a synthetic-content marker. Article bodies are not exposed by this listing endpoint.

## `POST /api/chat`
Request:
```json
{"message":"My payment was deducted but not reflected", "conversation_id":"optional-demo-id"}
```
`message` must contain 1–2,000 characters. `conversation_id` is optional and currently not persisted.

Response fields: `request_id`, `answer`, `status`, `escalated`, optional `escalation_id`, `sources`, `mode`, `prompt_version`, and `disclaimer`. `mode` is `deterministic_demo` when using authored retrieval content and `llm_configured` when a configured provider returns a usable answer.

Statuses:
- `answered`: a local article matched the retrieval threshold.
- `clarification_needed`: no adequate evidence was found.
- `escalated`: request routed to a local simulated escalation record.
- `refused`: selected instruction-override pattern was detected.

## `POST /api/escalations`
Request:
```json
{"request_id":"demo-123", "category":"support", "reason":"Need help with a payment"}
```
Creates a local escalation record. The response explicitly says that no real support team was contacted. The reason is redacted for common email/phone-like patterns before storage.

## Error behavior
FastAPI/Pydantic returns HTTP 422 for invalid payloads. Unexpected database errors are not yet mapped to a polished public error schema; add exception handling and alerting before production use.

## Request IDs
`X-Request-ID` is accepted as a correlation hint and returned in the response header. In production, validate trusted ingress behavior and avoid accepting unbounded or attacker-controlled identifiers.

## `GET /api/metrics`
Returns aggregate audit event counts, escalation count, and knowledge article count. It does not expose message bodies.

## `GET /api/escalations`
Returns recent escalation metadata (`id`, `request_id`, `category`, `created_at`, `status`) and count. The reason text is intentionally omitted from the list response.

## `POST /api/escalations`
Creates a simulated local handoff. It does not notify a real support team.
