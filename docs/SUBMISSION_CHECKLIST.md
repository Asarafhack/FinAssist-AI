# Submission checklist

## Before sending the repository
- [ ] Run `PYTHONPATH=. pytest -q` from `backend/` and confirm all tests pass.
- [ ] Run `PYTHONPATH=. python scripts/evaluate.py` and inspect each synthetic scenario result.
- [ ] On a network-enabled machine, run `npm install`, `npm run typecheck`, and `npm run build` from the project root.
- [ ] Launch the backend and frontend, then manually try a supported question, an unrelated question, an instruction-override attempt, and a fraud/human-support request.
- [ ] Optionally build and run with Docker Compose.
- [ ] Check the repository for `.env`, API keys, customer data, local database files, and personal information before publishing.
- [ ] Add a short screen recording or screenshots only after verifying the app runs locally.

## Be ready to explain
- Why retrieval happens before optional LLM generation.
- How low-evidence questions, provider failures, and sensitive intents are handled.
- What the evaluation measures and what it does not measure.
- Why the current simulated escalation is not a real support integration.
- What you would build next for streaming voice, authentication, tenant isolation, observability, and production deployment.

## Accuracy rule
Do not describe this project as production deployed, connected to a real lender, or equipped with a live voice pipeline. The current evaluation is a small synthetic routing check. Explain your own contribution and design choices accurately in interviews.
