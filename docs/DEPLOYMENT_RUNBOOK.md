# Deployment and operations runbook

## Local start
1. Install Python 3.11+.
2. From `backend/`, create and activate a virtual environment.
3. Install `requirements.txt`.
4. Run `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`.
5. Check `GET /health` and `/docs`.
6. In another terminal, install frontend dependencies and run `npm run dev` from the project root. The Vite development server proxies `/api` and `/health` to `127.0.0.1:8000`.

## Configuration
- `FINASSIST_DB_PATH`: SQLite path. Use a persistent volume if data must survive container restarts.
- `RETRIEVAL_THRESHOLD`: minimum lexical score required to answer; tune against a reviewed evaluation set rather than guessing.
- `ENVIRONMENT`: descriptive environment label.
- `VITE_API_URL`: frontend API base URL at build/dev time.
- `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`, `LLM_TIMEOUT_SECONDS`: optional OpenAI-compatible model adapter settings. Keep the key in the backend environment; never expose it as a `VITE_` variable.

## Optional model configuration
Set `LLM_API_KEY` and, if needed, `LLM_BASE_URL`/`LLM_MODEL` in the backend environment. The default is deterministic mode. When configured, the adapter sends the user question and retrieved synthetic snippets to the provider; common PII patterns are redacted first. Review provider data handling before use.

## Docker
Run `docker compose up --build` from the root. Confirm the API health endpoint after startup. Docker build and runtime behavior must be verified on the target host before claiming deployment readiness.

## Troubleshooting
- API unavailable: check Python environment, dependencies, port 8000, and startup logs.
- Empty knowledge list: verify database path and startup seeding; the seed routine inserts/replaces the local article set at startup.
- Too many clarifications: inspect top retrieval matches and tune the threshold only after adding test cases.
- Frontend cannot connect: verify backend address and `VITE_API_URL`; check browser console and CORS configuration.
- SQLite locked/unwritable: check directory permissions and whether the chosen path is on a writable volume.

## Operational limits
This is a development demo, with no SLA, on-call process, real support queue, or production telemetry. Do not expose it to real customers. For a production service, add structured logging, metrics, tracing, alerts, backups, database migrations, access controls, incident response, and a rollback plan.
