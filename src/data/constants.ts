import { MoodOption, MoodType } from "../types";

export const MOOD_OPTIONS: MoodOption[] = [
  {
    value: "great",
    label: "Great",
    emoji: "🌟",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  },
  {
    value: "good",
    label: "Good",
    emoji: "😊",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    value: "focused",
    label: "Focused",
    emoji: "🎯",
    color: "text-indigo-700",
    bg: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
  },
  {
    value: "calm",
    label: "Calm",
    emoji: "🌿",
    color: "text-teal-700",
    bg: "bg-teal-50 border-teal-200 hover:bg-teal-100",
  },
  {
    value: "neutral",
    label: "Neutral",
    emoji: "😐",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
  {
    value: "tired",
    label: "Tired",
    emoji: "😴",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  {
    value: "anxious",
    label: "Anxious",
    emoji: "🌧️",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200 hover:bg-rose-100",
  },
];

export const POPULAR_STUDENT_TAGS = [
  "Academics",
  "Exam Prep",
  "Homework",
  "Personal Growth",
  "Mental Wellness",
  "Friendship",
  "Habits & Routine",
  "Creativity",
  "Future Goals",
  "Gratitude",
];

export function getMoodDetails(mood: MoodType): MoodOption {
  const found = MOOD_OPTIONS.find((m) => m.value === mood);
  return (
    found || {
      value: "neutral",
      label: "Neutral",
      emoji: "😐",
      color: "text-zinc-700",
      bg: "bg-zinc-50 border-zinc-200 hover:bg-zinc-100",
    }
  );
}
