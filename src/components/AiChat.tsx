import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Sparkles,
  Send,
  Trash2,
  BookOpen,
  User as UserIcon,
  Bot,
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  CornerDownLeft,
  Calendar,
  Layers,
} from "lucide-react";
import { ChatMessage, JournalEntry } from "../types";
import { useAuth } from "../context/AuthContext";

interface AiChatProps {
  entries: JournalEntry[];
  initialSelectedEntry?: JournalEntry | null;
  onBackToDashboard: () => void;
}

export function AiChat({
  entries,
  initialSelectedEntry,
  onBackToDashboard,
}: AiChatProps) {
  const { user } = useAuth();
  const [selectedEntryId, setSelectedEntryId] = useState<string>(
    initialSelectedEntry ? initialSelectedEntry.id : "all"
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeEntry =
    selectedEntryId !== "all"
      ? entries.find((e) => e.id === selectedEntryId) || null
      : null;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // If entering with initial entry, initialize message or greeting
  useEffect(() => {
    if (initialSelectedEntry) {
      setSelectedEntryId(initialSelectedEntry.id);
    }
  }, [initialSelectedEntry]);

  const starterPrompts =
    selectedEntryId === "none"
      ? [
          "How can I study effectively using active recall and spaced repetition?",
          "Help me structure a productive 2-hour study session.",
          "What should I do when I feel overwhelmed by schoolwork?",
          "Give me a mindful breathing or focus exercise before an exam.",
        ]
      : activeEntry
      ? [
          `What key insight or lesson can I take from "${activeEntry.title}"?`,
          "Give me 2 actionable study suggestions based on this entry.",
          "Help me reframe the stress or challenge I described here.",
          "What does this entry reveal about my growth as a student?",
        ]
      : [
          "What patterns do you notice across my recent journal entries?",
          "How has my mood and study focus evolved over time?",
          "What are my biggest study achievements and wins so far?",
          "Where could I improve my academic balance and well-being?",
        ];

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputMessage("");
    setError(null);
    setLoading(true);

    try {
      // Build context payload
      const contextMode =
        selectedEntryId === "none"
          ? "none"
          : selectedEntryId === "all"
          ? "all"
          : "single";

      const entriesContext =
        contextMode === "all"
          ? entries.slice(0, 10).map((e) => ({
              id: e.id,
              title: e.title,
              content: e.content,
              mood: e.mood,
              tags: e.tags,
              createdAt: e.createdAt,
            }))
          : [];

      const currentEntryContext =
        contextMode === "single" && activeEntry
          ? {
              id: activeEntry.id,
              title: activeEntry.title,
              content: activeEntry.content,
              mood: activeEntry.mood,
              tags: activeEntry.tags,
              createdAt: activeEntry.createdAt,
            }
          : undefined;

      // Server-side Gemini API call
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          contextMode,
          entriesContext,
          currentEntryContext,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || `Server responded with error status ${res.status}`
        );
      }

      const data = await res.json();
      const modelMessage: ChatMessage = {
        id: "msg-" + Date.now(),
        role: "model",
        content: data.reply || "I am here to reflect with you on your journal.",
        timestamp: new Date().toISOString(),
      };

      setMessages([...newHistory, modelMessage]);
    } catch (err: any) {
      console.error("AI Chat error:", err);
      let msg = err?.message || "Failed to communicate with Gemini. Please try again.";
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
        msg = "The AI mentor is experiencing high demand right now. Spikes are usually brief. Tap Retry to send your message again.";
      }
      setError(msg);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 mb-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            id="chat-back-button"
            onClick={onBackToDashboard}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                Gemini Reflection Companion
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                  Private & Context-Aware
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Helping you unpack thoughts, study emotions, and growth
              </p>
            </div>
          </div>
        </div>

        {/* Focus Entry Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-700">
            <Layers className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-zinc-400 hidden sm:inline">Context:</span>
            <select
              id="chat-context-select"
              value={selectedEntryId}
              onChange={(e) => setSelectedEntryId(e.target.value)}
              className="bg-transparent border-0 text-xs font-medium focus:ring-0 p-0 text-zinc-800 cursor-pointer max-w-[180px] truncate"
            >
              <option value="all">
                All Entries ({entries.length} available)
              </option>
              <option value="none">
                No Context (General Study Chat)
              </option>
              {entries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  Entry: {entry.title}
                </option>
              ))}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              id="clear-chat-history-button"
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
                if (lastUserMsg) {
                  handleSend(lastUserMsg.content);
                }
              }}
              className="text-xs font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 px-2 py-0.5 rounded transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold text-rose-700 hover:underline ml-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-zinc-50/60 rounded-2xl border border-zinc-200 p-4 sm:p-6 space-y-4 shadow-inner">
        {/* Empty Chat State */}
        {messages.length === 0 && (
          <div className="max-w-md mx-auto py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-base">
                Ready to reflect together
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {activeEntry
                  ? `Focusing on your entry "${activeEntry.title}". Ask anything about what you wrote or how you're feeling.`
                  : entries.length > 0
                  ? `I have access to your ${entries.length} recent journal entries. Ask me to identify patterns, give feedback, or guide reflection.`
                  : "You haven't created journal entries yet, but we can still explore thoughts, study tips, or mindful reflection prompts."}
              </p>
            </div>

            {/* Starter Prompts */}
            <div className="space-y-2 text-left pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 text-center">
                Suggested Reflection Starters
              </p>
              {starterPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-3 rounded-xl bg-white border border-zinc-200 hover:border-violet-300 hover:bg-violet-50/40 text-xs text-zinc-700 transition-colors flex items-center justify-between group shadow-2xs"
                >
                  <span className="leading-snug">{prompt}</span>
                  <CornerDownLeft className="w-3.5 h-3.5 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message stream */}
        {messages.map((message, idx) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white shadow-xs rounded-tr-xs"
                    : "bg-white text-zinc-800 border border-zinc-200/80 shadow-xs rounded-tl-xs"
                }`}
              >
                {!isUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1 border-b border-zinc-100 mb-2">
                      <span className="font-semibold text-violet-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Gemini
                      </span>
                      <button
                        onClick={() => handleCopy(message.content, idx)}
                        title="Copy message"
                        className="text-zinc-400 hover:text-zinc-600 flex items-center gap-1"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <div className="prose prose-zinc max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      <Markdown>{message.content}</Markdown>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading message bubble */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-xs p-4 border border-zinc-200 shadow-xs text-xs text-zinc-500 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <span>Gemini is reflecting on your thoughts...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <div className="mt-4 bg-white rounded-2xl border border-zinc-200 p-2 sm:p-3 shadow-xs shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            id="chat-user-input"
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeEntry
                ? `Ask Gemini about "${activeEntry.title}"...`
                : "Ask Gemini to reflect on your journal, study goals, or feelings..."
            }
            className="flex-1 max-h-32 min-h-[44px] py-2.5 px-3.5 text-xs sm:text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none resize-none bg-transparent"
          />

          <button
            id="chat-send-message-button"
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white disabled:opacity-40 shadow-xs transition-colors shrink-0"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-zinc-400">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>Gemini API server-side secured</span>
        </div>
      </div>
    </div>
  );
}
