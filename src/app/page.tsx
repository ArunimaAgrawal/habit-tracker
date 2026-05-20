"use client";

import HabitScheduler from "@/components/HabitScheduler";
import { HabitSchedule } from "@/types/habit";
import { format } from "date-fns";
import { useState } from "react";

export default function Home() {
  const [schedule, setSchedule] = useState<HabitSchedule>({
    frequency: "daily",
    days: [],
    reminderTime: { hour: 8, minute: 0 },
    startDate: format(new Date(), "yyyy-MM-dd"),
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <section className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">HabitFlow</h1>
        <p className="text-zinc-400">
          Track habits with custom schedules, reminders, and dates.
        </p>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 md:p-6">
          <HabitScheduler schedule={schedule} onChange={setSchedule} />
        </div>
      </section>
    </main>
  );
}
