"use client";

import HabitScheduler from "@/components/HabitScheduler";
import { useHabitStore } from "@/store/habitStore";
import { HabitSchedule } from "@/types/habit";
import { format } from "date-fns";
import { useState } from "react";

export default function Home() {
  const habits = useHabitStore((state) => state.habits);
  const addHabit = useHabitStore((state) => state.addHabit);

  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [schedule, setSchedule] = useState<HabitSchedule>({
    frequency: "daily",
    days: [],
    reminderTime: { hour: 8, minute: 0 },
    startDate: format(new Date(), "yyyy-MM-dd"),
  });

  const handleAddHabit = () => {
    const trimmedName = habitName.trim();
    if (!trimmedName) return;

    addHabit({
      name: trimmedName,
      description: habitDescription.trim() || undefined,
      icon: "target",
      color: "#7c3aed",
      schedule,
    });

    setHabitName("");
    setHabitDescription("");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <section className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">HabitFlow</h1>
        <p className="text-zinc-400">
          Track habits with custom schedules, reminders, and dates.
        </p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 md:p-6 space-y-4">
          <h2 className="text-lg font-medium">Add Habit</h2>
          <div className="space-y-3">
            <input
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="Habit name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500"
            />
            <textarea
              value={habitDescription}
              onChange={(e) => setHabitDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500"
            />
          </div>
          <button
            onClick={handleAddHabit}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Save Habit
          </button>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 md:p-6">
          <HabitScheduler schedule={schedule} onChange={setSchedule} />
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 md:p-6 space-y-3">
          <h2 className="text-lg font-medium">Your Habits</h2>
          {habits.length === 0 ? (
            <p className="text-sm text-zinc-400">No habits yet. Add your first one above.</p>
          ) : (
            habits.map((habit) => (
              <article key={habit.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <h3 className="text-base font-semibold">{habit.name}</h3>
                {habit.description ? (
                  <p className="mt-1 text-sm text-zinc-400">{habit.description}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
