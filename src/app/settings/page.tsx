"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

type DefaultTask = { title: string; url: string | null };

const DEFAULT_TASKS: DefaultTask[] = [
  { title: "Pray", url: null },
  { title: "LeetCode", url: "https://leetcode.com/problemset/" },
  { title: "Apply to jobs", url: "https://www.linkedin.com/jobs/" },
  { title: "Network on LinkedIn", url: "https://www.linkedin.com/mynetwork/" },
  { title: "Work on project", url: null },
  { title: "Workout", url: "https://www.youtube.com/results?search_query=20+min+workout" },
  { title: "Eat healthy", url: "https://www.reddit.com/r/MealPrepSunday/" },
];

export default function SettingsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [gradDate, setGradDate] = useState("");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [reminderHour, setReminderHour] = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setEmail(user.email ?? null);

      // Ensure a settings row exists (idempotent)
      await supabase.from("user_settings").upsert({
        user_id: user.id,
        timezone,
        reminder_hour: 8,
      });

      // Load settings
      const { data: s } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (s?.grad_date) setGradDate(s.grad_date);
      if (s?.timezone) setTimezone(s.timezone);
      if (typeof s?.reminder_hour === "number") setReminderHour(s.reminder_hour);

      // Seed default tasks once per user (with URLs!)
      const { data: existing } = await supabase
        .from("tasks")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (!existing || existing.length === 0) {
        const rows = DEFAULT_TASKS.map((t, i) => ({
          user_id: user.id,
          title: t.title,
          url: t.url,
          order: i,
          active: true,
          is_daily: true,
        }));
        const { error } = await supabase.from("tasks").insert(rows);
        if (!error) setSeeded(true);
      }

      setLoading(false);
    })();
  }, [supabase]); // supabase is memoized

  async function save() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      grad_date: gradDate || null,
      timezone,
      reminder_hour: reminderHour,
    });

    setSaving(false);
    if (error) {
      alert(error.message);
    } else {
      alert("Saved!");
    }
  }

  if (loading) {
    return <div className="min-h-[60vh] grid place-items-center">Loading…</div>;
  }

  if (!email) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center space-y-2">
          <p>Please sign in first.</p>
          <Link className="underline" href="/signin">Sign in</Link>
        </div>
      </div>
    );
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="underline">Home</Link>
          <Link href="/tasks" className="underline">Tasks</Link>
        </nav>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <small className="text-gray-600">{email}</small>
      </header>

      <div className="rounded-2xl border p-6 bg-white space-y-4">
        <label className="block">
          <div className="text-sm font-medium mb-1">Graduation date</div>
          <input
            type="date"
            className="border rounded-lg p-2 w-full"
            value={gradDate}
            onChange={(e) => setGradDate(e.target.value)}
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium mb-1">Timezone (IANA)</div>
          <input
            className="border rounded-lg p-2 w-full"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="e.g. America/New_York"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium mb-1">Reminder hour (0–23)</div>
          <select
            className="border rounded-lg p-2 w-full"
            value={reminderHour}
            onChange={(e) => setReminderHour(parseInt(e.target.value, 10))}
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}:00
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg p-2 bg-black text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>

        {seeded && (
          <div className="text-xs text-green-700">
            Default tasks added for your account.
          </div>
        )}
      </div>
    </div>
  );
}
