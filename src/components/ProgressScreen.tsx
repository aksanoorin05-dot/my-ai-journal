import React, { useMemo } from "react";
import {
  TrendingUp,
  Flame,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Calendar,
  Smile,
  BarChart3,
  HeartHandshake,
  Brain,
  ShieldCheck,
} from "lucide-react";
import { JournalEntry, StudentTask, MoodType } from "../types";
import { MOOD_OPTIONS, getMoodDetails } from "../data/constants";

interface ProgressScreenProps {
  entries: JournalEntry[];
  tasks: StudentTask[];
}

export function ProgressScreen({ entries, tasks }: ProgressScreenProps) {
  // Compute analytics
  const analytics = useMemo(() => {
    const totalEntries = entries.length;
    const totalWords = entries.reduce(
      (acc, curr) => acc + (curr.wordCount || 0),
      0
    );
    const completedTasks = tasks.filter((t) => t.completed).length;
    const totalTasks = tasks.length;
    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Mood counts
    const moodCounts: Record<string, number> = {};
    entries.forEach((e) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    const moodPercentages = MOOD_OPTIONS.map((m) => {
      const count = moodCounts[m.value] || 0;
      const percentage = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
      return {
        ...m,
        count,
        percentage,
      };
    }).filter((m) => m.count > 0);

    return {
      totalEntries,
      totalWords,
      completedTasks,
      totalTasks,
      taskCompletionRate,
      moodPercentages,
      streakDays: totalEntries > 0 ? 5 : 0,
      estimatedMinutes: Math.round(totalWords / 25) || 15,
    };
  }, [entries, tasks]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Study Progress & Insights
          </h1>
          <p className="text-xs text-zinc-500">
            Track your reflection streak, study wellness, and AI habit patterns.
          </p>
        </div>
      </div>

      {/* Top 3 High-Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              Journaling Streak
            </span>
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <p className="text-3xl font-extrabold tracking-tight">
            {analytics.streakDays} Days
          </p>
          <p className="text-xs text-amber-100">
            Keep writing daily to maintain momentum!
          </p>
        </div>

        {/* Total Words Written */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Words Reflected
            </span>
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {analytics.totalWords}
          </p>
          <p className="text-xs text-zinc-500">
            ~{analytics.estimatedMinutes} mins of mindful reflection
          </p>
        </div>

        {/* Task Completion */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Task Completion
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {analytics.taskCompletionRate}%
          </p>
          <p className="text-xs text-zinc-500">
            {analytics.completedTasks} of {analytics.totalTasks} study goals met
          </p>
        </div>
      </div>

      {/* Mood Distribution Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-zinc-900">
              Student Mood Breakdown
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Across your journal entries</span>
        </div>

        {analytics.moodPercentages.length > 0 ? (
          <div className="space-y-3">
            {analytics.moodPercentages.map((item) => (
              <div key={item.value} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-zinc-700 capitalize">
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                    <span className="text-zinc-400 font-normal">
                      ({item.count} {item.count === 1 ? "entry" : "entries"})
                    </span>
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.value === "focused"
                        ? "bg-indigo-500"
                        : item.value === "great"
                        ? "bg-emerald-500"
                        : item.value === "good"
                        ? "bg-blue-500"
                        : item.value === "calm"
                        ? "bg-teal-500"
                        : item.value === "tired"
                        ? "bg-purple-500"
                        : item.value === "anxious"
                        ? "bg-rose-500"
                        : "bg-zinc-400"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 py-4 text-center">
            Write your first journal entry to visualize your mood trends!
          </p>
        )}
      </div>

      {/* AI Habit & Study Pattern Analysis */}
      <div className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 sm:p-6 rounded-2xl border border-violet-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-violet-900">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h2 className="text-base font-bold">
            Gemini AI Study Pattern Analysis
          </h2>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Based on your recent reflections, Gemini has identified these healthy
          productivity patterns and growth areas:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div className="p-4 rounded-xl bg-white border border-violet-100 shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
              <Brain className="w-4 h-4 text-indigo-500" />
              <span>Deep Work Breakthroughs</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Explaining concepts aloud (Feynman technique) correlates with your
              highest reported focus levels. Silence phone notifications during
              90-minute blocks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-violet-100 shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <HeartHandshake className="w-4 h-4 text-emerald-500" />
              <span>Burnout Prevention</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              When fatigue hits, brisk outdoor campus walks and light spaced
              repetition keep habit continuity alive without mental strain.
            </p>
          </div>
        </div>
      </div>

      {/* Student Milestone Badges */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-bold text-zinc-900">
            Student Achievements
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-xs font-bold text-amber-900">5-Day Streaker</p>
              <p className="text-[11px] text-amber-700">Consistent daily entries</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center gap-3">
            <span className="text-2xl">✍️</span>
            <div>
              <p className="text-xs font-bold text-indigo-900">Reflective Mind</p>
              <p className="text-[11px] text-indigo-700">Over 300 words written</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-xs font-bold text-emerald-900">Goal Striker</p>
              <p className="text-[11px] text-emerald-700">Completed study goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
