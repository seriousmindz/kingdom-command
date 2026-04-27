import { getSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import CockpitShell from "@/components/CockpitShell";

export const dynamic = "force-dynamic";

type Heartbeat = {
  agent_id: string;
  status: string;
  success_rate_24h: number | null;
  runs_24h: number;
  cost_usd_24h: number;
  last_action: string | null;
  last_heartbeat_at: string;
  tokens_in_24h: number;
  tokens_out_24h: number;
};

type Entity = {
  id: string;
  name: string;
  role: string;
  department: string;
  function: string;
};

type Account = {
  id: string;
  type: string;
  name: string;
  monthly_revenue: number;
  status: string;
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function CockpitPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: entities }, { data: heartbeats }, { data: accounts }, { data: pendingApprovals }] = await Promise.all([
    supabase.from("kingdom_entities").select("id, name, role, department, function").order("name"),
    supabase.from("entity_heartbeats").select("*").order("cost_usd_24h", { ascending: false }),
    supabase.from("accounts").select("*").order("monthly_revenue", { ascending: false }),
    supabase.from("approvals").select("id, agent_id, title, preview, status, created_at").eq("status", "pending").order("created_at", { ascending: false }),
  ]);

  const ents: Entity[] = entities ?? [];
  const hbs: Heartbeat[] = heartbeats ?? [];
  const accts: Account[] = accounts ?? [];
  const approvalsList = pendingApprovals ?? [];
  const entMap = new Map(ents.map(e => [e.id, e]));

  const totalCost = hbs.reduce((s, h) => s + Number(h.cost_usd_24h ?? 0), 0);
  const totalTokens = hbs.reduce((s, h) => s + Number(h.tokens_in_24h ?? 0) + Number(h.tokens_out_24h ?? 0), 0);
  const totalRuns = hbs.reduce((s, h) => s + Number(h.runs_24h ?? 0), 0);
  const totalMrr = accts.reduce((s, a) => s + Number(a.monthly_revenue ?? 0), 0);
  const greenCount = hbs.filter(h => h.status === "green").length;
  const yellowCount = hbs.filter(h => h.status === "yellow").length;
  const approvalCount = hbs.filter(h => h.status === "approval").length;
  const idleCount = hbs.filter(h => h.status === "idle").length;
  const properties = accts.filter(a => a.type === "property");
  const clients = accts.filter(a => a.type === "client");
  const topAgents = hbs.slice(0, 10);

  return (
    <CockpitShell initialApprovals={approvalsList}>
    <main className="min-h-screen px-8 py-6">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-steel">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-gold to-gold-deep">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
            </div>
            <div>
              <div className="font-display text-xl text-ivory">Kingdom Cockpit</div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-ash">Founder Bridge · Live from Supabase</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 rounded border border-signal/30 bg-signal/10 text-signal-soft">
              ● {greenCount} OPERATIONAL
            </span>
            <span className="font-mono text-[11px] text-ash">{user?.email ?? ""}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-gold">▸ Sovereign Telemetry · Multi-Tenant</div>
            <h1 className="font-display text-4xl mt-1 text-ivory">Good morning, Founder.</h1>
            <p className="text-sm mt-2 text-ash">{ents.length} entities · {properties.length} properties · {clients.length} clients · {approvalsList.length} await your sign-off · press <span className="font-mono text-gold">⌘A</span></p>
          </div>
          <div className="text-right">
            <div className="font-display text-5xl text-gold">${totalMrr.toLocaleString()}</div>
            <div className="font-mono text-[10px] tracking-widest uppercase mt-1 text-ash">Total MRR · all accounts</div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-5 gap-4">
          <KpiCard num={String(ents.length)} label="Entities Enabled" sub={`${greenCount} green · ${yellowCount} yellow · ${approvalCount} approval`} accent="gold" />
          <KpiCard num={String(totalRuns)} label="Runs · 24h" sub={`${(totalTokens/1000).toFixed(0)}k tokens total`} />
          <KpiCard num={String(properties.length)} label="Properties" sub={properties.map(p => p.name).join(" · ")} />
          <KpiCard num={String(clients.length)} label="Clients · 100 slots" sub={`${100 - clients.length} open · click + to add`} />
          <KpiCard num={`$${totalCost.toFixed(2)}`} label="Compute · 24h" sub="of $1500 monthly budget" accent="gold" />
        </div>

        {/* Token & Cost Live Table */}
        <div className="cmd-panel">
          <div className="px-4 py-3 border-b border-steel flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-widest uppercase text-gold">▸ AGENT LIVE TELEMETRY · COST & TOKEN BURN · 24H</span>
            <span className="font-mono text-[10px] text-ash">${totalCost.toFixed(2)} total · {(totalTokens/1000).toFixed(0)}k tokens</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-obsidian-2">
                  {["AGENT", "DEPT", "LAST ACTION", "RUNS", "TOKENS", "$ COST", "AVG/RUN", "STATUS"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase text-ash border-b border-steel">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topAgents.map(h => {
                  const e = entMap.get(h.agent_id);
                  const avg = h.runs_24h > 0 ? Number(h.cost_usd_24h) / h.runs_24h : 0;
                  return (
                    <tr key={h.agent_id} className="border-b border-steel/40 hover:bg-steel/30 transition">
                      <td className="px-4 py-3 text-sm">
                        <div className="text-ivory">{e?.name ?? h.agent_id}</div>
                        <div className="font-mono text-[10px] text-ash">{e?.role ?? ""}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ash">{e?.department ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-ivory truncate max-w-[280px]">{h.last_action ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ivory text-right">{h.runs_24h}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ivory text-right">{(h.tokens_in_24h/1000).toFixed(0)}k/{(h.tokens_out_24h/1000).toFixed(0)}k</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-gold text-right">${Number(h.cost_usd_24h).toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ash text-right">${avg.toFixed(3)}</td>
                      <td className="px-4 py-3"><StatusPill status={h.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-steel/50 text-center font-mono text-[10px] text-ash">
            + {hbs.length - topAgents.length} more entities · {greenCount}G · {yellowCount}Y · {approvalCount}A · {idleCount}IDLE
          </div>
        </div>

        {/* Properties + Clients */}
        <div className="grid grid-cols-2 gap-4">
          <div className="cmd-panel">
            <div className="px-4 py-3 border-b border-steel font-mono text-[11px] tracking-widest uppercase text-gold">▸ PROPERTIES · {properties.length}</div>
            <div className="p-4 space-y-2">
              {properties.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded bg-obsidian-2">
                  <div className="flex items-center gap-2">
                    <span className={`status-dot ${p.status === "active" ? "green" : "amber"}`} />
                    <span className="text-sm text-ivory">{p.name}</span>
                  </div>
                  <span className="font-mono text-xs text-gold">${(Number(p.monthly_revenue)/1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cmd-panel">
            <div className="px-4 py-3 border-b border-steel font-mono text-[11px] tracking-widest uppercase text-gold flex items-center justify-between">
              <span>▸ CLIENTS · {clients.length} / 100 slots</span>
              <button className="font-mono text-[10px] px-2 py-1 rounded bg-gold text-ink">+ ADD</button>
            </div>
            <div className="p-4 space-y-2 max-h-[280px] overflow-y-auto">
              {clients.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded bg-obsidian-2">
                  <div className="flex items-center gap-2">
                    <span className={`status-dot ${c.status === "active" ? "green" : c.status === "onboarding" ? "gold" : "amber"}`} />
                    <span className="text-sm text-ivory">{c.name}</span>
                  </div>
                  <span className="font-mono text-xs text-ash">{c.monthly_revenue > 0 ? `$${Number(c.monthly_revenue).toLocaleString()}/mo` : c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scripture */}
        <div className="rounded-xl p-5 border border-gold/20" style={{ background: "linear-gradient(135deg, rgba(212,168,83,0.06), rgba(127,119,221,0.04))" }}>
          <p className="font-display italic text-ivory text-lg">"Unless the Lord builds the house, those who build it labor in vain."</p>
          <p className="font-mono text-[10px] tracking-widest uppercase mt-2 text-gold">PSALM 127:1 · DAILY ANCHOR</p>
        </div>

        <div className="text-center text-xs text-ash pb-8 font-mono">
          Kingdom Command v3 · Sovereign Telemetry · v4 · Live from tlaqntsybxmnqnzrcaav · {ents.length} entities · {accts.length} accounts · ⌘K capture · ⌘A approvals
        </div>
      </div>
    </main>
    </CockpitShell>
  );
}

function KpiCard({ num, label, sub, accent }: { num: string; label: string; sub: string; accent?: "gold" }) {
  return (
    <div className="cmd-panel p-4">
      <div className={`font-display text-3xl ${accent === "gold" ? "text-gold" : "text-ivory"}`}>{num}</div>
      <div className="font-mono text-[10px] tracking-widest uppercase text-ash mt-2">{label}</div>
      <div className="text-xs text-ash mt-1">{sub}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls: Record<string, string> = {
    green: "bg-signal/12 text-signal-soft border-signal/30",
    yellow: "bg-amber/12 text-amber border-amber/30",
    approval: "bg-royal/12 text-royal border-royal/30",
    red: "bg-crimson/12 text-crimson border-crimson/30",
    idle: "bg-steel text-ash border-steel-2",
  };
  return (
    <span className={`font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded border ${cls[status] ?? cls.idle}`}>
      {status}
    </span>
  );
}
