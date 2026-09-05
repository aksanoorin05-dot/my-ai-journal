import React, { useMemo } from "react";
import {
  BookOpen,
  PlusCircle,
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Calendar,
  Smile,
  FileText,
  Clock,
  MessageSquare,
} from "lucide-react";
import { JournalEntry, PageView } from "../types";
import { useAuth } from "../context/AuthContext";
import { getMoodDetails } from "../data/constants";

interface DashboardProps {
  entries: JournalEntry[];
  loading: boolean;
  onNavigate: (page: PageView) => void;
  onSelectEntry: (entry: JournalEntry) => void;
  onOpenChatWithEntry: (entry: JournalEntry) => void;
}

export function Dashboard({
  entries,
  loading,
  onNavigate,
  onSelectEntry,
  onOpenChatWithEntry,
}: DashboardProps) {
  const { user } = useAuth();

  const firstName = user?.displayName
    ? user.displayName.split(" ")[0]
    : "Student";

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const totalWords = entries.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
    const reflectedCount = entries.filter((e) => !!e.aiReflection).length;

    // Count moods
    const moodCounts: Record<string, number> = {};
    entries.forEach((e) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    let topMood = "good";
    let maxCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topMood = mood;
      }
    });

    return {
      totalEntries,
      totalWords,
      reflectedCount,
      topMood: totalEntries > 0 ? topMood : "good",
    };
  }, [entries]);

  const recentEntries = entries.slice(0, 4);
  const topMoodDetails = getMoodDetails(stats.topMood as any);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-950/10 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 bg-violet-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Student Journal Dashboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Welcome back, {firstName}! ✨
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            Take a breath, reflect on your studies and emotions, or chat with your Gemini AI companion to gain mindful perspective.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-write-today-button"
              onClick={() => onNavigate("new-entry")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-900 bg-white hover:bg-indigo-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Write Today's Entry</span>
            </button>

            <button
              id="dashboard-chat-gemini-button"
              onClick={() => onNavigate("chat")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-700/80 hover:bg-indigo-700 border border-indigo-500/30 backdrop-blur-xs transition-all"
            >
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span>Chat with Gemini</span>
              <ArrowRight className="w-4 h-4 text-indigo-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Entries */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Entries</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.totalEntries}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Private reflections</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Total Words */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Words Written</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.totalWords.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Mindful expression</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Top Mood */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Primary Mood</p>
            <p className="text-xl font-bold text-zinc-900 mt-1 flex items-center gap-1.5">
              <span>{topMoodDetails.emoji}</span>
              <span>{topMoodDetails.label}</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Based on entries</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Smile className="w-5 h-5" />
          </div>
        </div>

        {/* AI Reflections */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">AI Reflections</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.reflectedCount}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Gemini insights gained</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid: Recent Entries + AI Reflection Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Entries Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Recent Journal Entries</span>
            </h2>

            {entries.length > 0 && (
              <button
                id="dashboard-view-all-entries-button"
                onClick={() => onNavigate("entries")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                <span>View all ({entries.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-500">Loading recent entries from Firestore...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-zinc-800 text-sm">No journal entries yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Your journal is completely private and waiting for your first reflection.
              </p>
              <button
                onClick={() => onNavigate("new-entry")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Write First Entry</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => {
                const mood = getMoodDetails(entry.mood);
                const dateStr = new Date(entry.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={entry.id}
                    id={`recent-entry-item-${entry.id}`}
                    onClick={() => onSelectEntry(entry)}
                    className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border font-medium ${mood.bg} ${mood.color}`}
                        >
                          {mood.emoji} {mood.label}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        {entry.aiReflection && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 font-semibold flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-violet-500" /> Reflected
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-zinc-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {entry.title}
                      </h4>
                      <p className="text-xs text-zinc-500 line-clamp-1">
                        {entry.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChatWithEntry(entry);
                        }}
                        title="Chat about this entry with Gemini"
                        className="p-1.5 rounded-lg text-violet-600 hover:bg-violet-50 transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                        Read →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: AI Companion Card & Student Quick Tips */}
        <div className="space-y-6">
          {/* AI Mentor Card */}
          <div className="bg-gradient-to-br from-violet-50 via-indigo-50/50 to-white rounded-2xl border border-violet-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-sm">Gemini AI Companion</h3>
                <p className="text-xs text-zinc-500">Student reflection coach</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Stuck on what to write, or want to understand patterns in your study habits and feelings?
              Gemini can read your private journal context to provide mindful reflections.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => onNavigate("chat")}
                className="w-full text-left p-2.5 rounded-lg border border-violet-200/80 bg-white hover:bg-violet-50/80 text-xs text-zinc-700 transition-colors flex items-center justify-between group"
              >
                <span>"What study patterns do you notice?"</span>
                <ArrowRight className="w-3.5 h-3.5 text-violet-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate("chat")}
                className="w-full text-left p-2.5 rounded-lg border border-violet-200/80 bg-white hover:bg-violet-50/80 text-xs text-zinc-700 transition-colors flex items-center justify-between group"
              >
                <span>"Help me process upcoming exam stress"</span>
                <ArrowRight className="w-3.5 h-3.5 text-violet-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate("chat")}
                className="w-full text-left p-2.5 rounded-lg border border-violet-200/80 bg-white hover:bg-violet-50/80 text-xs text-zinc-700 transition-colors flex items-center justify-between group"
              >
                <span>"Reflect on my recent achievements"</span>
                <ArrowRight className="w-3.5 h-3.5 text-violet-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <button
              id="dashboard-start-reflection-chat-btn"
              onClick={() => onNavigate("chat")}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Start Reflection Chat</span>
            </button>
          </div>

          {/* Quick Journaling Habit Tip */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-2">
            <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider text-indigo-700">
              💡 Student Reflection Tip
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Writing just 3 sentences a day about one thing that challenged you and one thing you are grateful for creates measurable academic resilience and clarity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
