export type MoodType =
  | "great"
  | "good"
  | "calm"
  | "focused"
  | "tired"
  | "anxious"
  | "neutral";

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: MoodType;
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  aiReflection?: string;
  aiKeyTakeaway?: string;
  aiSuggestedAction?: string;
  aiSummary?: string;
  aiStudySuggestion?: string;
  wordCount: number;
}

export interface StudentTask {
  id: string;
  title: string;
  category: "Homework" | "Exam Prep" | "Study Goal" | "Personal" | "Habit";
  dueDate?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  aiSuggested?: boolean;
  createdAt: string;
}

export interface StudentProfile {
  name: string;
  email: string;
  gradeLevel: string;
  studyFocus: string;
  schoolName: string;
  dailyJournalGoalMinutes: number;
  weeklyTasksTarget: number;
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  reminderTime: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export type PageView =
  | "landing"
  | "home"
  | "dashboard"
  | "journal"
  | "entries"
  | "new-entry"
  | "edit-entry"
  | "tasks"
  | "progress"
  | "profile"
  | "chat";


export interface MoodOption {
  value: MoodType;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}
