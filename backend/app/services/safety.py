import re

INJECTION_PATTERNS = [
    r"ignore (all |any )?(previous|prior|above) instructions",
    r"reveal (the )?(system prompt|hidden instructions)",
    r"act as (an? )?(unrestricted|unfiltered) ai",
    r"bypass (the )?(safety|security|guardrail)",
    r"print (all )?(secrets|api keys|credentials)",
    r"disregard (all )?(previous|prior|system) instructions",
    r"developer message says",
    r"show me (the )?(hidden|internal) prompt",
    r"pretend (that )?you have access to (my|the) account",
    r"bypass (all )?(rules|policies|instructions)",
]
ESCALATION_TERMS = {
    "fraud": ("fraud", "unauthorized transaction", "someone stole", "scam", "identity theft"),
    "complaint": ("file a complaint", "formal complaint", "grievance", "complain to regulator"),
    "human_support": ("talk to a human", "human agent", "speak to someone", "customer representative", "human representative", "live person"),
    "account_specific": ("my balance", "my loan status", "approve my loan", "my account number", "my emi amount", "my repayment amount", "check my account", "transaction on my account"),
    "credential_exposure": ("shared my otp", "gave my otp", "shared my password", "shared my pin", "revealed my otp", "someone has my otp", "stolen credentials"),
}

def detect_injection(text: str) -> bool:
    t = text.lower()
    return any(re.search(p, t) for p in INJECTION_PATTERNS)

def escalation_category(text: str) -> str | None:
    t = text.lower()
    for category, terms in ESCALATION_TERMS.items():
        if any(term in t for term in terms):
            return category
    return None

def redact_pii(text: str) -> str:
    # Minimize accidental PII persistence in logs; the message is not stored by chat endpoint.
    text = re.sub(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b", "[REDACTED_EMAIL]", text)
    text = re.sub(r"(?<!\w)(?:\+?\d[\d\s-]{8,}\d)(?!\w)", "[REDACTED_PHONE_OR_ID]", text)
    text = re.sub(r"\b\d{12}\b", "[REDACTED_ID]", text)
    return text
