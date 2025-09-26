"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function UpdatePassword() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts a recovery token in the URL; this page consumes it automatically.
    supabase.auth.getSession().finally(() => setReady(true));
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setErr(error.message);
    else router.replace("/signin");
  }

  if (!ready) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md border rounded-2xl p-6 space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Set a new password</h1>
          <Link href="/signin" className="underline text-sm">Sign in</Link>
        </div>
        {err && <div className="text-red-700 text-sm">{err}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full border rounded-lg p-2"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-black text-white rounded-lg p-2">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
