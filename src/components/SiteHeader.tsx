"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SiteHeader({ email }: { email?: string | null }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="sticky top-0 z-40 backdrop-blur bg-white/60 border-b"
    >
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">🎓 Grad Reminder</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/tasks" className="hover:underline">Tasks</Link>
          <Link href="/settings" className="hover:underline">Settings</Link>
          {email && <span className="hidden sm:inline text-gray-600">{email}</span>}
          <button
            className="underline"
            onClick={async () => { (await import("@/lib/supabase-browser")).supabaseBrowser().auth.signOut().then(()=>location.href="/signin"); }}
          >
            Sign out
          </button>
        </nav>
      </div>
    </motion.header>
  );
}
