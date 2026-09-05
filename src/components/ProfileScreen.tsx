import React, { useState } from "react";
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  BookOpen,
  Clock,
  Bell,
  ShieldCheck,
  Download,
  LogOut,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { StudentProfile, JournalEntry } from "../types";
import { useAuth } from "../context/AuthContext";

interface ProfileScreenProps {
  profile: StudentProfile;
  entries: JournalEntry[];
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onResetSampleData: () => void;
}

export function ProfileScreen({
  profile,
  entries,
  onUpdateProfile,
  onResetSampleData,
}: ProfileScreenProps) {
  const { user, loginWithGoogle, logout } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form local state
  const [gradeLevel, setGradeLevel] = useState(profile.gradeLevel);
  const [studyFocus, setStudyFocus] = useState(profile.studyFocus);
  const [schoolName, setSchoolName] = useState(profile.schoolName);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyJournalGoalMinutes);
  const [notifications, setNotifications] = useState(
    profile.notificationsEnabled
  );
  const [reminderTime, setReminderTime] = useState(profile.reminderTime);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      gradeLevel,
      studyFocus,
      schoolName,
      dailyJournalGoalMinutes: dailyGoal,
      notificationsEnabled: notifications,
      reminderTime,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Export journal entries to JSON
  const handleExportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `myai-journal-export-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
          <UserIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Student Profile & Settings
          </h1>
          <p className="text-xs text-zinc-500">
            Personalize your academic goals, notification preferences, and privacy.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile settings updated successfully!</span>
        </div>
      )}

      {/* Student Account Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="w-16 h-16 rounded-2xl border-2 border-indigo-200 object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-200">
              {(user?.displayName || profile.name || "S").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-zinc-900">
              {user?.displayName || profile.name}
            </h2>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email || profile.email}</span>
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {gradeLevel || "Student"}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                {studyFocus || "Academics"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {user ? (
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Academic & Goal Settings Form */}
      <form
        onSubmit={handleSave}
        className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5"
      >
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Academic Profile & Goals</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Helps Gemini personalize study advice, reflection prompts, and goals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Grade or Academic Level
            </label>
            <input
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="e.g., High School Junior, College Sophomore"
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Major or Primary Study Focus
            </label>
            <input
              type="text"
              value={studyFocus}
              onChange={(e) => setStudyFocus(e.target.value)}
              placeholder="e.g., Computer Science, Pre-Med, Literature"
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              School or University
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g., Oakridge Institute, State University"
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Daily Reflection Target (Minutes)
            </label>
            <input
              type="number"
              min={2}
              max={60}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Reminders & Notifications */}
        <div className="pt-2 border-t border-zinc-100 space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Daily Journal Reminder</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div>
              <p className="text-xs font-semibold text-zinc-900">
                Evening Reflection Prompt
              </p>
              <p className="text-[11px] text-zinc-500">
                Receive an encouraging prompt to reflect on your day before bed.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-zinc-300 text-xs bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  notifications ? "bg-indigo-600" : "bg-zinc-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Privacy & Data Management */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-zinc-900">
            Privacy & Data Security
          </h3>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          Your journal entries are stored securely in Google Cloud Firestore and
          isolated strictly to your student account with security rules. Nobody
          else can view your reflections. Gemini AI calls happen securely through
          our server-side API with zero client-side key exposure.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-colors border border-zinc-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Journal ({entries.length} entries)</span>
          </button>

          <button
            type="button"
            onClick={onResetSampleData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors border border-indigo-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Sample Student Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
