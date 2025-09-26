"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { differenceInCalendarDays } from "date-fns";
import ToggleToday from "@/components/ToggleToday";
import SiteHeader from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

type Settings = { grad_date: string | null; timezone: string | null; reminder_hour: number | null; };
type Task = { id: string; title: string; order: number; is_daily: boolean; active: boolean; url?: string | null; };
type Quote = { text: string; author: string };

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [_isPending, startTransition] = useTransition();

  // Initial data
  useEffect(() => {
    const supabase = supabaseBrowser();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); setEmail(null); return; }
      setEmail(user.email ?? null);

      const [{ data: s }, { data: t }] = await Promise.all([
        supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("tasks").select("*").eq("user_id", user.id).eq("active", true).order("order"),
      ]);
      setSettings(s ?? null);
      setTasks((t as Task[]) ?? []);
      setLoading(false);
    })();
  }, []);

  // Quote from our Redis-cached API
  useEffect(() => {
    const key = new Date().toISOString().slice(0, 10);
    const cacheKey = `daily-quote-${key}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) { setQuote(JSON.parse(cached)); return; }
    (async () => {
      try {
        const r = await fetch("/api/daily-quote", { cache: "no-store" });
        const q = await r.json();
        setQuote(q);
        localStorage.setItem(cacheKey, JSON.stringify(q));
      } catch {
        setQuote({ text: "Stay consistent. Your future self will thank you.", author: "Unknown" });
      }
    })();
  }, []);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }

  if (!email) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-[60vh] grid place-items-center px-4">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold">Grad Reminder</h1>
            <p>Sign in to set your date and track today’s tasks.</p>
            <Link href="/signin" className="underline">Sign in</Link>
          </div>
        </div>
      </>
    );
  }

  const gradDate = settings?.grad_date ? new Date(settings.grad_date) : null;
  const days = gradDate ? Math.max(0, differenceInCalendarDays(gradDate, new Date())) : null;

  return (
    <>
      <SiteHeader email={email} />

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mx-auto max-w-5xl px-4 py-8 space-y-6"
      >
        {/* Daily Motivation */}
        <Card className="bg-yellow-50 border-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-900/80">Daily boost</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              key={quote?.text ?? "fallback"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-lg font-medium"
            >
              {quote ? `"${quote.text}"` : "Loading…"}
              {quote?.author && <span className="block text-xs text-yellow-900/70 mt-1">— {quote.author}</span>}
            </motion.div>
          </CardContent>
        </Card>

        {/* Countdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Countdown</CardTitle>
          </CardHeader>
          <CardContent>
            {days !== null ? (
              <motion.div layout className="text-4xl font-bold tracking-tight">
                {days} days to graduation
              </motion.div>
            ) : (
              <div className="text-gray-600">
                Set your graduation date in <Link href="/settings" className="underline">Settings</Link>.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-xl">Today’s Tasks</CardTitle>
            <div className="flex gap-3 text-sm text-blue-700">
              <a href="https://leetcode.com/problemset/" target="_blank" rel="noreferrer" className="underline">LeetCode</a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="underline">LinkedIn</a>
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="underline">GitHub</a>
            </div>
          </CardHeader>
          <CardContent>
            <motion.ul layout className="space-y-2">
              {tasks.map((t) => (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-3"
                >
                  <ToggleToday taskId={t.id} title={t.title} url={t.url} />
                </motion.li>
              ))}
              {tasks.length === 0 && (
                <div className="text-sm text-gray-600">
                  No tasks yet — add some on the <Link href="/tasks" className="underline">Tasks</Link> page.
                </div>
              )}
            </motion.ul>
          </CardContent>
        </Card>
      </motion.main>
    </>
  );
}
