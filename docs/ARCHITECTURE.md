# Architecture and design decisions

## Scope
FinAssist AI demonstrates a small, testable support-agent service. It deliberately uses deterministic retrieval and authored content to keep behavior inspectable without a paid model provider.

## Components

1. **FastAPI transport layer** validates payloads, assigns/propagates a request ID, and exposes documented endpoints.
2. **Safety router** checks a small set of instruction-override patterns and high-risk intents before retrieval.
3. **Lexical retriever** tokenizes the query and each article, calculates overlap/query coverage with a title boost, and returns ranked evidence.
4. **Response policy** asks for clarification when the top retrieval score is below a configurable threshold. If a provider key is configured, an OpenAI-compatible model may phrase an answer using only retrieved snippets. Provider failure or malformed output falls back to the best authored article. Without a key, the service is deterministic.
5. **SQLite repository** stores the synthetic knowledge base, local escalations, and minimal audit events.
6. **React client** renders chat, source metadata, status labels, and explicit sandbox warnings.

## Request flow

- Request enters `POST /api/chat` with a maximum 2,000-character message.
- Middleware assigns a UUID request ID unless `X-Request-ID` is supplied.
- Override-pattern matches return `refused`.
- Fraud, complaints, requests for human help, and account-specific intents create a local escalation record and return `escalated`.
- Other messages are matched against the synthetic knowledge base.
- Weak/no matches return `clarification_needed`.
- Strong matches return authored content in deterministic mode, or optional model phrasing based on the selected snippets, with source metadata. Provider failures use the deterministic fallback.
- Audit records contain the request ID, event type, and a small category/article identifier, not the raw user message.

## Data model

- `knowledge_articles`: ID, title, category, content, keywords.
- `escalations`: local request ID, category, redacted reason, creation timestamp, status.
- `audit_events`: request ID, event type, bounded detail, timestamp.

## Trade-offs

- Lexical retrieval avoids external dependencies and is easy to test, but lacks semantic recall and robust ranking. A production iteration could use a reviewed embedding model, chunking, a vector index, and offline retrieval evaluation.
- Deterministic authored responses are explainable, but less flexible than a language model. The optional provider adapter is bounded by a timeout and uses retrieved context; production still requires stronger grounding evaluation, provider policy review, retries/circuit-breaking strategy, and evaluation gates.
- The current local SQLite database is suitable for a demo, not a multi-tenant production service.

## Production hardening still required
Authentication/authorization, tenant isolation, rate limiting, secrets management, encryption and retention policies, structured distributed tracing, migration management, load testing, security review, human-queue integration, and operational alerting.
