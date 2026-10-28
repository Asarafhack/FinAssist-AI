# FinAssist AI — Support Operations Demo

A full-stack portfolio project demonstrating a grounded financial-support agent workflow. It combines a React/TypeScript operations console with a FastAPI service, SQLite persistence, lexical retrieval, optional OpenAI-compatible LLM generation, source references, safety routing, simulated human handoffs, automated API tests, and a reproducible evaluation harness.

> **Important:** This is a local portfolio demo, not a real financial service. It does not connect to a lender, payment provider, customer account, or staffed support queue. Without an API key, the answer engine uses deterministic retrieval. With a backend-only provider key configured, an OpenAI-compatible model can rewrite retrieved context under a grounding-focused prompt; provider failures fall back to deterministic answers. Do not enter real customer data, credentials, card details, OTPs, or private financial information.

## Features

- **Agent workspace:** chat, quick prompts, answer states, source citations, connection status, and session event counts.
- **Knowledge base:** searchable list of synthetic support articles available to retrieval.
- **Escalation queue:** displays simulated handoffs without exposing the stored reason text in the list API.
- **FastAPI service:** health, chat, knowledge, metrics, and escalation endpoints.
- **Grounded answer pipeline:** lexical retrieval selects synthetic articles; weak matches return a clarification prompt. An optional OpenAI-compatible Chat Completions provider can formulate an answer from retrieved context, with deterministic fallback on provider errors.
- **Safety behavior:** pattern-based prompt-injection checks, fraud/credential/account-specific escalation routing, bounded input, request IDs, minimal event logging, and provider timeouts.
- **Tests and evaluation:** pytest API and LLM-adapter coverage plus a small deterministic scenario evaluation. The scenario set is a smoke test, not a production-quality estimate.
- **Container setup:** Docker Compose starts the API and Nginx-served frontend with API proxying and a persistent SQLite volume.

## Requirements

- Python 3.11+ (Python 3.12 recommended)
- Node.js 20+ (Node.js 22 recommended) and npm
- Docker Desktop / Docker Engine with Compose (optional)

## Run on Windows

From the project root in PowerShell, run `scripts\setup-windows.ps1`. Then open two terminals and run `scripts\start-backend-windows.ps1` and `scripts\start-frontend-windows.ps1`. If PowerShell blocks local scripts, review your execution policy and run the script only if you trust the extracted project.

## Run locally

### 1. Start the API

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs: http://127.0.0.1:8000/docs
Health: http://127.0.0.1:8000/health

### 2. Start the frontend (new terminal, project root)

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173). Vite proxies `/api` and `/health` to the API at `127.0.0.1:8000`.

### 3. Run checks

From the project root (after installing backend requirements in the same Python environment):

```bash
npm run typecheck
npm run build
npm run test
```

Backend tests and evaluation:

```bash
cd backend
PYTHONPATH=. pytest -q
PYTHONPATH=. python scripts/evaluate.py
```

### 4. Run with Docker Compose

From the project root:

```bash
docker compose up --build
```

Open http://localhost:8080. The API is exposed to the frontend through the Nginx reverse proxy and the SQLite database is persisted in the `finassist_data` volume. Docker build/runtime behavior still needs to be verified on the target machine.

## Optional LLM configuration

The default is keyless deterministic mode. To enable model-assisted phrasing, set these variables in the **backend process environment** (or backend container), never in browser-exposed `VITE_` variables:

```bash
LLM_API_KEY=your-provider-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_TIMEOUT_SECONDS=12
```

The adapter uses the OpenAI-compatible `/chat/completions` contract. Use a provider/model that supports that contract. It sends the user's question and retrieved synthetic snippets to the configured provider. If the provider errors, times out, or returns malformed output, the application falls back to the best retrieved article. A configured provider is not enabled until a valid key is supplied. Never commit real secrets.

## API overview

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Service health and demo mode |
| `GET` | `/api/knowledge` | Synthetic article metadata |
| `GET` | `/api/metrics` | Aggregate audit counts, escalation count, article count |
| `GET` | `/api/escalations` | Recent handoff metadata (reason intentionally omitted) |
| `POST` | `/api/chat` | Retrieve an answer, request clarification, refuse a detected injection pattern, or simulate escalation |
| `POST` | `/api/escalations` | Create a simulated handoff record |

Example request:

```bash
curl -X POST http://127.0.0.1:8000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message":"What documents are needed for a loan?"}'
```

## Architecture

```text
Browser (React + TypeScript + Vite)
        | /api/* and /health
        v
FastAPI API  ---> input safety checks / escalation rules
        |                         |
        v                         v
SQLite knowledge articles     SQLite handoffs + audit events
        |
        v
Lexical retrieval -> low-evidence clarification OR optional grounded LLM phrasing
                                      | provider unavailable
                                      v
                              deterministic article fallback
```

## What is not implemented

- No built-in voice/STT/TTS/telephony pipeline; voice remains a documented integration design only.
- No live account, payment, loan origination, fraud-reporting, CRM, or support-queue integration.
- No production authentication/authorization, tenant isolation, rate limiting, secrets manager, encryption-at-rest policy, or production observability.
- Injection checks are heuristic and are not a complete security boundary.
- Evaluation scenarios are small, synthetic, and hand-authored; reported metrics must not be interpreted as production accuracy.

## Production hardening before real use

Do not deploy this demo for real customers without a security and privacy review, authentication and authorization, tenant isolation, abuse/rate controls, managed database and secrets, encryption and retention policy, validated retrieval and evaluation, red-team testing, monitoring/alerting, accessibility review, and integrations with a real verified human-support workflow. Financial content and compliance requirements must be reviewed by qualified owners.


## How this maps to an FDE workflow

| FDE competency | Evidence in this project |
|---|---|
| Python and API engineering | FastAPI endpoints, Pydantic request/response schemas, request IDs, error handling |
| SQL and persistence | SQLite knowledge articles, simulated escalations, and aggregate audit metrics |
| Agent and prompt design | Versioned grounding prompt, retrieved context, injection-pattern checks, uncertainty fallback |
| Integration and debugging | Same-origin Vite/Nginx API routing, provider timeout handling, deterministic fallback |
| Testing and evaluation | API and LLM-adapter tests plus a fixed synthetic routing evaluation |
| Customer-facing workflow thinking | Knowledge browser, source visibility, escalation queue, clear limitations and handoff state |
| Documentation and repeatability | API reference, architecture, runbook, security notes, voice integration proposal |

This is a portfolio prototype. It does not claim a live customer deployment, real lender integration, or production voice stack.

## Project structure

```text
src/routes/index.tsx       Main dashboard, chat, knowledge and handoff views
src/finassist.css          Responsive application styling
backend/app/main.py        FastAPI endpoints and request handling
backend/app/retrieval/     Lexical retrieval logic
backend/app/services/      Safety, escalation routing and PII redaction
backend/app/db/            SQLite schema and persistence
backend/tests/             API tests
backend/scripts/evaluate.py Deterministic scenario evaluation
docs/                      Architecture, evaluation, deployment, security, and demo walkthrough
scripts/                   Windows setup and development launch scripts
```

## Portfolio positioning

Describe this accurately as a **retrieval-first financial-support agent prototype with a React operations UI, FastAPI API, SQLite persistence, safety routing, source references, and automated tests**. Do not claim production deployment, live voice support, or real customer integrations. Model-assisted generation is optional and requires a configured backend provider key.
