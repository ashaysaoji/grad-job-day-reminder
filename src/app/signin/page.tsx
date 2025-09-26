"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignIn() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  // Email+Password form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr(error.message);
    else router.replace("/");
  }

  async function signInWithMagic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setMagicSent(true);
  }

  async function signInWithGoogle() {
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setErr(error.message);
    // On success, browser is redirected to Google, then back to /auth/callback
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md border rounded-2xl p-6 space-y-5 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <Link href="/" className="underline text-sm">Home</Link>
        </div>

        {err && <div className="text-red-700 text-sm">{err}</div>}

        {/* Email + Password */}
        <form onSubmit={signInWithPassword} className="space-y-3">
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
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            disabled={busy}
            className="w-full bg-black text-white rounded-lg p-2 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex-1 border-t" /> OR <span className="flex-1 border-t" />
        </div>

        {/* Magic link */}
        <form onSubmit={signInWithMagic} className="space-y-3">
          <div className="text-sm font-medium">Magic link</div>
          <input
            className="w-full border rounded-lg p-2"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            disabled={busy}
            className="w-full border rounded-lg p-2"
          >
            {busy ? "Sending…" : "Send magic link"}
          </button>
          {magicSent && <div className="text-green-700 text-sm">Check your email for the link.</div>}
        </form>

        {/* Google OAuth */}
        <button
          onClick={signInWithGoogle}
          disabled={busy}
          className="w-full border rounded-lg p-2 disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="text-xs text-gray-600 text-center">
          New here?{" "}
          <Link href="/signup" className="underline">Create an account</Link>
          {"  •  "}
          <Link href="/reset-password" className="underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
