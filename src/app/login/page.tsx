"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="cmd-panel max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-gold to-gold-deep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
          </div>
          <div>
            <h1 className="font-display text-2xl text-ivory">Kingdom Command</h1>
            <p className="font-mono text-[10px] tracking-widest uppercase text-ash">Sovereign Telemetry · v3</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <p className="text-ivory mb-2">Check your email.</p>
            <p className="text-sm text-ash">We sent a magic link to <span className="text-gold">{email}</span>. Click it to enter the bridge.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] tracking-widest uppercase text-ash mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-obsidian-2 border border-steel rounded-md px-4 py-3 text-ivory outline-none focus:border-gold transition"
                placeholder="craig@craig.bet"
              />
            </div>
            {error && <p className="text-crimson text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-gold to-gold-deep text-ink font-medium py-3 rounded-md hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Sending..." : "Send magic link →"}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-steel text-center">
          <p className="font-display italic text-ash text-sm">"Unless the Lord builds the house, those who build it labor in vain."</p>
          <p className="font-mono text-[10px] tracking-widest uppercase text-gold mt-2">PSALM 127:1</p>
        </div>
      </div>
    </main>
  );
}
