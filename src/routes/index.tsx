import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BookOpen, Bot, Check,
  ChevronRight, CircleHelp, Clock3, Database, Headphones, LockKeyhole, Menu,
  MessageCircle, RotateCcw, Search, Send, ShieldCheck, Sparkles, UserRound,
  X, Zap,
} from "lucide-react";


type Source = { id: string; title: string; category: string; score: number };
type ChatMessage = { id: string; role: "assistant" | "user"; text: string; status?: string; sources?: Source[]; escalationId?: number; mode?: string };
type Article = { id: string; title: string; category: string };
type Escalation = { id: number; request_id: string; category: string; created_at: string; status: string };
type Metrics = { events: Record<string, number>; escalations: number; knowledge_articles: number };
type RuntimeHealth = { status: string; llm_configured?: boolean; llm_model?: string | null; prompt_version?: string; mode?: string };
const examples = [
  { icon: BookOpen, label: "Loan documents", prompt: "What documents are needed for a loan?" },
  { icon: Activity, label: "Payment issue", prompt: "My payment was deducted but not reflected" },
  { icon: ShieldCheck, label: "Report fraud", prompt: "I suspect fraud and an unauthorized transaction" },
  { icon: Headphones, label: "Talk to support", prompt: "I want to speak to a human agent" },
];
const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";
const initialMessage: ChatMessage = { id: "welcome", role: "assistant", text: "Hi! I’m FinAssist, your financial support assistant. I can answer general questions from the demo knowledge base and route sensitive or account-specific requests to a simulated human handoff. I can’t access real accounts or move money." };
function makeId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  if (!response.ok) { let detail = `Request failed (${response.status})`; try { const body = await response.json(); detail = body.detail || detail; } catch { /* keep generic detail */ } throw new Error(detail); }
  return response.json() as Promise<T>;
}
export default function FinAssistApp() {
  const [view, setView] = useState<"workspace" | "knowledge" | "escalations">("workspace");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [runtime, setRuntime] = useState<RuntimeHealth | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [filter, setFilter] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const refreshData = useCallback(async () => {
    try {
      const [health, knowledge, handoffs, stats] = await Promise.all([
        request<RuntimeHealth>("/health"), request<{ items: Article[] }>("/api/knowledge"),
        request<{ items: Escalation[] }>("/api/escalations"), request<Metrics>("/api/metrics"),
      ]);
      setApiOnline(health.status === "ok"); setRuntime(health); setArticles(knowledge.items); setEscalations(handoffs.items); setMetrics(stats);
    } catch { setApiOnline(false); }
  }, []);
  useEffect(() => { void refreshData(); }, [refreshData]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy]);
  const filteredArticles = useMemo(() => articles.filter((a) => `${a.title} ${a.category}`.toLowerCase().includes(filter.toLowerCase())), [articles, filter]);
  async function sendMessage(text = input) {
    const clean = text.trim(); if (!clean || busy) return;
    setMessages((old) => [...old, { id: makeId(), role: "user", text: clean }]); setInput(""); setBusy(true); setError("");
    try {
      const data = await request<{ request_id: string; answer: string; status: string; sources: Source[]; escalation_id?: number; disclaimer?: string; mode?: string }>("/api/chat", { method: "POST", body: JSON.stringify({ message: clean }) });
      setMessages((old) => [...old, { id: makeId(), role: "assistant", text: data.answer, status: data.status, sources: data.sources || [], escalationId: data.escalation_id, mode: data.mode }]);
      if (data.status === "escalated") await refreshData();
    } catch (e) {
      const message = e instanceof Error ? e.message : "The backend could not be reached.";
      setError(`${message}. Check that the FastAPI backend is running, then retry.`);
      setMessages((old) => [...old, { id: makeId(), role: "assistant", text: "I couldn’t reach the support service, so I haven’t processed your request. Please check the API connection and try again." }]);
    } finally { setBusy(false); }
  }
  function submit(e: FormEvent) { e.preventDefault(); void sendMessage(); }
  function resetChat() { setMessages([{ ...initialMessage, id: makeId(), text: "Conversation reset. Ask me about loan documents, payments, repayment, privacy, or support." }]); setError(""); }
  const navItems = [
    { id: "workspace" as const, label: "Agent workspace", icon: MessageCircle },
    { id: "knowledge" as const, label: "Knowledge base", icon: BookOpen },
    { id: "escalations" as const, label: "Escalation queue", icon: Headphones },
  ];
  return <div className="fa-shell">
    {mobileNav && <button className="fa-mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside className={`fa-sidebar ${mobileNav ? "is-open" : ""}`}>
      <div className="fa-brand"><div className="fa-brand-mark"><ShieldCheck size={22}/></div><div><b>finassist<span>.ai</span></b><small>SUPPORT OPERATIONS</small></div><button className="fa-close-nav" aria-label="Close menu" onClick={() => setMobileNav(false)}><X size={17}/></button></div>
      <div className="fa-workspace-label">WORKSPACE</div>
      <nav className="fa-nav">{navItems.map((item) => <button key={item.id} className={`fa-nav-item ${view === item.id ? "active" : ""}`} onClick={() => { setView(item.id); setMobileNav(false); }}><item.icon size={17}/><span>{item.label}</span>{item.id === "escalations" && escalations.length > 0 && <em>{escalations.length}</em>}</button>)}</nav>
      <div className="fa-side-divider"/><div className="fa-side-caption">SYSTEM STATUS</div>
      <div className="fa-status-row"><span className={`fa-status-dot ${apiOnline ? "online" : apiOnline === false ? "offline" : "checking"}`}/><span>API connection</span><b>{apiOnline ? "Online" : apiOnline === false ? "Offline" : "Checking"}</b></div>
      <div className="fa-status-row"><span className="fa-status-dot online"/><span>Safety guardrails</span><b>Enabled</b></div>
      <div className="fa-side-spacer"/>
      <div className="fa-privacy-card"><div className="fa-privacy-icon"><LockKeyhole size={16}/></div><b>Sandbox environment</b><p>Fictional support content only. No real financial accounts are connected.</p><span><span/> DATA-SAFE DEMO</span></div>
      <div className="fa-profile"><div className="fa-profile-avatar">FA</div><div><b>FinAssist Demo</b><small>Local workspace</small></div><span className="fa-profile-dots">•••</span></div>
    </aside>
    <main className="fa-main">
      <header className="fa-topbar"><div className="fa-top-left"><button className="fa-menu-btn" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={19}/></button><div className="fa-breadcrumb">Workspace <ChevronRight size={14}/><b>{navItems.find((i) => i.id === view)?.label}</b></div></div><div className="fa-top-right"><span className="fa-env"><span/> DEMO ENVIRONMENT</span><button className="fa-icon-button" aria-label="Refresh system data" title="Refresh system data" onClick={() => void refreshData()}><RotateCcw size={16}/></button><div className="fa-top-avatar">FA</div></div></header>
      {view === "workspace" && <>
        <section className="fa-page-heading"><div><div className="fa-overline"><Sparkles size={13}/> AI CUSTOMER OPERATIONS</div><h1>Customer support <span>workspace</span></h1><p>Reliable, source-grounded answers with safe escalation paths.</p></div><div className="fa-heading-meta"><span className="fa-live-dot"/> <span>Retrieval-first agent</span><small>v1.0.0 · Local demo</small></div></section>
        <section className="fa-metrics-grid">
          <Metric icon={Database} label="Knowledge articles" value={metrics?.knowledge_articles ?? articles.length} detail="Synthetic reference content" trend="Stable" tone="mint" />
          <Metric icon={MessageCircle} label="Answered requests" value={metrics?.events?.grounded_answer ?? 0} detail="Retrieved from sources" trend="Grounded" tone="blue" />
          <Metric icon={Headphones} label="Escalations" value={metrics?.escalations ?? escalations.length} detail="Simulated handoffs" trend="Human review" tone="amber" />
          <Metric icon={ShieldCheck} label="Safety refusals" value={metrics?.events?.request_refused ?? 0} detail="Unsafe request patterns" trend="Guarded" tone="purple" />
        </section>
        <section className="fa-work-grid"><div className="fa-chat-panel">
          <div className="fa-panel-heading"><div className="fa-agent-icon"><Bot size={20}/><span/></div><div className="fa-panel-title"><h2>FinAssist support agent</h2><p><span/> Ready to assist · Source-grounded mode</p></div><button className="fa-icon-button" onClick={resetChat} title="Reset conversation" aria-label="Reset conversation"><RotateCcw size={16}/></button></div>
          <div className="fa-chat-scroll"><div className="fa-day-divider"><span/> TODAY · DEMO SESSION <span/></div>{messages.map((m) => <div key={m.id} className={`fa-message ${m.role}`}><div className={`fa-message-avatar ${m.role}`}>{m.role === "assistant" ? <Bot size={17}/> : <UserRound size={16}/>}</div><div className="fa-message-body"><div className="fa-message-meta"><b>{m.role === "assistant" ? "FINASSIST AI" : "YOU"}</b>{m.status && <span className={`fa-state ${m.status}`}>{m.status.replaceAll("_", " ")}</span>}{m.mode === "llm_configured" && <span className="fa-state model">LLM-assisted</span>}</div><div className="fa-bubble">{m.text}{m.escalationId && <div className="fa-escalation-ref"><Check size={13}/> Simulated handoff ID #{m.escalationId}</div>}</div>{m.sources && m.sources.length > 0 && <div className="fa-sources"><div><BookOpen size={13}/> <b>Sources used</b><span>{m.sources.length} reference{m.sources.length > 1 ? "s" : ""}</span></div>{m.sources.map((s) => <div className="fa-source-item" key={s.id}><span className="fa-source-doc"><BookOpen size={13}/></span><span><b>{s.title}</b><small>{s.category} · {Math.round(s.score * 100)}% match score</small></span><Check size={14}/></div>)}</div>}</div></div>)}{busy && <div className="fa-loading"><span/><span/><span/> Retrieving relevant context and preparing a grounded response…</div>}<div ref={messagesEnd}/></div>
          {error && <div className="fa-error"><AlertTriangle size={14}/>{error}</div>}
          <div className="fa-prompt-area"><div className="fa-prompt-label"><Sparkles size={13}/> TRY A QUICK QUESTION</div><div className="fa-prompts">{examples.map((item) => <button key={item.label} onClick={() => void sendMessage(item.prompt)} disabled={busy}><item.icon size={14}/>{item.label}</button>)}</div></div>
          <form className="fa-composer" onSubmit={submit}><div className="fa-composer-leading"><MessageCircle size={17}/></div><input value={input} onChange={(e) => setInput(e.target.value)} maxLength={2000} placeholder="Ask a question about financial support…" aria-label="Your question"/><span className="fa-char-count">{input.length}/2000</span><button type="submit" disabled={busy || !input.trim()} aria-label="Send message"><Send size={16}/></button></form><div className="fa-composer-foot"><span><LockKeyhole size={12}/> Never share OTPs, PINs, passwords, or full card details.</span><span>Enter ↵ to send</span></div>
        </div><aside className="fa-right-rail"><div className="fa-rail-card"><div className="fa-rail-heading"><span className="fa-rail-icon mint"><Zap size={16}/></span><div><h3>Agent overview</h3><p>Current runtime configuration</p></div></div><div className="fa-overview-status"><span className="fa-live-dot"/> <b>{apiOnline ? "All systems operational" : apiOnline === false ? "API connection unavailable" : "Checking service"}</b></div><div className="fa-overview-row"><span>Response strategy</span><b>Retrieval-first</b></div><div className="fa-overview-row"><span>Knowledge source</span><b>Synthetic articles</b></div><div className="fa-overview-row"><span>LLM provider</span><b>{runtime?.llm_configured ? (runtime.llm_model || "Configured") : "Deterministic fallback"}</b></div><div className="fa-overview-row"><span>Human handoff</span><b>Simulated</b></div><div className="fa-overview-row"><span>Prompt version</span><b>{runtime?.prompt_version || "finassist-grounded-v1.1"}</b></div><div className="fa-rail-note"><ShieldCheck size={15}/><span>Answers use retrieved demo content. When configured, the model only receives retrieved context; provider errors fall back to deterministic answers.</span></div></div>
          <div className="fa-rail-card"><div className="fa-rail-heading"><span className="fa-rail-icon blue"><Activity size={16}/></span><div><h3>Recent activity</h3><p>Session-level event counts</p></div></div>{[{label:"Grounded answers",value:metrics?.events?.grounded_answer ?? 0,icon:ArrowUpRight},{label:"Needs clarification",value:metrics?.events?.clarification_needed ?? 0,icon:CircleHelp},{label:"Safety refusals",value:metrics?.events?.request_refused ?? 0,icon:LockKeyhole},{label:"Escalations created",value:metrics?.events?.request_escalated ?? 0,icon:ArrowDownRight}].map((r) => <div className="fa-activity-row" key={r.label}><r.icon size={14}/><span>{r.label}</span><b>{r.value}</b></div>)}<button className="fa-text-link" onClick={() => setView("escalations")}>View escalation queue <ChevronRight size={14}/></button></div>
          <div className="fa-guardrail-card"><div className="fa-guardrail-top"><ShieldCheck size={17}/><b>Safety guardrails</b><span>ACTIVE</span></div><ul><li><Check size={13}/> Prompt-injection pattern checks</li><li><Check size={13}/> Source-grounded responses</li><li><Check size={13}/> Account-specific escalation</li><li><Check size={13}/> No raw message audit storage</li></ul></div>
        </aside></section>
        <footer className="fa-footer"><span>FinAssist AI <b>·</b> Forward Deployed Engineer portfolio demo</span><span><LockKeyhole size={12}/> Not a real financial institution · Not financial advice</span></footer>
      </>}
      {view === "knowledge" && <section className="fa-secondary-page"><div className="fa-page-heading"><div><div className="fa-overline"><BookOpen size={13}/> RETRIEVAL SOURCES</div><h1>Knowledge <span>base</span></h1><p>Browse the synthetic articles available to the support agent.</p></div><div className="fa-count-chip"><Database size={15}/>{articles.length} articles</div></div><div className="fa-library-panel"><div className="fa-library-toolbar"><div><h2>Reference library</h2><p>Answers are grounded in these demo documents.</p></div><label className="fa-search-box"><Search size={16}/><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search articles…" aria-label="Search knowledge articles"/><kbd>Search</kbd></label></div><div className="fa-article-grid">{filteredArticles.map((a) => <article className="fa-article-card" key={a.id}><div className="fa-article-top"><span className="fa-article-icon"><BookOpen size={17}/></span><span className="fa-category">{a.category.replaceAll("-", " ")}</span></div><h3>{a.title}</h3><p>Knowledge article <code>{a.id}</code> · available for retrieval</p><div className="fa-article-bottom"><span><Check size={13}/> Indexed</span><span>Demo source</span></div></article>)}</div>{filteredArticles.length === 0 && <div className="fa-empty"><Search size={24}/><b>No matching articles</b><span>Try another search term.</span></div>}</div><div className="fa-disclaimer"><AlertTriangle size={16}/><span><b>Demo content only.</b> Articles are synthetic examples, not lender policies. Verify all financial requirements with the official institution.</span></div></section>}
      {view === "escalations" && <section className="fa-secondary-page"><div className="fa-page-heading"><div><div className="fa-overline"><Headphones size={13}/> HUMAN REVIEW</div><h1>Escalation <span>queue</span></h1><p>Simulated handoffs for sensitive, account-specific, or unsupported requests.</p></div><div className="fa-count-chip"><Clock3 size={15}/>{escalations.length} records</div></div><div className="fa-library-panel"><div className="fa-library-toolbar"><div><h2>Recent handoffs</h2><p>Reason text is intentionally excluded from this list.</p></div><button className="fa-secondary-button" onClick={() => void refreshData()}><RotateCcw size={14}/> Refresh</button></div>{escalations.length ? <div className="fa-table-wrap"><table className="fa-table"><thead><tr><th>Handoff</th><th>Category</th><th>Request ID</th><th>Created</th><th>Status</th></tr></thead><tbody>{escalations.map((e) => <tr key={e.id}><td><b>#{e.id}</b></td><td><span className="fa-category">{e.category}</span></td><td><code>{e.request_id}</code></td><td>{e.created_at}</td><td><span className="fa-state escalated">{e.status}</span></td></tr>)}</tbody></table></div> : <div className="fa-empty"><Headphones size={25}/><b>No escalations yet</b><span>Ask the agent to speak to a human or try the suspected-fraud example.</span><button className="fa-primary-button" onClick={() => { setView("workspace"); void sendMessage("I want to speak to a human agent"); }}>Create a demo handoff <ChevronRight size={15}/></button></div>}</div><div className="fa-disclaimer"><AlertTriangle size={16}/><span><b>Simulated handoff.</b> No real support team is notified. Do not enter actual customer information into this demo.</span></div></section>}
    </main>
  </div>;
}
function Metric({ icon: Icon, label, value, detail, trend, tone }: { icon: typeof Database; label: string; value: number; detail: string; trend: string; tone: string }) {
  return <div className="fa-metric-card"><div className="fa-metric-top"><span className={`fa-metric-icon ${tone}`}><Icon size={17}/></span><span className="fa-metric-trend">{trend}</span></div><div className="fa-metric-value">{value.toLocaleString("en-US")}</div><div className="fa-metric-label">{label}</div><div className="fa-metric-detail">{detail}</div></div>;
}
