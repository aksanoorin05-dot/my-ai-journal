import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { HomeDashboard } from "./components/HomeDashboard";
import { JournalScreen } from "./components/JournalScreen";
import { EntryEditor } from "./components/EntryEditor";
import { TasksScreen } from "./components/TasksScreen";
import { ProgressScreen } from "./components/ProgressScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { EntryDetailModal } from "./components/EntryDetailModal";
import { AiChat } from "./components/AiChat";
import {
  JournalEntry,
  StudentTask,
  StudentProfile,
  MoodType,
  PageView,
} from "./types";
import {
  SAMPLE_STUDENT_ENTRIES,
  SAMPLE_STUDENT_TASKS,
  SAMPLE_STUDENT_PROFILE,
} from "./data/sampleData";
import {
  subscribeUserEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "./lib/journalService";
import {
  subscribeUserTasks,
  createStudentTask,
  toggleStudentTask,
  deleteStudentTask,
} from "./lib/taskService";
import { BookOpen, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

function JournalApp() {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageView>("landing");
  const [hasExploredDemo, setHasExploredDemo] = useState(false);

  // Entries & tasks state
  const [entries, setEntries] = useState<JournalEntry[]>(SAMPLE_STUDENT_ENTRIES);
  const [tasks, setTasks] = useState<StudentTask[]>(SAMPLE_STUDENT_TASKS);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("myai_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return SAMPLE_STUDENT_PROFILE;
  });

  // Active items for editor & modal
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [chatInitialEntry, setChatInitialEntry] = useState<JournalEntry | null>(null);
  const [initialMoodForNewEntry, setInitialMoodForNewEntry] = useState<MoodType>("good");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Switch to home when user logs in
  useEffect(() => {
    if (user && currentPage === "landing") {
      setCurrentPage("home");
    }
  }, [user]);

  // Subscribe to Cloud Firestore entries and tasks when user is signed in with Google
  useEffect(() => {
    if (!user) {
      // Unauthenticated: keep sample student entries and tasks for demo preview
      if (!hasExploredDemo) {
        setEntries(SAMPLE_STUDENT_ENTRIES);
        setTasks(SAMPLE_STUDENT_TASKS);
      }
      return;
    }

    // Authenticated: load user's real private Firestore data
    setEntries([]);
    setTasks([]);
    setEntriesLoading(true);
    setTasksLoading(true);

    const unsubscribeEntries = subscribeUserEntries(
      user.uid,
      (userEntries) => {
        setEntries(userEntries);
        setEntriesLoading(false);
      },
      (err) => {
        console.error("Firestore entries subscription error:", err);
        setError("Error syncing journal entries from Cloud Firestore.");
        setEntriesLoading(false);
      }
    );

    const unsubscribeTasks = subscribeUserTasks(
      user.uid,
      (userTasks) => {
        setTasks(userTasks);
        setTasksLoading(false);
      },
      (err) => {
        console.error("Firestore tasks subscription error:", err);
        setError("Error syncing tasks from Cloud Firestore.");
        setTasksLoading(false);
      }
    );

    return () => {
      unsubscribeEntries();
      unsubscribeTasks();
    };
  }, [user, hasExploredDemo]);

  // Persist profile updates in localStorage
  useEffect(() => {
    localStorage.setItem("myai_profile", JSON.stringify(profile));
  }, [profile]);

  // Toggle task completed state
  const handleToggleTask = async (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;
    const newCompleted = !targetTask.completed;

    if (user) {
      try {
        await toggleStudentTask(user.uid, taskId, newCompleted);
      } catch (err: any) {
        setError("Failed to update task: " + err.message);
      }
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: newCompleted } : t))
      );
    }
  };

  // Add new student task
  const handleAddTask = async (
    newTaskData: Omit<StudentTask, "id" | "createdAt">
  ) => {
    if (user) {
      try {
        await createStudentTask(user.uid, newTaskData);
        showToast("Task saved to Cloud Firestore!");
      } catch (err: any) {
        setError("Failed to save task: " + err.message);
      }
    } else {
      const newTask: StudentTask = {
        ...newTaskData,
        id: "task-" + Date.now(),
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast("Study task added!");
    }
  };

  // Delete student task
  const handleDeleteTask = async (taskId: string) => {
    if (user) {
      try {
        await deleteStudentTask(user.uid, taskId);
        showToast("Task deleted.");
      } catch (err: any) {
        setError("Failed to delete task: " + err.message);
      }
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast("Task deleted.");
    }
  };

  // AI suggest tasks from journal reflections
  const handleGenerateAiTasks = async () => {
    const suggestions = [
      {
        title: "15-minute active recall review of recent lecture notes",
        category: "Exam Prep" as const,
        dueDate: "Tomorrow",
        completed: false,
        priority: "high" as const,
        aiSuggested: true,
      },
      {
        title: "Screen-free bedtime wind-down at 10:30 PM to optimize rest",
        category: "Habit" as const,
        dueDate: "Tonight",
        completed: false,
        priority: "medium" as const,
        aiSuggested: true,
      },
    ];

    if (user) {
      try {
        for (const s of suggestions) {
          await createStudentTask(user.uid, s);
        }
        showToast("Gemini suggested 2 new actionable study tasks in Firestore!");
      } catch (err: any) {
        setError("Failed to create suggested tasks: " + err.message);
      }
    } else {
      const formatted: StudentTask[] = suggestions.map((s, idx) => ({
        ...s,
        id: `ai-task-${idx}-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }));
      setTasks((prev) => [...formatted, ...prev]);
      showToast("Gemini suggested 2 new actionable study tasks!");
    }
  };

  // Handle saving new or edited entry
  const handleSaveEntry = async (entryData: {
    title: string;
    content: string;
    mood: MoodType;
    tags: string[];
    aiReflection?: string;
    aiKeyTakeaway?: string;
  }) => {
    try {
      if (user) {
        // Save directly to user's private Cloud Firestore collection
        if (editingEntry) {
          await updateJournalEntry(user.uid, editingEntry.id, entryData);
          showToast("Journal entry updated in Cloud Firestore!");
          setEditingEntry(null);
          setCurrentPage("journal");
        } else {
          await createJournalEntry(user.uid, entryData);
          showToast("New journal entry saved to Cloud Firestore!");
          setCurrentPage("journal");
        }
      } else {
        // Preview mode - save to local state
        if (editingEntry) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === editingEntry.id
                ? {
                    ...e,
                    ...entryData,
                    wordCount: entryData.content.trim().split(/\s+/).filter(Boolean).length,
                    updatedAt: new Date().toISOString(),
                  }
                : e
            )
          );
          showToast("Journal entry updated!");
          setEditingEntry(null);
          setCurrentPage("journal");
        } else {
          const newEntry: JournalEntry = {
            id: "local-" + Date.now(),
            userId: "preview-user",
            title: entryData.title,
            content: entryData.content,
            mood: entryData.mood,
            tags: entryData.tags,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wordCount: entryData.content.trim().split(/\s+/).filter(Boolean).length,
            aiReflection:
              entryData.aiReflection ||
              "Great reflection! Consistent journaling fosters cognitive clarity and helps balance academic rigor with emotional wellness.",
            aiKeyTakeaway:
              entryData.aiKeyTakeaway ||
              "Regular reflection builds strong cognitive momentum.",
          };
          setEntries((prev) => [newEntry, ...prev]);
          showToast("New journal entry created!");
          setCurrentPage("journal");
        }
      }
    } catch (err: any) {
      console.error("Save entry failed:", err);
      setError("Failed to save journal entry: " + err.message);
    }
  };

  // Handle deleting an entry
  const handleDeleteEntry = async (entry: JournalEntry) => {
    try {
      if (user) {
        await deleteJournalEntry(user.uid, entry.id);
        showToast("Journal entry deleted from Cloud Firestore.");
      } else {
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        showToast("Journal entry deleted.");
      }
      if (selectedEntry?.id === entry.id) {
        setSelectedEntry(null);
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      setError("Failed to delete entry: " + err.message);
    }
  };

  // Handle saving an AI reflection
  const handleSaveAiReflection = async (
    entryId: string,
    data:
      | string
      | {
          reflection: string;
          summary?: string;
          keyInsight?: string;
          studySuggestion?: string;
          reflectiveQuestion?: string;
        }
  ) => {
    try {
      const reflectionText = typeof data === "string" ? data : data.reflection;
      const summaryText = typeof data === "object" ? data.summary : undefined;
      const keyInsightText = typeof data === "object" ? data.keyInsight : undefined;
      const studySuggestionText = typeof data === "object" ? data.studySuggestion : undefined;

      const updates: Partial<JournalEntry> = {
        aiReflection: reflectionText,
      };
      if (summaryText) updates.aiSummary = summaryText;
      if (keyInsightText) updates.aiKeyTakeaway = keyInsightText;
      if (studySuggestionText) updates.aiStudySuggestion = studySuggestionText;

      if (user) {
        await updateJournalEntry(user.uid, entryId, updates);
      } else {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId ? { ...e, ...updates } : e
          )
        );
      }
      showToast("Gemini reflection saved to entry!");
      if (selectedEntry && selectedEntry.id === entryId) {
        setSelectedEntry((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } catch (err: any) {
      console.error("Failed to save reflection:", err);
    }
  };

  // Seed sample student entries into user's private Firestore
  const handleSeedSampleEntries = async () => {
    if (user) {
      try {
        setEntriesLoading(true);
        for (const sample of SAMPLE_STUDENT_ENTRIES) {
          await createJournalEntry(user.uid, {
            title: sample.title,
            content: sample.content,
            mood: sample.mood,
            tags: sample.tags,
            aiReflection: sample.aiReflection,
            aiKeyTakeaway: sample.aiKeyTakeaway,
          });
        }
        showToast("Sample student entries imported into your private Firestore!");
      } catch (err: any) {
        setError("Failed to import sample entries: " + err.message);
      } finally {
        setEntriesLoading(false);
      }
    } else {
      setEntries(SAMPLE_STUDENT_ENTRIES);
      showToast("Sample student entries loaded!");
    }
  };

  // Seed sample tasks into user's private Firestore
  const handleSeedSampleTasks = async () => {
    if (user) {
      try {
        setTasksLoading(true);
        for (const sample of SAMPLE_STUDENT_TASKS) {
          await createStudentTask(user.uid, {
            title: sample.title,
            category: sample.category,
            dueDate: sample.dueDate,
            completed: sample.completed,
            priority: sample.priority,
            aiSuggested: sample.aiSuggested,
          });
        }
        showToast("Sample tasks imported into your private Firestore!");
      } catch (err: any) {
        setError("Failed to import sample tasks: " + err.message);
      } finally {
        setTasksLoading(false);
      }
    } else {
      setTasks(SAMPLE_STUDENT_TASKS);
      showToast("Sample student tasks loaded!");
    }
  };

  // Reset sample student data in preview
  const handleResetSampleData = () => {
    if (user) {
      handleSeedSampleEntries();
      handleSeedSampleTasks();
    } else {
      setEntries(SAMPLE_STUDENT_ENTRIES);
      setTasks(SAMPLE_STUDENT_TASKS);
      setProfile(SAMPLE_STUDENT_PROFILE);
      localStorage.removeItem("myai_profile");
      showToast("Sample student data restored!");
    }
  };

  // Quick mood selection from home screen
  const handleQuickMoodSelect = (mood: MoodType) => {
    setInitialMoodForNewEntry(mood);
    setEditingEntry(null);
    setCurrentPage("new-entry");
  };

  // Open Chat with a specific entry context
  const handleOpenChatWithEntry = (entry: JournalEntry) => {
    setSelectedEntry(null);
    setChatInitialEntry(entry);
    setCurrentPage("chat");
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 animate-pulse">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">
          Loading MyAI Journal...
        </p>
      </div>
    );
  }

  // Render Landing Page if user is not signed in and on landing page
  if (!user && currentPage === "landing") {
    return (
      <LandingPage
        onExploreDemo={() => {
          setHasExploredDemo(true);
          setCurrentPage("home");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 font-sans antialiased">
      {/* Top Navbar and Mobile Bottom Bar */}
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Preview Mode Alert Banner if not signed in */}
      {!user && (
        <div className="bg-gradient-to-r from-indigo-50 via-violet-50 to-blue-50 border-b border-indigo-100 py-2 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Previewing with sample student data.</strong> Sign in with Google to save your private journal to Cloud Firestore.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage("landing")}
                className="font-medium text-indigo-700 hover:text-indigo-900 underline text-xs"
              >
                About App
              </button>
              <button
                onClick={() => loginWithGoogle()}
                className="font-bold text-indigo-700 hover:text-indigo-900 underline"
              >
                Sign In with Google →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-5 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold text-rose-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Pages */}
      <main className="flex-1">
        {/* 1. Home Dashboard */}
        {currentPage === "home" && (
          <HomeDashboard
            entries={entries}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onNavigate={setCurrentPage}
            onSelectEntry={(entry) => setSelectedEntry(entry)}
            onQuickMoodSelect={handleQuickMoodSelect}
            onOpenChatWithEntry={handleOpenChatWithEntry}
          />
        )}

        {/* 2. Journal Screen (My Entries with search) */}
        {(currentPage === "journal" || currentPage === "entries") && (
          <JournalScreen
            entries={entries}
            loading={entriesLoading}
            onSelectEntry={(entry) => setSelectedEntry(entry)}
            onEditEntry={(entry) => {
              setEditingEntry(entry);
              setCurrentPage("edit-entry");
            }}
            onDeleteEntry={handleDeleteEntry}
            onCreateNew={() => {
              setEditingEntry(null);
              setCurrentPage("new-entry");
            }}
            onOpenChatWithEntry={handleOpenChatWithEntry}
            onLoadSampleEntries={handleSeedSampleEntries}
          />
        )}

        {/* 3. New Journal Entry Screen */}
        {currentPage === "new-entry" && (
          <EntryEditor
            initialEntry={
              editingEntry || {
                id: "",
                userId: user?.uid || "",
                title: "",
                content: "",
                mood: initialMoodForNewEntry,
                tags: ["Academics"],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                wordCount: 0,
              }
            }
            onSave={handleSaveEntry}
            onCancel={() => setCurrentPage("home")}
          />
        )}

        {/* Edit Entry Screen */}
        {currentPage === "edit-entry" && (
          <EntryEditor
            initialEntry={editingEntry}
            onSave={handleSaveEntry}
            onCancel={() => {
              setEditingEntry(null);
              setCurrentPage("journal");
            }}
          />
        )}

        {/* 4. Tasks Screen */}
        {currentPage === "tasks" && (
          <TasksScreen
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onGenerateAiTasks={handleGenerateAiTasks}
            onLoadSampleTasks={handleSeedSampleTasks}
          />
        )}

        {/* 5. Progress Screen */}
        {currentPage === "progress" && (
          <ProgressScreen entries={entries} tasks={tasks} />
        )}

        {/* 6. Profile Screen */}
        {currentPage === "profile" && (
          <ProfileScreen
            profile={profile}
            entries={entries}
            onUpdateProfile={(updated) =>
              setProfile((prev) => ({ ...prev, ...updated }))
            }
            onResetSampleData={handleResetSampleData}
          />
        )}

        {/* 7. AI Chat Reflection Screen */}
        {currentPage === "chat" && (
          <AiChat
            entries={entries}
            initialSelectedEntry={chatInitialEntry}
            onBackToDashboard={() => setCurrentPage("home")}
          />
        )}
      </main>

      {/* Entry Detail & Reading Modal */}
      {selectedEntry && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={(entry) => {
            setSelectedEntry(null);
            setEditingEntry(entry);
            setCurrentPage("edit-entry");
          }}
          onDelete={(entry) => {
            setSelectedEntry(null);
            handleDeleteEntry(entry);
          }}
          onOpenChatWithEntry={handleOpenChatWithEntry}
          onSaveAiReflection={handleSaveAiReflection}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <JournalApp />
    </AuthProvider>
  );
}
