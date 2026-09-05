import React, { useState } from "react";
import Markdown from "react-markdown";
import {
  X,
  Calendar,
  Sparkles,
  Edit,
  Trash2,
  MessageSquare,
  Bookmark,
  Share2,
  Check,
  Tag,
  Clock,
  Lightbulb,
  Target,
  HelpCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  Layers,
} from "lucide-react";
import { JournalEntry } from "../types";
import { getMoodDetails } from "../data/constants";

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
  onOpenChatWithEntry: (entry: JournalEntry) => void;
  onSaveAiReflection?: (
    entryId: string,
    data: {
      reflection: string;
      summary?: string;
      keyInsight?: string;
      studySuggestion?: string;
      reflectiveQuestion?: string;
    }
  ) => Promise<void>;
}

export function EntryDetailModal({
  entry,
  onClose,
  onEdit,
  onDelete,
  onOpenChatWithEntry,
  onSaveAiReflection,
}: EntryDetailModalProps) {
  const [reflecting, setReflecting] = useState(false);
  const [reflectionText, setReflectionText] = useState(entry?.aiReflection || "");
  const [summaryText, setSummaryText] = useState(entry?.aiSummary || "");
  const [keyInsightText, setKeyInsightText] = useState(entry?.aiKeyTakeaway || "");
  const [studySuggestionText, setStudySuggestionText] = useState(
    entry?.aiStudySuggestion || entry?.aiSuggestedAction || ""
  );
  const [reflectiveQuestionText, setReflectiveQuestionText] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "markdown">("cards");
  const [error, setError] = useState<string | null>(null);
  const [savedReflection, setSavedReflection] = useState(!!entry?.aiReflection);
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const moodInfo = getMoodDetails(entry.mood);
  const dateFormatted = new Date(entry.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatted = new Date(entry.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleGenerateReflection = async () => {
    try {
      setError(null);
      setReflecting(true);
      const res = await fetch("/api/reflect-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned error ${res.status}`);
      }

      const data = await res.json();
      if (data.reflection) {
        setReflectionText(data.reflection);
        if (data.summary) setSummaryText(data.summary);
        if (data.keyInsight) setKeyInsightText(data.keyInsight);
        if (data.studySuggestion) setStudySuggestionText(data.studySuggestion);
        if (data.reflectiveQuestion) setReflectiveQuestionText(data.reflectiveQuestion);

        if (onSaveAiReflection) {
          await onSaveAiReflection(entry.id, {
            reflection: data.reflection,
            summary: data.summary,
            keyInsight: data.keyInsight,
            studySuggestion: data.studySuggestion,
            reflectiveQuestion: data.reflectiveQuestion,
          });
          setSavedReflection(true);
        }
      }
    } catch (err: any) {
      console.error("Failed to generate reflection:", err);
      let msg = err?.message || "Failed to generate reflection. Please try again.";
      try {
        const jsonMatch = msg.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.error && parsed.error.message) msg = parsed.error.message;
          else if (parsed.message) msg = parsed.message;
        }
      } catch {
        // keep fallback
      }
      if (msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE")) {
        msg = "The AI service is experiencing high demand right now. Spikes are usually brief. Please tap Retry to try again.";
      }
      setError(msg);
    } finally {
      setReflecting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${entry.title}\n\n${entry.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${moodInfo.bg} ${moodInfo.color}`}
            >
              <span>{moodInfo.emoji}</span>
              <span>{moodInfo.label}</span>
            </span>
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateFormatted}</span>
              <span className="text-zinc-300">•</span>
              <span>{timeFormatted}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="modal-copy-entry-button"
              onClick={handleCopy}
              title="Copy text"
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              id="modal-edit-entry-button"
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              title="Edit entry"
              className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              id="modal-delete-entry-button"
              onClick={() => {
                onDelete(entry);
              }}
              title="Delete entry"
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="modal-close-button"
              onClick={onClose}
              title="Close modal"
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
              {entry.title}
            </h2>

            {/* Tags list */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 my-2">
                {entry.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {t}
                  </span>
                ))}
                <span className="text-[11px] text-zinc-400 inline-flex items-center gap-1 ml-2 font-mono">
                  <Clock className="w-3 h-3" />
                  {entry.wordCount} words
                </span>
              </div>
            )}
          </div>

          {/* Journal Entry Content */}
          <div className="prose prose-zinc max-w-none text-sm sm:text-base leading-relaxed text-zinc-800 whitespace-pre-wrap font-sans bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
            {entry.content}
          </div>

          {/* AI Reflection Card */}
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/70 via-indigo-50/30 to-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-violet-950 uppercase tracking-wider">
                    Gemini AI Reflection & Insights
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Summary, key growth insight & practical study suggestions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {reflectionText && (
                  <div className="flex items-center bg-violet-100/70 p-0.5 rounded-lg text-[11px] font-medium text-violet-800">
                    <button
                      type="button"
                      onClick={() => setViewMode("cards")}
                      className={`px-2 py-1 rounded-md transition-colors ${
                        viewMode === "cards" ? "bg-white text-violet-900 shadow-xs font-semibold" : "text-violet-700 hover:text-violet-950"
                      }`}
                    >
                      Cards View
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("markdown")}
                      className={`px-2 py-1 rounded-md transition-colors ${
                        viewMode === "markdown" ? "bg-white text-violet-900 shadow-xs font-semibold" : "text-violet-700 hover:text-violet-950"
                      }`}
                    >
                      Markdown View
                    </button>
                  </div>
                )}

                {!reflectionText && (
                  <button
                    id="modal-generate-reflection-button"
                    onClick={handleGenerateReflection}
                    disabled={reflecting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-xs transition-colors disabled:opacity-60"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{reflecting ? "Analyzing..." : "Reflect with AI"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Reflection could not be generated</p>
                  <p className="text-rose-700 mt-0.5">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateReflection}
                  className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold rounded-md text-[11px] transition-colors shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {reflecting && (
              <div className="py-8 text-center space-y-3 bg-white/70 rounded-xl border border-violet-100">
                <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div>
                  <p className="text-xs text-violet-900 font-semibold">
                    Gemini is analyzing your reflection...
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Extracting key emotional themes, growth insights, and practical study suggestions
                  </p>
                </div>
              </div>
            )}

            {/* Empty State before reflection generated */}
            {!reflectionText && !reflecting && !error && (
              <div className="p-4 rounded-xl bg-white/80 border border-dashed border-violet-200 text-center space-y-2">
                <p className="text-xs text-zinc-600">
                  Tap &ldquo;Reflect with AI&rdquo; to generate a concise summary, key insight, and practical productivity tips powered securely by Gemini server-side AI.
                </p>
              </div>
            )}

            {/* Reflection Content */}
            {reflectionText && !reflecting && (
              <div className="space-y-3 pt-1">
                {viewMode === "cards" ? (
                  <div className="grid grid-cols-1 gap-3">
                    {/* Summary Card */}
                    <div className="p-3.5 rounded-xl bg-white border border-violet-100 shadow-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
                        <FileText className="w-3.5 h-3.5 text-violet-600" />
                        <span>Concise Summary</span>
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed">
                        {summaryText || (entry.aiKeyTakeaway ? entry.aiKeyTakeaway : "A mindful reflection capturing the student's daily thoughts and experiences.")}
                      </p>
                    </div>

                    {/* Key Insight Card */}
                    <div className="p-3.5 rounded-xl bg-white border border-amber-100 shadow-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Key Growth Insight</span>
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed">
                        {keyInsightText || "Reflecting on your studies highlights your personal values and builds self-awareness."}
                      </p>
                    </div>

                    {/* Practical Study & Productivity Suggestion */}
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                        <Target className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Practical Study & Productivity Suggestion</span>
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed">
                        {studySuggestionText || "Apply a 25-minute Pomodoro block followed by a restful 5-minute pause to maintain focus."}
                      </p>
                    </div>

                    {/* Reflective Growth Question */}
                    {reflectiveQuestionText && (
                      <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Question for Growth</span>
                        </div>
                        <p className="text-xs text-zinc-700 leading-relaxed italic">
                          &ldquo;{reflectiveQuestionText}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-violet-100 text-xs sm:text-sm text-zinc-800 leading-relaxed space-y-2">
                    <Markdown>{reflectionText}</Markdown>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-violet-100 text-xs">
                  <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5" /> Saved to this journal entry
                  </span>
                  <button
                    id="modal-regenerate-reflection-button"
                    type="button"
                    onClick={handleGenerateReflection}
                    className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-800 font-medium text-[11px] transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-analyze with AI</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 rounded-b-2xl flex items-center justify-between shrink-0">
          <button
            id="modal-discuss-in-chat-button"
            onClick={() => {
              onClose();
              onOpenChatWithEntry(entry);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Discuss this entry in AI Chat →</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
