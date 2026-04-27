"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type Approval = {
  id: string;
  agent_id: string;
  title: string;
  preview: string | null;
  status: string;
  created_at: string;
};

type AgentOption = {
  id: string;
  name: string;
  role: string;
  department: string;
};

interface CockpitShellProps {
  initialApprovals: Approval[];
  agents: AgentOption[];
  children: React.ReactNode;
}

type DrawerKind = "capture" | "approvals" | null;

export default function CockpitShell({ initialApprovals, agents, children }: CockpitShellProps) {
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals);
  const [captureText, setCaptureText] = useState("");
  const [capturePriority, setCapturePriority] = useState<"P1" | "P2" | "P3">("P2");
  const [captureAgentId, setCaptureAgentId] = useState<string>("solomon");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const captureInputRef = useRef<HTMLTextAreaElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawer(null);
    setCaptureText("");
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }, []);

  // Global keyboard handlers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setDrawer((d) => (d === "capture" ? null : "capture"));
      } else if (meta && e.key.toLowerCase() === "a") {
        // Don't intercept if user is selecting text in an input/textarea
        const target = e.target as HTMLElement;
        const inField = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
        if (inField) return;
        e.preventDefault();
        setDrawer((d) => (d === "approvals" ? null : "approvals"));
      } else if (e.key === "Escape") {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  // Global click handler — agent row click pre-selects agent in capture drawer
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const row = target.closest<HTMLElement>("[data-agent-row]");
      if (!row) return;
      const agentId = row.getAttribute("data-agent-row");
      if (!agentId) return;
      setCaptureAgentId(agentId);
      setDrawer("capture");
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // Auto-focus capture input when drawer opens
  useEffect(() => {
    if (drawer === "capture") {
      setTimeout(() => captureInputRef.current?.focus(), 60);
    }
  }, [drawer]);

  const submitCapture = async () => {
    if (!captureText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: captureText.trim(), priority: capturePriority, agent_id: captureAgentId }),
      });
      if (res.ok) {
        const routedName = agents.find(a => a.id === captureAgentId)?.name ?? "Solomon";
        showToast(`✓ Captured · routed to ${routedName}`);
        setCaptureText("");
        closeDrawer();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`✗ ${err.error ?? "Capture failed"}`);
      }
    } catch (e) {
      showToast("✗ Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const decideApproval = async (id: string, decision: "approved" | "declined") => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/approvals/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision }),
      });
      if (res.ok) {
        setApprovals((prev) => prev.filter((a) => a.id !== id));
        showToast(`✓ ${decision === "approved" ? "Approved" : "Declined"}`);
      } else {
        showToast("✗ Update failed");
      }
    } catch (e) {
      showToast("✗ Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {children}

      {/* Floating command hint */}
      <div className="fixed bottom-5 right-5 z-30 flex gap-2 font-mono text-[10px] tracking-widest uppercase">
        <button
          onClick={() => setDrawer("capture")}
          className="px-3 py-2 rounded border border-gold/30 bg-obsidian/90 text-gold hover:bg-gold/15 backdrop-blur transition"
          title="Quick Capture"
        >
          ⌘K · Capture
        </button>
        <button
          onClick={() => setDrawer("approvals")}
          className="px-3 py-2 rounded border border-royal/40 bg-obsidian/90 text-ivory hover:bg-royal/20 backdrop-blur transition relative"
          title="Approvals Tray"
        >
          ⌘A · Approvals
          {approvals.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber text-ink text-[10px] font-bold flex items-center justify-center">
              {approvals.length}
            </span>
          )}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded border border-gold/40 bg-obsidian/95 text-ivory font-mono text-xs backdrop-blur shadow-2xl">
          {toast}
        </div>
      )}

      {/* Backdrop */}
      {drawer && (
        <div
          className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* QUICK CAPTURE drawer (right side, slides in) */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-obsidian border-l border-steel z-50 transform transition-transform duration-200 ${
          drawer === "capture" ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="px-5 py-4 border-b border-steel flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-gold">▸ Quick Capture</div>
            <div className="font-display text-lg text-ivory mt-1">Drop the order</div>
          </div>
          <button
            onClick={closeDrawer}
            className="font-mono text-[10px] text-ash hover:text-ivory px-2 py-1 rounded border border-steel"
          >
            ESC
          </button>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          <textarea
            ref={captureInputRef}
            value={captureText}
            onChange={(e) => setCaptureText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submitCapture();
              }
            }}
            placeholder="A thought, a directive, a task… Solomon will route it."
            className="w-full min-h-[160px] bg-ink border border-steel rounded-lg p-3 text-sm text-ivory placeholder:text-ash focus:outline-none focus:border-gold/60 font-sans resize-none"
          />

          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-ash mb-2">Priority</div>
            <div className="flex gap-2">
              {(["P1", "P2", "P3"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setCapturePriority(p)}
                  className={`flex-1 py-2 rounded border font-mono text-[11px] tracking-widest uppercase transition ${
                    capturePriority === p
                      ? p === "P1"
                        ? "bg-crimson/15 border-crimson/50 text-crimson"
                        : p === "P2"
                        ? "bg-gold/15 border-gold/50 text-gold"
                        : "bg-steel border-steel-2 text-ivory"
                      : "border-steel text-ash hover:border-steel-2"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-ash mb-2">Route to</div>
            <select
              value={captureAgentId}
              onChange={(e) => setCaptureAgentId(e.target.value)}
              className="w-full bg-ink border border-steel rounded-lg px-3 py-2 text-sm text-ivory font-sans focus:outline-none focus:border-gold/60 cursor-pointer"
            >
              {agents.map((a) => {
                const isSpiritual = a.department === "spiritual";
                const isCoS = a.id === "solomon";
                const prefix = isSpiritual ? "✦ " : isCoS ? "⚜ " : "";
                return (
                  <option key={a.id} value={a.id}>
                    {prefix}{a.name} — {a.role}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="rounded-lg p-3 bg-ink/60 border border-steel/60">
            <div className="font-mono text-[10px] tracking-widest uppercase text-ash mb-1">Routing</div>
            <div className="text-xs text-ivory">
              {captureAgentId === "solomon"
                ? "→ Solomon (Chief of Staff) categorizes intent and dispatches to the right specialist."
                : `→ Direct to ${agents.find(a => a.id === captureAgentId)?.name}. Solomon receives a copy.`}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-steel flex items-center justify-between">
          <div className="font-mono text-[10px] text-ash">⌘ + Enter to ship</div>
          <button
            onClick={submitCapture}
            disabled={!captureText.trim() || submitting}
            className="px-4 py-2 rounded bg-gradient-to-r from-gold to-gold-deep text-ink font-mono text-[11px] tracking-widest uppercase font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            {submitting ? "Shipping…" : "Capture →"}
          </button>
        </div>
      </div>

      {/* APPROVALS drawer (right side) */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-obsidian border-l border-steel z-50 transform transition-transform duration-200 ${
          drawer === "approvals" ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="px-5 py-4 border-b border-steel flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-royal">▸ Approvals Tray</div>
            <div className="font-display text-lg text-ivory mt-1">
              {approvals.length} await your sign-off
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="font-mono text-[10px] text-ash hover:text-ivory px-2 py-1 rounded border border-steel"
          >
            ESC
          </button>
        </div>

        <div className="flex-1 p-5 space-y-3 overflow-y-auto">
          {approvals.length === 0 ? (
            <div className="text-center py-12">
              <div className="font-display text-2xl text-ivory">Inbox zero.</div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-ash mt-2">
                No pending approvals · The army moves.
              </div>
            </div>
          ) : (
            approvals.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-steel bg-ink/40 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-mono text-[10px] tracking-widest uppercase text-gold">
                      {a.agent_id}
                    </div>
                    <div className="text-sm text-ivory mt-1 font-display">{a.title}</div>
                  </div>
                  <span className="font-mono text-[10px] text-ash whitespace-nowrap">
                    {timeAgo(a.created_at)}
                  </span>
                </div>
                {a.preview && (
                  <div className="text-xs text-ash leading-relaxed border-l-2 border-steel pl-3 italic">
                    "{a.preview}"
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => decideApproval(a.id, "approved")}
                    disabled={submitting}
                    className="flex-1 py-2 rounded bg-signal/15 border border-signal/40 text-signal-soft font-mono text-[11px] tracking-widest uppercase hover:bg-signal/25 transition disabled:opacity-40"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => decideApproval(a.id, "declined")}
                    disabled={submitting}
                    className="flex-1 py-2 rounded bg-crimson/10 border border-crimson/30 text-crimson font-mono text-[11px] tracking-widest uppercase hover:bg-crimson/20 transition disabled:opacity-40"
                  >
                    ✗ Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-steel font-mono text-[10px] text-ash text-center">
          Press ⌘A anywhere to toggle · ESC to close
        </div>
      </div>
    </>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
