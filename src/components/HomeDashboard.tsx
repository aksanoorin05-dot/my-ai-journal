import React, { useState, useMemo } from "react";
import {
  Sparkles,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Plus,
  ArrowRight,
  Flame,
  Calendar,
  Clock,
  Lightbulb,
  CheckCircle2,
  Circle,
  Quote,
} from "lucide-react";
import { JournalEntry, StudentTask, PageView, MoodType } from "../types";
import { useAuth } from "../context/AuthContext";
import { MOOD_OPTIONS, getMoodDetails } from "../data/constants";
import { MOTIVATIONAL_QUOTES } from "../data/sampleData";

interface HomeDashboardProps {
  entries: JournalEntry[];
  tasks: StudentTask[];
  onToggleTask: (taskId: string) => void;
  onNavigate: (page: PageView) => void;
  onSelectEntry: (entry: JournalEntry) => void;
  onQuickMoodSelect: (mood: MoodType) => void;
  onOpenChatWithEntry?: (entry: JournalEntry) => void;
}

export function HomeDashboard({
  entries,
  tasks,
  onToggleTask,
  onNavigate,
  onSelectEntry,
  onQuickMoodSelect,
  onOpenChatWithEntry,
}: HomeDashboardProps) {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  // Student greeting
  const studentName = user?.displayName
    ? user.displayName.split(" ")[0]
    : "Student";

  const todayDateStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  // Random/Daily motivational quote
  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        1000 /
        60 /
        60 /
        24
    );
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  // Quick stats
  const totalEntries = entries.length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const aiReflectionsCount = entries.filter((e) => !!e.aiReflection).length;
  const totalWords = entries.reduce(
    (acc, curr) => acc + (curr.wordCount || 0),
    0
  );

  // Most recent entry
  const recentEntry = entries[0] || null;

  const handleMoodClick = (mood: MoodType) => {
    setSelectedMood(mood);
    onQuickMoodSelect(mood);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 md:pb-12">
      {/* Top Welcome & Daily Greeting */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-violet-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium backdrop-blur-sm border border-white/10">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayDateStr}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {studentName}!
            </h1>
            <p className="text-sm sm:text-base text-indigo-200/90 max-w-xl">
              Take a few moments to log your study focus, reflect on challenges, and organize today&apos;s goals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="home-write-entry-btn"
              onClick={() => onNavigate("new-entry")}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold rounded-xl text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Write Today&apos;s Entry</span>
            </button>
            <button
              id="home-ai-reflection-btn"
              onClick={() => onNavigate("chat")}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm border border-indigo-500/40 backdrop-blur-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span>AI Reflection</span>
            </button>
          </div>
        </div>

        {/* Motivational Student Quote Bar */}
        <div className="mt-6 pt-4 border-t border-indigo-700/40 flex items-start gap-3">
          <Quote className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-indigo-100 italic">
            &ldquo;{quote.quote}&rdquo; —{" "}
            <span className="text-indigo-300 not-italic font-medium">
              {quote.author}
            </span>
          </p>
        </div>
      </div>

      {/* Mood Check-in Bar */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <span>How are you feeling today?</span>
              <span className="text-xs font-normal text-zinc-400">
                (Tap to set mood for your next entry)
              </span>
            </h2>
          </div>
          {selectedMood && (
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
              Mood selected: {getMoodDetails(selectedMood).label}{" "}
              {getMoodDetails(selectedMood).emoji}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = selectedMood === mood.value;
            return (
              <button
                key={mood.value}
                id={`home-mood-btn-${mood.value}`}
                onClick={() => handleMoodClick(mood.value)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/20 shadow-sm scale-105"
                    : "border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100 hover:border-zinc-300"
                }`}
              >
                <span className="text-2xl mb-1">{mood.emoji}</span>
                <span className="text-[11px] font-medium text-zinc-700 capitalize">
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Student Metric Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Streak
            </p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-900">
              {totalEntries > 0 ? "5 Days" : "0 Days"}
            </p>
          </div>
        </div>

        {/* Total Entries */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Entries
            </p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-900">
              {totalEntries}
            </p>
          </div>
        </div>

        {/* Study Tasks */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Study Tasks
            </p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-900">
              {pendingTasks}{" "}
              <span className="text-xs font-normal text-zinc-400">pending</span>
            </p>
          </div>
        </div>

        {/* Words / Insights */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              AI Insights
            </p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-900">
              {aiReflectionsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Tasks & Recent Journal Reflection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Tasks (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-zinc-900">Today&apos;s Tasks</h2>
            </div>
            <button
              onClick={() => onNavigate("tasks")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <CheckSquare className="w-8 h-8 text-zinc-300 mx-auto" />
                <p className="text-xs text-zinc-500">
                  No tasks scheduled for today yet.
                </p>
              </div>
            ) : (
              tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    task.completed
                      ? "bg-zinc-50 border-zinc-200 text-zinc-400 line-through"
                      : "bg-white border-zinc-200 hover:border-indigo-200 hover:bg-indigo-50/30 text-zinc-800"
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-zinc-400 hover:text-indigo-600 transition-colors"
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {task.category}
                      </span>
                      {task.aiSuggested && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> AI Suggested
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigate("tasks")}
            className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-medium border border-zinc-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Study Task</span>
          </button>
        </div>

        {/* Right Column: Recent Journal Entry & AI Insight (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-zinc-900">
                Latest Journal Reflection
              </h2>
            </div>
            <button
              onClick={() => onNavigate("journal")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Journal History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentEntry ? (
            <div className="space-y-4">
              <div
                onClick={() => onSelectEntry(recentEntry)}
                className="group p-4 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getMoodDetails(recentEntry.mood).emoji}
                    </span>
                    <span className="text-xs font-medium text-zinc-500">
                      {new Date(recentEntry.createdAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    {recentEntry.wordCount} words
                  </span>
                </div>

                <h3 className="text-base font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {recentEntry.title}
                </h3>

                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                  {recentEntry.content}
                </p>

                {/* Tags */}
                {recentEntry.tags && recentEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {recentEntry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Key Insight Box */}
              {recentEntry.aiReflection && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/80 text-xs text-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-violet-900">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    <span>Gemini AI Key Insight</span>
                  </div>
                  <p className="text-zinc-700 leading-relaxed text-[11px] sm:text-xs">
                    {recentEntry.aiKeyTakeaway ||
                      recentEntry.aiReflection.slice(0, 160) + "..."}
                  </p>
                  {recentEntry.aiSuggestedAction && (
                    <div className="mt-1 pt-1.5 border-t border-violet-200/60 flex items-center gap-1.5 text-[11px] text-violet-800">
                      <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>
                        <strong>Action:</strong> {recentEntry.aiSuggestedAction}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onSelectEntry(recentEntry)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Read Full Reflection →
                </button>
                {onOpenChatWithEntry && (
                  <button
                    onClick={() => onOpenChatWithEntry(recentEntry)}
                    className="flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-800 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Chat About This</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-xs text-zinc-500">
                You haven&apos;t written any journal entries yet.
              </p>
              <button
                onClick={() => onNavigate("new-entry")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
              >
                Write Your First Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
