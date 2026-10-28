# Evaluation plan and results

## Current method
`backend/scripts/evaluate.py` sends a fixed set of six hand-authored scenarios through the local FastAPI application and compares each returned status with the expected status. It computes the status-match rate from the actual run.

## Scenarios
1. Supported document question → `answered`.
2. Supported payment question → `answered`.
3. Fraud report → `escalated`.
4. Human support request → `escalated`.
5. Instruction override → `refused`.
6. Unrelated out-of-domain question → `clarification_needed`.

## Metric definition
`status_match_rate = correctly matched expected statuses / total scenarios`.

This is a routing smoke test, not a factual-groundedness score, and not a statistically meaningful quality estimate. It does not establish real-world hallucination rates, customer task completion, fairness, latency SLOs, or business impact.

## Additional evaluation recommended
- Groundedness: expert label whether each factual claim is entailed by retrieved evidence.
- Unsupported claim rate: unsupported factual claims divided by all factual claims.
- Escalation recall and precision on labeled sensitive cases.
- Unnecessary escalation rate for answerable benign cases.
- Retrieval recall@k and nDCG on a reviewed query/article set.
- Paraphrase consistency across languages and wording variants.
- p50/p95 latency under representative load.
- Regression suite on every knowledge-base or prompt/policy change.

## Results recording
Run from `backend/`:
```bash
PYTHONPATH=. python scripts/evaluate.py
```
Copy the generated JSON output into the project evidence only after running it. Do not claim a score based on an unexecuted run. The included scenario set is intentionally small and synthetic.
