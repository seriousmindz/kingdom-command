import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

interface CaptureBody {
  text: string;
  priority: "P1" | "P2" | "P3";
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: CaptureBody;
  try {
    body = (await request.json()) as CaptureBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "empty capture" }, { status: 400 });
  if (text.length > 4000) return NextResponse.json({ error: "too long" }, { status: 400 });

  const priorityMap: Record<string, "p1" | "p2" | "p3"> = {
    P1: "p1",
    P2: "p2",
    P3: "p3",
  };
  const priority = priorityMap[body.priority] ?? "p2";

  // Default to founder/agency account scope
  const { data: agencyAccount } = await supabase
    .from("accounts")
    .select("id")
    .eq("type", "agency")
    .limit(1)
    .single();

  const title = text.length > 80 ? text.slice(0, 77) + "…" : text;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      account_id: agencyAccount?.id ?? null,
      agent_id: "solomon",
      title,
      body: text,
      status: "todo",
      priority,
      source: "founder_capture",
      created_by_user: user.id,
      metadata: { captured_via: "cmdk", channel: "cockpit" },
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, task_id: data?.id });
}
