import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/cockpit");
  redirect("/login");
}
