# FinAssist AI — Demo walkthrough

## Suggested 3-minute walkthrough

1. **Start with the problem (20 seconds).** Customer-support agents need reliable answers, visible evidence, and safe handling for sensitive requests.
2. **Show the support workspace (30 seconds).** Point out service status, synthetic knowledge count, activity metrics, and the explicit demo boundary.
3. **Ask a supported question (35 seconds).** Try “What documents are needed for a loan?” Show the source references and explain that the answer is grounded in the synthetic article set.
4. **Show uncertainty handling (20 seconds).** Ask an unrelated question. The system should ask for clarification rather than invent a financial answer.
5. **Show escalation (30 seconds).** Try “I suspect fraud” or “I want to speak to a human.” Explain that the local queue is a simulated handoff and does not notify a real support team.
6. **Show implementation quality (35 seconds).** Open `/docs` for FastAPI's generated API documentation, then describe the tests, request IDs, bounded input, audit minimization, and provider fallback.
7. **Explain model configuration (20 seconds).** The project defaults to deterministic mode. An OpenAI-compatible model can be configured with a backend-only key; the model receives retrieved synthetic context and provider failures fall back to deterministic answers.
8. **Close with trade-offs (20 seconds).** State clearly that voice transport, real account integrations, authentication, and production operations are future work. Describe the steps required to harden them.

## Questions to prepare for

- **Why retrieval before generation?** It narrows the factual basis, makes sources inspectable, and enables a safe fallback when evidence is weak.
- **What happens if the LLM provider fails?** The adapter has a bounded timeout and returns no model answer on failure; the API uses the best retrieved synthetic article instead.
- **How do you evaluate it?** The included suite checks routing on a small fixed set. A production evaluation should include labeled retrieval relevance, groundedness review, escalation precision/recall, latency, cost, and adversarial regression tests.
- **How would you add voice?** Add a streaming audio transport, STT with turn detection, shared safety/retrieval pipeline, streaming TTS, interruption handling, and a verified handoff integration; measure end-to-end p50/p95 latency.
- **What prevents production use today?** No auth/tenant isolation, rate limits, full PII controls, verified real handoff, production monitoring, or institution-reviewed policies.

## Demo safety
Use only the synthetic sample questions. Never enter actual account data, credentials, payment details, or real customer records.
