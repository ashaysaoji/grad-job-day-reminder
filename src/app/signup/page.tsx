"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignUp() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needVerify, setNeedVerify] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }
    // If "Confirm email" is ON, Supabase sends a verify link and user must click it.
    if (data?.user && !data.user.confirmed_at) {
      setNeedVerify(true);
      return;
    }
    // If confirm is OFF, user is signed in immediately:
    router.replace("/");
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md border rounded-2xl p-6 space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <Link href="/signin" className="underline text-sm">Sign in</Link>
        </div>

        {err && <div className="text-red-700 text-sm">{err}</div>}

        {needVerify ? (
          <div className="text-sm text-green-700">
            Check your email to verify your account.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              className="w-full border rounded-lg p-2"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full border rounded-lg p-2"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              disabled={busy}
              className="w-full bg-black text-white rounded-lg p-2 disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
