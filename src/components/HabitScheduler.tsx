"use client";

import { HabitSchedule } from "@/types/habit";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HabitScheduler({
  schedule,
  onChange,
}: {
  schedule: HabitSchedule;
  onChange: (s: HabitSchedule) => void;
}) {
  const updateTime = (field: "hour" | "minute", value: number) =>
    onChange({
      ...schedule,
      reminderTime: { ...schedule.reminderTime, [field]: value },
    });

  const toggleDay = (day: number) => {
    const days = schedule.days.includes(day)
      ? schedule.days.filter((d) => d !== day)
      : [...schedule.days, day];
    onChange({ ...schedule, days });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["daily", "weekly", "custom"] as const).map((f) => (
          <button
            key={f}
            onClick={() => onChange({ ...schedule, frequency: f })}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              schedule.frequency === f
                ? "bg-violet-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {schedule.frequency !== "daily" && (
        <div className="flex gap-2">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => toggleDay(i)}
              className={`w-10 h-10 rounded-full text-xs font-semibold transition-all ${
                schedule.days.includes(i)
                  ? "bg-violet-600 text-white scale-110"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-zinc-400 text-sm">Reminder at</span>
        <select
          value={schedule.reminderTime.hour}
          onChange={(e) => updateTime("hour", Number(e.target.value))}
          className="bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {String(i).padStart(2, "0")}h
            </option>
          ))}
        </select>
        <span className="text-zinc-500">:</span>
        <select
          value={schedule.reminderTime.minute}
          onChange={(e) => updateTime("minute", Number(e.target.value))}
          className="bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm"
        >
          {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}m
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Start Date</label>
          <input
            type="date"
            value={schedule.startDate}
            onChange={(e) => onChange({ ...schedule, startDate: e.target.value })}
            className="bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">End Date (optional)</label>
          <input
            type="date"
            value={schedule.endDate || ""}
            onChange={(e) => onChange({ ...schedule, endDate: e.target.value || undefined })}
            className="bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
