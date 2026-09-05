import React, { useState, useEffect } from "react";
import {
  Save,
  ArrowLeft,
  Sparkles,
  Tag,
  AlertCircle,
  Lightbulb,
  Check,
  Plus,
  X,
} from "lucide-react";
import { JournalEntry, MoodType, PageView } from "../types";
import { MOOD_OPTIONS, POPULAR_STUDENT_TAGS } from "../data/constants";

interface EntryEditorProps {
  initialEntry?: JournalEntry | null;
  onSave: (entryData: {
    title: string;
    content: string;
    mood: MoodType;
    tags: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export function EntryEditor({ initialEntry, onSave, onCancel }: EntryEditorProps) {
  const [title, setTitle] = useState(initialEntry?.title || "");
  const [content, setContent] = useState(initialEntry?.content || "");
  const [mood, setMood] = useState<MoodType>(initialEntry?.mood || "good");
  const [tags, setTags] = useState<string[]>(initialEntry?.tags || ["Academics"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Prompts state
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [promptsList, setPromptsList] = useState<string[]>([]);
  const [showPromptsModal, setShowPromptsModal] = useState(false);

  useEffect(() => {
    if (initialEntry) {
      setTitle(initialEntry.title);
      setContent(initialEntry.content);
      setMood(initialEntry.mood);
      setTags(initialEntry.tags || []);
    }
  }, [initialEntry]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = customTagInput.trim().replace(/^#/, "");
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setCustomTagInput("");
    }
  };

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleFetchPrompts = async () => {
    try {
      setLoadingPrompts(true);
      setShowPromptsModal(true);
      const res = await fetch("/api/prompt-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, category: tags[0] || "Student life" }),
      });
      const data = await res.json();
      if (data.prompts && Array.isArray(data.prompts)) {
        setPromptsList(data.prompts);
      }
    } catch (err: any) {
      console.error("Failed to fetch prompts:", err);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleApplyPrompt = (prompt: string) => {
    if (!content.trim()) {
      setContent(`**Prompt:** ${prompt}\n\n`);
    } else {
      setContent((prev) => `${prev}\n\n**Prompt:** ${prompt}\n\n`);
    }
    setShowPromptsModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write some thoughts in your journal before saving.");
      return;
    }

    try {
      setError(null);
      setSaving(true);
      await onSave({
        title: title.trim() || "Untitled Reflection",
        content,
        mood,
        tags,
      });
    } catch (err: any) {
      console.error("Error saving journal entry:", err);
      setError(err.message || "Failed to save journal entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          id="editor-back-button"
          onClick={onCancel}
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            id="editor-ai-prompts-button"
            type="button"
            onClick={handleFetchPrompts}
            disabled={loadingPrompts}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>{loadingPrompts ? "Generating..." : "AI Writing Prompts"}</span>
          </button>

          <button
            id="editor-save-button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-200 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving to Cloud...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{initialEntry ? "Update Entry" : "Save Entry"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Could not save entry</p>
            <p className="text-rose-700 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="entry-title-input" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Entry Title
          </label>
          <input
            id="entry-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Surviving Midterms & Staying Mindful"
            className="w-full text-xl sm:text-2xl font-bold text-zinc-900 placeholder:text-zinc-300 border-0 border-b border-zinc-200 focus:border-indigo-600 focus:ring-0 pb-2 px-0 transition-colors"
          />
        </div>

        {/* Mood Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            How are you feeling right now?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {MOOD_OPTIONS.map((opt) => {
              const isSelected = mood === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  id={`mood-selector-${opt.value}`}
                  onClick={() => setMood(opt.value)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20"
                      : "border-zinc-200 bg-zinc-50/60 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
                  }`}
                >
                  <span className="text-xl mb-1">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Tags</span>
            </label>
            <span className="text-[11px] text-zinc-400">Click to add/remove</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {POPULAR_STUDENT_TAGS.map((tag) => {
              const isSelected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  id={`tag-toggle-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => handleToggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 font-medium"
                      : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Tag Input */}
          <div className="flex items-center gap-2 max-w-sm">
            <input
              id="custom-tag-input"
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              placeholder="Add custom tag..."
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full"
            />
            <button
              type="button"
              id="add-custom-tag-button"
              onClick={handleAddCustomTag}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors shrink-0"
            >
              Add
            </button>
          </div>
        </div>

        {/* Content Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="entry-content-textarea" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Your Thoughts & Reflections
            </label>
            <div className="text-[11px] text-zinc-400 font-mono">
              {wordCount} words • ~{readTimeMin} min read
            </div>
          </div>
          <textarea
            id="entry-content-textarea"
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write about what happened today, your study triumphs, challenges, what you learned, or what's on your mind..."
            className="w-full rounded-xl border border-zinc-200 p-4 text-sm sm:text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors leading-relaxed font-sans resize-y"
          />
        </div>
      </form>

      {/* AI Writing Prompts Modal */}
      {showPromptsModal && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">Gemini Writing Prompts</h3>
                  <p className="text-xs text-zinc-500">Inspiration tailored for your current mood</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPromptsModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingPrompts ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-zinc-500">Gemini is creating mindful prompts for you...</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
                {promptsList.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPrompt(prompt)}
                    className="w-full text-left p-3.5 rounded-xl border border-zinc-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-xs text-zinc-800 flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{prompt}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-violet-600 opacity-0 group-hover:opacity-100 shrink-0 pt-0.5">
                      Use prompt →
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-zinc-100 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={handleFetchPrompts}
                disabled={loadingPrompts}
                className="text-violet-600 hover:text-violet-800 font-medium"
              >
                ↻ Refresh prompts
              </button>
              <button
                type="button"
                onClick={() => setShowPromptsModal(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
