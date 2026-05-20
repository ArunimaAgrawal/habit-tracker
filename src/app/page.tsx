"use client";

import { useHabitStore } from "@/store/habitStore";
import { Habit } from "@/types/habit";
import { format } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import {
  Calendar,
  Check,
 Clock3,
  Filter,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Target,
  Timer,
  TimerReset,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type FilterMode = "all" | "active" | "completed";
type PageMode = "habits" | "timer";
type TimerMode = "stopwatch" | "countdown";

const CHIP_COLORS = [
  "#57B588",
  "#4E7DD9",
  "#E5A23A",
  "#DF5249",
  "#7D5BDE",
  "#CF5198",
  "#56A8C5",
  "#90C63F",
];

function isCompletedToday(habit: Habit) {
  const today = format(new Date(), "yyyy-MM-dd");
  return habit.logs.some((log) => log.date === today && log.completed);
}

function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function Home() {
  const habits = useHabitStore((state) => state.habits);
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const removeHabit = useHabitStore((state) => state.removeHabit);
  const toggleLog = useHabitStore((state) => state.toggleLog);

  const [pageMode, setPageMode] = useState<PageMode>("habits");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [selectedColor, setSelectedColor] = useState(CHIP_COLORS[0]);

  const [timerMode, setTimerMode] = useState<TimerMode>("stopwatch");
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  const [countdownMinutesInput, setCountdownMinutesInput] = useState(5);
  const [countdownSecondsInput, setCountdownSecondsInput] = useState(0);
  const [countdownSecondsLeft, setCountdownSecondsLeft] = useState(5 * 60);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);

  useEffect(() => {
    if (!isStopwatchRunning) return;
    const id = window.setInterval(() => {
      setStopwatchSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isStopwatchRunning]);

  useEffect(() => {
    if (!isCountdownRunning) return;
    const id = window.setInterval(() => {
      setCountdownSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsCountdownRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isCountdownRunning]);

  const completedToday = useMemo(
    () => habits.filter((habit) => isCompletedToday(habit)).length,
    [habits],
  );

  const progress = habits.length === 0 ? 0 : (completedToday / habits.length) * 100;

  const visibleHabits = useMemo(() => {
    return habits.filter((habit) => {
      const matchesSearch =
        habit.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (habit.description || "").toLowerCase().includes(searchText.toLowerCase());

      if (!matchesSearch) return false;

      const done = isCompletedToday(habit);
      if (filterMode === "completed") return done;
      if (filterMode === "active") return !done;
      return true;
    });
  }, [filterMode, habits, searchText]);

  const saveHabit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const date = scheduleAt ? new Date(scheduleAt) : new Date();

    if (editingHabitId) {
      updateHabit(editingHabitId, {
        name: trimmed,
        icon: emoji.trim() || "target",
        description: description.trim() || undefined,
        color: selectedColor,
        schedule: {
          frequency: "daily",
          days: [],
          reminderTime: {
            hour: date.getHours(),
            minute: date.getMinutes(),
          },
          startDate: format(date, "yyyy-MM-dd"),
        },
      });
    } else {
      addHabit({
        name: trimmed,
        icon: emoji.trim() || "target",
        description: description.trim() || undefined,
        color: selectedColor,
        schedule: {
          frequency: "daily",
          days: [],
          reminderTime: {
            hour: date.getHours(),
            minute: date.getMinutes(),
          },
          startDate: format(date, "yyyy-MM-dd"),
        },
      });
    }

    setName("");
    setEmoji("");
    setIsEmojiPickerOpen(false);
    setDescription("");
    setScheduleAt("");
    setSelectedColor(CHIP_COLORS[0]);
    setEditingHabitId(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingHabitId(null);
    setName("");
    setEmoji("");
    setIsEmojiPickerOpen(false);
    setDescription("");
    setScheduleAt("");
    setSelectedColor(CHIP_COLORS[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setName(habit.name);
    setEmoji(habit.icon && habit.icon !== "target" ? habit.icon : "");
    setIsEmojiPickerOpen(false);
    setDescription(habit.description || "");
    setSelectedColor(habit.color || CHIP_COLORS[0]);
    const hh = String(habit.schedule.reminderTime.hour).padStart(2, "0");
    const mm = String(habit.schedule.reminderTime.minute).padStart(2, "0");
    setScheduleAt(`${habit.schedule.startDate}T${hh}:${mm}`);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHabitId(null);
  };

  const applyCountdownInputs = () => {
    const mins = Math.max(0, Math.min(99, Number(countdownMinutesInput) || 0));
    const secs = Math.max(0, Math.min(59, Number(countdownSecondsInput) || 0));
    setCountdownMinutesInput(mins);
    setCountdownSecondsInput(secs);
    setCountdownSecondsLeft(mins * 60 + secs);
  };

  const isTimerRunning = timerMode === "stopwatch" ? isStopwatchRunning : isCountdownRunning;
  const timerDisplay =
    timerMode === "stopwatch"
      ? formatSeconds(stopwatchSeconds)
      : formatSeconds(countdownSecondsLeft);

  const handleTimerStartPause = () => {
    if (timerMode === "stopwatch") {
      setIsStopwatchRunning((prev) => !prev);
      return;
    }

    if (!isCountdownRunning && countdownSecondsLeft === 0) {
      applyCountdownInputs();
    }
    setIsCountdownRunning((prev) => !prev);
  };

  const handleTimerReset = () => {
    if (timerMode === "stopwatch") {
      setIsStopwatchRunning(false);
      setStopwatchSeconds(0);
      return;
    }

    setIsCountdownRunning(false);
    applyCountdownInputs();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F5F9] text-[#1F2A44]">
      <div className="origin-top scale-[0.72] md:scale-[0.66]">
        <header className="bg-transparent">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 md:px-6">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1E2A44] text-white shadow-md">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl leading-none font-semibold tracking-tight md:text-4xl">Habitual</p>
                <p className="text-sm text-[#8C9AB2] md:text-base">Track. Focus. Grow.</p>
              </div>
            </div>

            <nav className="hidden rounded-3xl border border-[#D5DDE8] bg-[#F3F5F9] p-2 md:flex">
              <button
                onClick={() => setPageMode("habits")}
                className={`flex items-center gap-3 rounded-2xl px-5 py-2.5 text-xl font-semibold ${
                  pageMode === "habits"
                    ? "bg-white text-[#1E2A44] shadow-sm"
                    : "text-[#97A5BB]"
                }`}
              >
                <Target className="h-4 w-4" /> Habits
              </button>
              <button
                onClick={() => setPageMode("timer")}
                className={`flex items-center gap-3 rounded-2xl px-5 py-2.5 text-xl font-semibold ${
                  pageMode === "timer"
                    ? "bg-white text-[#1E2A44] shadow-sm"
                    : "text-[#97A5BB]"
                }`}
              >
                <Clock3 className="h-4 w-4" /> Timer
              </button>
            </nav>
          </div>
        </header>

        {pageMode === "habits" ? (
          <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
            <section className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">My Habits</h1>
                <p className="mt-2 text-sm text-[#8C9AB2] md:text-2xl">
                  {completedToday} of {habits.length} completed today
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2.5 rounded-3xl bg-[#1E2A44] px-6 py-2.5 text-lg font-semibold text-white shadow-lg md:min-w-48 md:text-2xl"
              >
                <Plus className="h-5 w-5" /> Add Habit
              </button>
            </section>

            <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-[#E6EBF2]">
              <div className="h-full rounded-full bg-[#57B588] transition-all" style={{ width: `${progress}%` }} />
            </div>

            <section className="mt-6 flex flex-col gap-3 md:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-3xl border border-[#CCD5E3] bg-white px-4 py-2.5">
                <Search className="h-5 w-5 text-[#8FA0B8]" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search habits..."
                  className="w-full bg-transparent text-base text-[#5E6D86] outline-none placeholder:text-[#9AA8BC] md:text-2xl"
                />
              </div>

              <div className="flex items-center gap-2 rounded-3xl border border-[#CCD5E3] bg-white p-2">
                <div className="grid h-10 w-10 place-items-center text-[#8FA0B8] md:h-12 md:w-12">
                  <Filter className="h-4 w-4" />
                </div>
                {(["all", "active", "completed"] as FilterMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize md:text-xl ${
                      filterMode === mode
                        ? "bg-[#F4F6FA] text-[#1F2A44] shadow-sm"
                        : "text-[#8FA0B8]"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-5 space-y-3">
              {visibleHabits.length === 0 ? (
                <div className="rounded-3xl border border-[#D8DFEA] bg-white p-10 text-center text-xl text-[#8FA0B8]">
                  No habits found. Create one to get started.
                </div>
              ) : (
                visibleHabits.map((habit) => {
                  const done = isCompletedToday(habit);
                  const reminderText = `${habit.schedule.startDate} ${String(habit.schedule.reminderTime.hour).padStart(2, "0")}:${String(habit.schedule.reminderTime.minute).padStart(2, "0")}`;

                  return (
                    <article
                      key={habit.id}
                      className={`rounded-3xl border-[3px] bg-white p-4 shadow-sm transition-all md:p-5 ${
                        done ? "border-[#DF5249]/90 bg-[#FFF8F8]" : "border-[#D2DAE8]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 md:gap-6">
                          <button
                            onClick={() => toggleLog(habit.id, format(new Date(), "yyyy-MM-dd"))}
                            className={`grid h-10 w-10 place-items-center rounded-full border-[3px] md:h-12 md:w-12 ${
                              done
                                ? "border-[#DF5249] bg-[#DF5249] text-white"
                                : "border-[#B9C5D7] text-transparent"
                            }`}
                            aria-label="Toggle completed"
                          >
                            <Check className="h-5 w-5" />
                          </button>

                          <div>
                            <div className="flex items-center gap-4">
                              {habit.icon && habit.icon !== "target" ? (
                                <span className="text-xl md:text-2xl">{habit.icon}</span>
                              ) : null}
                              <h3
                                className={`text-xl font-semibold md:text-3xl ${
                                  done ? "text-[#CF514A] line-through" : "text-[#1F2A44]"
                                }`}
                              >
                                {habit.name}
                              </h3>
                            </div>

                            {habit.description ? (
                              <p className="mt-1.5 text-xs text-[#73839B] md:text-lg">{habit.description}</p>
                            ) : null}

                            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[#EEF2F7] px-3 py-1.5 text-xs font-semibold text-[#8D9BB1] md:text-base">
                              <Calendar className="h-4 w-4" /> {reminderText}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[#98A6BB]">
                          <button onClick={() => openEditModal(habit)} className="p-1" aria-label="Edit habit">
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button onClick={() => removeHabit(habit.id)} className="p-1" aria-label="Delete habit">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </main>
        ) : (
          <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-10">
            <section className="rounded-[2rem] border border-[#D3DBE8] bg-white p-5 shadow-sm md:p-7">
              <div className="flex gap-2">
                <button
                  onClick={() => setTimerMode("stopwatch")}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-lg font-semibold ${
                    timerMode === "stopwatch"
                      ? "bg-[#1E2A44] text-white shadow-md"
                      : "bg-[#EEF2F7] text-[#64748F]"
                  }`}
                >
                  <Timer className="h-4 w-4" /> Stopwatch
                </button>
                <button
                  onClick={() => setTimerMode("countdown")}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-lg font-semibold ${
                    timerMode === "countdown"
                      ? "bg-[#1E2A44] text-white shadow-md"
                      : "bg-[#EEF2F7] text-[#64748F]"
                  }`}
                >
                  <TimerReset className="h-4 w-4" /> Countdown
                </button>
              </div>

              {timerMode === "countdown" ? (
                <div className="mt-4 flex items-center gap-4 text-base">
                  <label className="text-[#64748F] font-medium">Min</label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={countdownMinutesInput}
                    onChange={(e) => setCountdownMinutesInput(Number(e.target.value))}
                    disabled={isCountdownRunning}
                    className="w-20 rounded-2xl border border-[#CAD4E2] bg-[#F7F9FC] px-3 py-2 text-center text-xl font-semibold text-[#33435B] outline-none disabled:opacity-60"
                  />
                  <label className="text-[#64748F] font-medium">Sec</label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={countdownSecondsInput}
                    onChange={(e) => setCountdownSecondsInput(Number(e.target.value))}
                    disabled={isCountdownRunning}
                    className="w-20 rounded-2xl border border-[#CAD4E2] bg-[#F7F9FC] px-3 py-2 text-center text-xl font-semibold text-[#33435B] outline-none disabled:opacity-60"
                  />
                  <button
                    onClick={applyCountdownInputs}
                    disabled={isCountdownRunning}
                    className="rounded-2xl border border-[#CAD4E2] px-5 py-2 text-xl font-semibold text-[#5D6B84] disabled:opacity-60"
                  >
                    Apply
                  </button>
                </div>
              ) : null}

              <div className="mt-8 text-center text-7xl font-semibold tracking-tight text-[#90A0B8] md:text-8xl">
                {timerDisplay}
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={handleTimerStartPause}
                  className={`inline-flex min-w-40 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xl font-semibold text-white shadow-md ${
                    isTimerRunning ? "bg-[#E5A23A]" : "bg-[#57B588]"
                  }`}
                >
                  {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {isTimerRunning ? "Pause" : timerMode === "countdown" && countdownSecondsLeft < countdownMinutesInput * 60 + countdownSecondsInput ? "Resume" : "Start"}
                </button>
                <button
                  onClick={handleTimerReset}
                  className="inline-flex min-w-32 items-center justify-center gap-2 rounded-2xl border border-[#CAD4E2] px-5 py-3 text-xl font-semibold text-[#4F5D75]"
                >
                  <RotateCcw className="h-5 w-5" /> Reset
                </button>
              </div>
            </section>
          </main>
        )}

      </div>
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C2942]/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[2.2rem] border border-[#DCE3EF] bg-white p-7 shadow-2xl md:p-8">
            <h2 className="text-4xl font-semibold text-[#33435B] md:text-5xl">
              {editingHabitId ? "Edit Habit" : "Create New Habit"}
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-2xl font-semibold text-[#3A4860]">Habit Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Morning meditation"
                  className="h-20 w-full rounded-[1.8rem] border border-[#BCC8DA] bg-[#F5F7FC] px-6 text-3xl text-[#35455E] outline-none placeholder:text-[#8D97AA]"
                />
              </div>

              <div>
                <label className="mb-2 block text-2xl font-semibold text-[#3A4860]">
                  Emoji (optional)
                </label>
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="e.g. 🧘"
                  maxLength={2}
                  className="h-20 w-full rounded-[1.8rem] border border-[#BCC8DA] bg-[#F5F7FC] px-6 text-3xl text-[#35455E] outline-none placeholder:text-[#8D97AA]"
                />
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                    className="rounded-2xl border border-[#CAD4E2] bg-white px-5 py-2 text-xl font-semibold text-[#4B5A73]"
                  >
                    {isEmojiPickerOpen ? "Close Emoji List" : "Open Emoji Dropdown"}
                  </button>
                  {isEmojiPickerOpen ? (
                    <div className="mt-3 overflow-hidden rounded-3xl border border-[#CAD4E2] bg-white p-2">
                      <EmojiPicker
                        width="100%"
                        height={380}
                        searchDisabled={false}
                        onEmojiClick={(emojiData) => {
                          setEmoji(emojiData.emoji);
                          setIsEmojiPickerOpen(false);
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-2xl font-semibold text-[#3A4860]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this habit about?"
                  rows={4}
                  className="w-full rounded-[1.8rem] border border-[#BCC8DA] bg-[#F5F7FC] px-6 py-4 text-3xl text-[#35455E] outline-none placeholder:text-[#8D97AA]"
                />
              </div>

              <div>
                <label className="mb-2 block text-2xl font-semibold text-[#3A4860]">Schedule</label>
                <input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  className="h-20 w-full rounded-[1.8rem] border border-[#BCC8DA] bg-[#F5F7FC] px-6 text-3xl text-[#1F2A44] outline-none"
                />
              </div>

              <div>
                <p className="mb-4 text-3xl font-semibold text-[#3A4860]">Color</p>
                <div className="flex flex-wrap gap-4">
                  {CHIP_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-20 w-20 rounded-3xl ${
                        selectedColor === color ? "ring-4 ring-[#A7BCE6] ring-offset-4" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 md:flex-row md:justify-end">
              <button
                onClick={closeModal}
                className="rounded-[2rem] border border-[#CAD4E2] px-12 py-5 text-5xl font-semibold text-[#6C7A90]"
              >
                Cancel
              </button>
              <button
                onClick={saveHabit}
                className="inline-flex min-w-96 items-center justify-center gap-4 rounded-[2rem] bg-[#1E2A44] px-12 py-5 text-5xl font-semibold text-white"
              >
                <Plus className="h-7 w-7" /> {editingHabitId ? "Save Changes" : "Create Habit"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
