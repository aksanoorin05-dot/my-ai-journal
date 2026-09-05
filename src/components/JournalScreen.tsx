import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Tag,
  Clock,
  MessageSquare,
  ChevronRight,
  Filter,
} from "lucide-react";
import { JournalEntry, MoodType, PageView } from "../types";
import { MOOD_OPTIONS, getMoodDetails } from "../data/constants";

interface JournalScreenProps {
  entries: JournalEntry[];
  loading: boolean;
  onSelectEntry: (entry: JournalEntry) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry) => void;
  onCreateNew: () => void;
  onOpenChatWithEntry: (entry: JournalEntry) => void;
  onLoadSampleEntries?: () => void;
}

export function JournalScreen({
  entries,
  loading,
  onSelectEntry,
  onEditEntry,
  onDeleteEntry,
  onCreateNew,
  onOpenChatWithEntry,
  onLoadSampleEntries,
}: JournalScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract all unique student tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    entries.forEach((entry) => {
      (entry.tags || []).forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesQuery =
        !searchQuery.trim() ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.tags || []).some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesMood =
        selectedMood === "all" || entry.mood === selectedMood;

      const matchesTag =
        selectedTag === "all" ||
        (entry.tags || []).includes(selectedTag);

      return matchesQuery && matchesMood && matchesTag;
    });
  }, [entries, searchQuery, selectedMood, selectedTag]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
              My Journal
            </h1>
            <p className="text-xs text-zinc-500">
              {entries.length} reflections recorded · Private & AI-assisted
            </p>
          </div>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Write Entry</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search entries by topic, exam, class, or feeling..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Mood:</span>
          </span>

          <button
            onClick={() => setSelectedMood("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedMood === "all"
                ? "bg-indigo-600 text-white font-semibold"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All
          </button>

          {MOOD_OPTIONS.map((mood) => {
            const isSelected = selectedMood === mood.value;
            return (
              <button
                key={mood.value}
                onClick={() =>
                  setSelectedMood(isSelected ? "all" : mood.value)
                }
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <span>{mood.emoji}</span>
                <span className="capitalize">{mood.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tag Filters if available */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-100">
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Tags:</span>
            </span>

            <button
              onClick={() => setSelectedTag("all")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                selectedTag === "all"
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              All Tags
            </button>

            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setSelectedTag(selectedTag === tag ? "all" : tag)
                }
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-indigo-600 text-white font-semibold"
                    : "bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-zinc-200 animate-pulse space-y-3"
            >
              <div className="h-4 bg-zinc-200 rounded w-1/3" />
              <div className="h-3 bg-zinc-100 rounded w-full" />
              <div className="h-3 bg-zinc-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const mood = getMoodDetails(entry.mood);
            const dateStr = new Date(entry.createdAt).toLocaleDateString(
              undefined,
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-zinc-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md p-5 space-y-3 group"
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{mood.emoji}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${mood.bg} ${mood.color}`}
                    >
                      {mood.label}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenChatWithEntry(entry)}
                      className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      title="Reflect with AI Chat"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditEntry(entry)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(entry.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Entry Title & Body */}
                <div
                  onClick={() => onSelectEntry(entry)}
                  className="cursor-pointer space-y-1.5"
                >
                  <h2 className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                    {entry.title}
                  </h2>
                  <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>
                </div>

                {/* AI Summary / Insight Highlight if present */}
                {entry.aiReflection ? (
                  <div
                    onClick={() => onSelectEntry(entry)}
                    className="p-3 rounded-xl bg-violet-50/70 border border-violet-200/60 cursor-pointer hover:bg-violet-50 transition-colors space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-900">
                      <Sparkles className="w-3 h-3 text-violet-600" />
                      <span>Gemini Reflection Summary</span>
                    </div>
                    <p className="text-[11px] text-zinc-700 line-clamp-2 leading-relaxed">
                      {entry.aiSummary || entry.aiKeyTakeaway || entry.aiReflection}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectEntry(entry)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-800 transition-colors py-1"
                  >
                    <Sparkles className="w-3 h-3 text-violet-500" />
                    <span>Get AI Reflection &amp; Study Tips →</span>
                  </button>
                )}

                {/* Footer: Tags & Word Count */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-100">
                  <div className="flex flex-wrap gap-1.5">
                    {(entry.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                    <span>{entry.wordCount} words</span>
                    <button
                      onClick={() => onSelectEntry(entry)}
                      className="font-semibold text-indigo-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>Read</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation Warning */}
                {deleteConfirmId === entry.id && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 text-xs text-rose-800 animate-in fade-in duration-150">
                    <span>Delete this journal entry permanently?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 text-xs text-zinc-600 hover:bg-white rounded-lg border border-zinc-300 bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDeleteEntry(entry);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2.5 py-1 text-xs text-white bg-rose-600 hover:bg-rose-700 font-semibold rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              No matching journal entries
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedMood !== "all" || selectedTag !== "all"
                ? "Try clearing your search query or filters."
                : "Start logging your thoughts, daily study progress, and achievements."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              Write First Entry
            </button>
            {onLoadSampleEntries && (
              <button
                onClick={onLoadSampleEntries}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold border border-zinc-200"
              >
                Load Sample Student Entries
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
