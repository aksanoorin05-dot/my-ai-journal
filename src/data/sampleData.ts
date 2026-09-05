import { JournalEntry, StudentTask, StudentProfile } from "../types";

export const SAMPLE_STUDENT_PROFILE: StudentProfile = {
  name: "Alex Rivera",
  email: "alex.rivera@student.edu",
  gradeLevel: "College Sophomore",
  studyFocus: "Computer Science & Cognitive Psychology",
  schoolName: "Oakridge Institute",
  dailyJournalGoalMinutes: 10,
  weeklyTasksTarget: 12,
  theme: "light",
  notificationsEnabled: true,
  reminderTime: "20:30",
};

export const SAMPLE_STUDENT_ENTRIES: JournalEntry[] = [
  {
    id: "sample-1",
    userId: "sample-student",
    title: "Calculus Problem Set & The Feynman Breakthrough",
    content:
      "Spent three solid hours in the library working through multivariable integration. At first, Stokes' theorem felt like an alien language, but I tried explaining it out loud to an empty study cubicle like Richard Feynman suggested. That clicked! \n\nI was getting overwhelmed earlier around 3 PM because of back-to-back lectures, but turning off notifications for 90 minutes made a huge difference. Feeling much more confident for Thursday's quiz.",
    mood: "focused",
    tags: ["Academics", "Exam Prep", "Habits & Routine"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    aiReflection:
      "You demonstrated strong self-regulation by eliminating phone distractions during deep work. Using the Feynman verbalization method effectively converted passive confusion into active comprehension. Your focus pattern shows peak analytical clarity in early evenings.",
    aiKeyTakeaway:
      "Active verbal explanation broke through conceptual blockages in Calculus.",
    aiSuggestedAction:
      "Schedule a 15-minute review session tomorrow to reinforce Stokes' theorem equations.",
    wordCount: 89,
  },
  {
    id: "sample-2",
    userId: "sample-student",
    title: "Group Project Synergy & Overcoming Team Friction",
    content:
      "Had our weekly sync for the Software Engineering term project. There was a bit of tension regarding who was going to build the database schema versus the frontend. Instead of letting everyone stay passive-aggressive, I suggested we do a 15-minute live whiteboarding session to divide components cleanly by interest. \n\nIt completely smoothed things over! Everyone left the meeting with clear ownership. It's a relief to see leadership is mostly just asking good questions and clarifying expectations.",
    mood: "great",
    tags: ["Academics", "Personal Growth", "Friendship"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // yesterday
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    aiReflection:
      "Excellent display of interpersonal initiative. By introducing a visual whiteboarding session, you shifted group energy from debate to collaborative problem-solving. This kind of communication directly mitigates project anxiety.",
    aiKeyTakeaway:
      "Collaborative visualization resolved team role ambiguity effectively.",
    aiSuggestedAction:
      "Post a shared summary document in the team channel to cement milestone deadlines.",
    wordCount: 97,
  },
  {
    id: "sample-3",
    userId: "sample-student",
    title: "Mid-Week Slump: Listening to Mental Fatigue",
    content:
      "Woke up feeling pretty drained today. Slept less than 6 hours because I stayed up watching tech tutorials in bed. By 2 PM in Cognitive Science, my brain was running on 10% battery. \n\nDecided not to force a grueling 4-hour study marathon tonight. Instead, I took a 25-minute brisk walk through campus, made hot chamomile tea, and only reviewed 20 spaced repetition flashcards. I used to beat myself up for 'wasted days', but giving myself permission to recover actually kept me from complete burnout.",
    mood: "tired",
    tags: ["Mental Wellness", "Habits & Routine"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 56).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 56).toISOString(),
    aiReflection:
      "Recognizing physical fatigue and consciously scaling back study intensity is a mature productivity skill, not a setback. The campus walk and light spaced-repetition preserved habit momentum without compounding exhaustion.",
    aiKeyTakeaway:
      "Resting intentionally prevented burnout while keeping the daily habit alive.",
    aiSuggestedAction:
      "Set a phone-free bedtime wind-down routine at 10:30 PM to recover sleep debt.",
    wordCount: 112,
  },
  {
    id: "sample-4",
    userId: "sample-student",
    title: "Sunday Reflection & Semester Goal Alignment",
    content:
      "Set aside Sunday morning to organize my binder, clean my desk, and plan the next 3 weeks. Looked over my mid-semester grades so far: solid A- in Data Structures, B+ in Organic Chemistry. \n\nMy primary goal for the next month is to do practice problems daily instead of cramming the weekend before tests. Also want to make sure I call family twice a week and keep up my morning running routine. Feeling calm, centered, and ready for what's ahead.",
    mood: "calm",
    tags: ["Future Goals", "Gratitude", "Personal Growth"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    aiReflection:
      "A holistic review that balances academic targets (distributed practice) with wellness (family connections, morning runs). Proactive environment resets (desk cleaning) consistently prime your mindset for sustained weekly focus.",
    aiKeyTakeaway:
      "Distributed daily practice will replace cramming for Organic Chemistry.",
    aiSuggestedAction:
      "Block off a dedicated 45-minute daily slot at 4 PM for Chemistry problem sets.",
    wordCount: 104,
  },
];

export const SAMPLE_STUDENT_TASKS: StudentTask[] = [
  {
    id: "task-1",
    title: "Complete Stokes' Theorem integration problem set #4",
    category: "Homework",
    dueDate: "Today, 11:59 PM",
    completed: false,
    priority: "high",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Review Cognitive Psychology lecture notes on Working Memory",
    category: "Study Goal",
    dueDate: "Tomorrow, 3:00 PM",
    completed: false,
    priority: "medium",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Software Engineering sprint backlog tickets breakdown",
    category: "Exam Prep",
    dueDate: "Friday",
    completed: false,
    priority: "high",
    aiSuggested: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "20-minute evening campus walk or light jog",
    category: "Habit",
    dueDate: "Today, 7:00 PM",
    completed: true,
    priority: "low",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Draft 2-page reflection on digital minimalism for GenEd seminar",
    category: "Homework",
    dueDate: "Next Monday",
    completed: false,
    priority: "medium",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-6",
    title: "Set up sleep wind-down schedule at 10:30 PM",
    category: "Personal",
    dueDate: "Every night",
    completed: true,
    priority: "medium",
    aiSuggested: true,
    createdAt: new Date().toISOString(),
  },
];

export const MOTIVATIONAL_QUOTES = [
  {
    quote: "Small daily reflections turn stressful semesters into steady mastery.",
    author: "Student Mindset",
  },
  {
    quote: "You don't have to be extreme, just consistent. Step by step wins.",
    author: "Study Habit Principle",
  },
  {
    quote: "Clarity comes from writing your thoughts down, not just thinking them.",
    author: "Journaling Wisdom",
  },
  {
    quote: "Rest is not a reward for finished work; it is an essential part of learning.",
    author: "Cognitive Wellness",
  },
];
