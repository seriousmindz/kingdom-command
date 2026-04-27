import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

interface DecideBody {
  id: string;
  decision: "approved" | "declined";
  note?: string;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: DecideBody;
  try {
    body = (await request.json()) as DecideBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body.id || (body.decision !== "approved" && body.decision !== "declined")) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { error } = await supabase
    .from("approvals")
    .update({
      status: body.decision,
      reviewed_by: user.id,
      reviewer_note: body.note ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
