# Security, privacy, and limitations

## Data handling
- The seed knowledge base contains synthetic demonstration articles.
- The chat endpoint does not persist raw message text in the audit table.
- Escalation reason text is redacted on a best-effort basis before local persistence; this is not a guarantee of complete PII removal.
- If an LLM provider is configured, the user's message and retrieved snippets are sent to that provider. Review the provider's data handling terms before use.
- The health endpoint exposes whether a provider is configured and the model identifier, but never the key.

## Controls present
- Request schema validation and message-size limits.
- Retrieval threshold and clarification fallback.
- Optional grounded LLM prompt with bounded timeout and deterministic fallback.
- Pattern checks for selected instruction-override attempts.
- Escalation routing for selected fraud, complaint, human-support, account-specific, and credential-exposure intents.
- Request IDs and minimal category/event audit records.
- Simulated-handoff disclaimers; no claim of real account access or human notification.

## Gaps
- Pattern checks are heuristic, bypassable, and may have false positives.
- No authentication, authorization, tenant isolation, rate limiting, CSRF controls, or production secrets manager.
- No complete PII classifier, deletion/retention workflow, encryption-at-rest policy, compliance review, or production observability.
- No real account lookup, payment action, credit decision, customer notification, or staffed support queue.
- No speech-to-text, text-to-speech, telephony, WebRTC, or live voice agent.
- Evaluation scenarios are synthetic and limited; no statistical or production-quality claim is supported.

## Before production
Add identity and authorization, tenant-scoped access, rate controls, managed storage, secrets management, data retention and deletion, robust redaction, security review, dependency scanning, monitoring, incident response, red-team testing, verified human handoff, and institution-approved content. Review applicable regulatory requirements with qualified owners.
