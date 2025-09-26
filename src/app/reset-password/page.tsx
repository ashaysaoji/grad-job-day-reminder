"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ResetPassword() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/update`,
    });
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md border rounded-2xl p-6 space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <Link href="/signin" className="underline text-sm">Sign in</Link>
        </div>
        {err && <div className="text-red-700 text-sm">{err}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full border rounded-lg p-2"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="w-full bg-black text-white rounded-lg p-2">
            Send reset link
          </button>
        </form>
        {sent && <div className="text-green-700 text-sm">Check your email.</div>}
      </div>
    </div>
  );
}
