import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  PlusCircle,
  Calendar,
  Sparkles,
  Edit3,
  Trash2,
  Tag,
  ArrowUpDown,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { JournalEntry, MoodType } from "../types";
import { MOOD_OPTIONS, getMoodDetails } from "../data/constants";

interface EntriesListProps {
  entries: JournalEntry[];
  loading: boolean;
  onSelectEntry: (entry: JournalEntry) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entry: JournalEntry) => void;
  onCreateNew: () => void;
  onOpenChatWithEntry: (entry: JournalEntry) => void;
}

export function EntriesList({
  entries,
  loading,
  onSelectEntry,
  onEditEntry,
  onDeleteEntry,
  onCreateNew,
  onOpenChatWithEntry,
}: EntriesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    entries.forEach((entry) => {
      (entry.tags || []).forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [entries]);

  // Filtered & sorted entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const matchesQuery =
          !searchQuery.trim() ||
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (entry.tags || []).some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesMood = selectedMood === "all" || entry.mood === selectedMood;
        const matchesTag =
          selectedTag === "all" || (entry.tags || []).includes(selectedTag);

        return matchesQuery && matchesMood && matchesTag;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [entries, searchQuery, selectedMood, selectedTag, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            My Journal Entries
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Browse, search, and reflect upon your past entries
          </p>
        </div>

        <button
          id="entries-write-new-button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-200 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write New Entry</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 mb-6 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-entries-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, titles, tags, or reflections..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-zinc-400 hover:text-zinc-600 absolute right-3 top-1/2 -translate-y-1/2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-700 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <select
                id="sort-order-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                className="bg-transparent border-0 text-xs font-medium focus:ring-0 p-0 text-zinc-700 cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills (Mood & Tags) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 text-xs">
          <span className="text-zinc-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Mood:
          </span>
          <button
            onClick={() => setSelectedMood("all")}
            className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
              selectedMood === "all"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All moods
          </button>
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMood(m.value)}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-medium ${
                selectedMood === m.value
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}

          {allTags.length > 0 && (
            <>
              <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block" />
              <span className="text-zinc-400 font-medium flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3" /> Tag:
              </span>
              <select
                id="tag-filter-select"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-2 py-1 rounded-lg border border-zinc-200 text-xs bg-zinc-50 text-zinc-700"
              >
                <option value="all">All tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500">Loading your private journal from Cloud Firestore...</p>
        </div>
      )}

      {/* Empty State: No entries at all */}
      {!loading && entries.length === 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">Your journal is ready</h3>
          <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
            You haven't written any journal entries yet. Start writing about your classes,
            thoughts, or goals today.
          </p>
          <button
            id="empty-state-new-entry-button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Write your first entry</span>
          </button>
        </div>
      )}

      {/* Empty State: Filter matched nothing */}
      {!loading && entries.length > 0 && filteredEntries.length === 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center max-w-md mx-auto shadow-xs">
          <Search className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 mb-1">No matching entries</h3>
          <p className="text-xs text-zinc-500 mb-4">
            No entries found matching "{searchQuery}" with the selected filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedMood("all");
              setSelectedTag("all");
            }}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Entries Grid */}
      {!loading && filteredEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((entry) => {
            const mood = getMoodDetails(entry.mood);
            const dateStr = new Date(entry.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={entry.id}
                id={`journal-card-${entry.id}`}
                className="bg-white rounded-2xl border border-zinc-200 shadow-xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between p-5 group"
              >
                <div>
                  {/* Card Header: Mood & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${mood.bg} ${mood.color}`}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </span>

                    <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onSelectEntry(entry)}
                    className="font-bold text-zinc-900 text-base mb-2 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                  >
                    {entry.title}
                  </h3>

                  {/* Excerpt */}
                  <p
                    onClick={() => onSelectEntry(entry)}
                    className="text-xs text-zinc-600 leading-relaxed line-clamp-3 mb-4 cursor-pointer font-sans"
                  >
                    {entry.content}
                  </p>

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {entry.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                      {entry.tags.length > 3 && (
                        <span className="text-[10px] text-zinc-400 self-center">
                          +{entry.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* AI reflection indicator */}
                  {entry.aiReflection && (
                    <div className="mb-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 border border-violet-100 text-violet-700 text-[11px] font-medium">
                      <Sparkles className="w-3 h-3 text-violet-500" />
                      <span>Has Gemini Reflection</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-zinc-400 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{entry.wordCount} words</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      id={`read-entry-${entry.id}`}
                      onClick={() => onSelectEntry(entry)}
                      className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg transition-colors"
                    >
                      Read
                    </button>
                    <button
                      id={`chat-entry-${entry.id}`}
                      onClick={() => onOpenChatWithEntry(entry)}
                      title="Discuss in AI Chat"
                      className="p-1 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      id={`edit-entry-${entry.id}`}
                      onClick={() => onEditEntry(entry)}
                      title="Edit Entry"
                      className="p-1 text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-entry-${entry.id}`}
                      onClick={() => setDeleteConfirmId(entry.id)}
                      title="Delete Entry"
                      className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Delete Confirmation Dialog */}
                {deleteConfirmId === entry.id && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs animate-in fade-in duration-100">
                    <p className="font-semibold text-rose-900 mb-2">Delete this entry?</p>
                    <p className="text-rose-700 mb-3 text-[11px]">
                      This will permanently remove this journal entry from Cloud Firestore.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 rounded-md text-zinc-600 hover:bg-zinc-200 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirmId(null);
                          onDeleteEntry(entry);
                        }}
                        className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
