"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Task = {
  id: string;
  title: string;
  order: number;
  url?: string | null;
};

export default function TasksPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await fetchTasks(user.id);
    })();
  }, [supabase]);

  async function fetchTasks(uid: string) {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", uid)
      .order("order");
    setTasks((data as Task[]) ?? []);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !newTitle.trim()) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: userId,
      title: newTitle.trim(),
      order: tasks.length,
      is_daily: true,
      active: true,
    });
    if (error) return alert(error.message);
    setNewTitle("");
    await fetchTasks(userId);
  }

  // 🔥 handle drag end
  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const newOrder = arrayMove(tasks, oldIndex, newIndex);
    setTasks(newOrder); // optimistic update

    // persist to supabase
    if (userId) {
      for (let i = 0; i < newOrder.length; i++) {
        if (newOrder[i].order !== i) {
          await supabase.from("tasks")
            .update({ order: i })
            .eq("id", newOrder[i].id)
            .eq("user_id", userId);
        }
      }
    }
  }

  // Sensors for drag
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="underline">Home</Link>
          <Link href="/settings" className="underline">Settings</Link>
        </nav>
      </header>

      {/* Add new task */}
      <form onSubmit={addTask} className="flex gap-2">
        <input
          className="flex-1 border rounded-lg p-2"
          placeholder="New task…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button className="px-3 rounded-lg bg-black text-white">Add</button>
      </form>

      {/* Drag-and-drop list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {tasks.map((t) => (
              <SortableTask key={t.id} task={t} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// Individual draggable item
function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="p-3 rounded-xl border bg-white flex items-center justify-between"
    >
      <span>{task.title}</span>
      {/* drag handle */}
      <button
        {...listeners}
        className="cursor-grab text-gray-500 hover:text-black"
        title="Drag to reorder"
      >
        ☰
      </button>
    </li>
  );
}
