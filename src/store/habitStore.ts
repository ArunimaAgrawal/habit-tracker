import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Habit } from "@/types/habit";

interface HabitStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, "id" | "logs" | "createdAt" | "streak">) => void;
  removeHabit: (id: string) => void;
  toggleLog: (habitId: string, date: string) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habit,
              id: crypto.randomUUID(),
              logs: [],
              createdAt: new Date().toISOString(),
              streak: 0,
            },
          ],
        })),
      removeHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),
      toggleLog: (habitId, date) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const exists = h.logs.find((l) => l.date === date);
            const logs = exists
              ? h.logs.map((l) =>
                  l.date === date ? { ...l, completed: !l.completed } : l,
                )
              : [...h.logs, { date, completed: true }];
            return { ...h, logs };
          }),
        })),
      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),
    }),
    { name: "habit-storage" },
  ),
);
