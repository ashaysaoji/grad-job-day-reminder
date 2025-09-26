"use client";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { addDays, formatISO, subDays } from "date-fns";

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

export default function ToggleToday({
  taskId,
  title,
  url,
}: { taskId: string; title: string; url?: string | null }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);

  // load today's state + streak on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await refresh(user.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  async function refresh(uid: string) {
    const today = isoDate(new Date());
    // 1) today’s “done?”
    const { data: todayRow } = await supabase
      .from("daily_task_state")
      .select("done")
      .eq("user_id", uid).eq("task_id", taskId).eq("day", today)
      .maybeSingle();
    setDone(!!todayRow?.done);

    // 2) streak: count consecutive days ending today where done=true
    // fetch last 30 days of rows for this task
    const since = isoDate(subDays(new Date(), 60));
    
    const { data: rows = [] } = await supabase
      .from("daily_task_state")
      .select("day, done")
      .eq("user_id", uid).eq("task_id", taskId)
      .gte("day", since).order("day", { ascending: false });

    // build a set of yyyy-mm-dd that are done
    
    const doneSet = new Set(rows?.filter(r => r.done).map(r => r.day)) ?? [];
    let s = 0;
    // walk backwards from today
    let d = new Date();
    for (;;) {
      const key = isoDate(d);
      if (doneSet.has(key)) { s += 1; d = subDays(d, 1); }
      else break;
    }
    setStreak(s);
  }

  async function toggle() {
    if (!userId) return;
    const today = isoDate(new Date());
    const { error } = await supabase
      .from("daily_task_state")
      .upsert({
        user_id: userId,
        task_id: taskId,
        day: today,
        done: !done,
      })
      .select()
      .maybeSingle();
    if (!error) {
      setDone(!done);
      // update streak quickly without refetching all:
      if (!done) setStreak((s) => (s === 0 ? 1 : s + 1)); // if you just completed today
      else setStreak((s) => (s > 0 ? s - 1 : 0));         // if you unchecked today
    }
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={toggle}
        className={`flex items-center gap-3 flex-1 text-left`}
        title="Toggle done"
      >
        <span className={`w-5 h-5 rounded border grid place-items-center ${done ? "bg-black text-white" : "bg-white"}`}>
          {done ? "✓" : ""}
        </span>
        <span className={done ? "line-through text-gray-500" : ""}>{title}</span>
      </button>

      {/* streak pill */}
      <span className="text-xs px-2 py-1 rounded-full border">{streak}🔥</span>

      {/* optional external link */}
      {url ? (
        <a
          href={url} target="_blank" rel="noreferrer"
          className="text-sm underline whitespace-nowrap"
          title="Open link"
        >
          Open
        </a>
      ) : null}
    </div>
  );
}
