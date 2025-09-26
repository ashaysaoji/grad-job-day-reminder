"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseBrowser();
    // Supabase reads the access token from the URL hash and stores the session
    supabase.auth.getSession().finally(() => {
      router.replace("/"); // go to dashboard/home after sign-in
    });
  }, [router]);

  return <div className="p-6">Signing you in…</div>;
}
