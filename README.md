# My AI Journal

A modern, student-focused web application that combines mindful daily journaling, academic task tracking, emotional wellness check-ins, and an empathetic AI Mentor powered by the Google Gemini API.

Built with React 19, TypeScript, Tailwind CSS, Express, Firebase Authentication, Cloud Firestore, and the Google Gen AI SDK.

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Firebase Authentication & Security Rules](#firebase-authentication--security-rules)
- [Firestore Per-User Data Isolation](#firestore-per-user-data-isolation)
- [Gemini AI Mentor & Reflection Engine](#gemini-ai-mentor--reflection-engine)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Google Cloud Run Deployment](#google-cloud-run-deployment)
- [Security & Privacy Standards](#security--privacy-standards)

---

## Overview

**My AI Journal** helps students build consistent reflection habits, navigate academic pressure, and stay organized. By providing a secure, distraction-free environment with personalized AI reflections and conversational mentoring, students can explore their thoughts, understand their learning patterns, and receive constructive study guidance without compromising their privacy.

---

## Key Features

### 1. Student Dashboard
- **Personalized Daily Greeting**: Time-aware greeting with student profile info.
- **Quick Mood Check-in**: One-tap daily emotional status tracking.
- **Daily Motivational Quotes**: Student-centered inspiring quotes refreshed daily.
- **Academic Metrics**: Real-time snapshot of weekly study progress, active tasks, and reflection streaks.
- **Fast Action Hub**: Quick access to start a new entry, chat with the AI mentor, or view study tasks.

### 2. Journal & Reflection Editor
- **Rich Entry Creation**: Title, category tags (e.g., *Math*, *Exams*, *Projects*, *Personal*), and custom mood selectors.
- **Real-Time Word Count**: Word and character counts to encourage thoughtful writing.
- **Full Entry Management**: Create, edit, search, filter by tag or mood, and delete entries.
- **Search & Filter**: Fast client-side searching across entry titles, body text, and tags.

### 3. Gemini-Powered Instant AI Reflections
- **One-Click Reflection**: Generate deep reflections on any journal entry with a single tap.
- **Structured Feedback**:
  - **Summary**: Concise recap of what was written and felt.
  - **Key Insight**: Emotional or cognitive reflection on the student's experience.
  - **Productivity & Study Suggestion**: Actionable study technique (e.g., Feynman Technique, Pomodoro intervals, active recall).
  - **Growth Question**: Gentle inquiry to prompt self-awareness in subsequent entries.
- **Resilient Fallback**: Automatic multi-model fallback and local heuristics guarantee reflections even during peak AI upstream traffic.

### 4. Interactive AI Mentor (Multi-Turn Chat)
- **Context-Aware Mentoring**: The AI mentor understands the student's recent journal entries and active study context.
- **Multi-Turn Dialogue**: Continuous back-and-forth conversations to decompress after exams, brainstorm study plans, or talk through obstacles.
- **Pre-Built Reflection Prompts**: Quick conversation starters for exam anxiety, study strategies, and weekly retrospectives.

### 5. Study Tasks & Academic Goals
- **To-Do Management**: Create, categorize, and complete academic tasks.
- **Priority Levels**: High, Medium, and Low priorities with visual badges.
- **Due Date Scheduling**: Keep track of upcoming assignments and test dates.

### 6. Progress & Habit Analytics
- **Streak Tracker**: Tracks daily journaling consistency.
- **Mood Trends**: Visual breakdown of emotional states over time.
- **Productivity Patterns**: Insights into study hours and reflection consistency.

---

## Architecture & Tech Stack

The application follows a full-stack architecture running behind an Express server designed for Google Cloud Run container deployment:

```
[ Browser (React 19 SPA) ]
     │
     ├── Firebase Auth (Google Sign-In via Client Popup)
     ├── Cloud Firestore (Client SDK with Strict User Security Rules)
     │
     └── Express API Server (Node.js / Cloud Run Container :3000)
             │
             ├── /api/health          (Container health & liveness probes)
             ├── /api/chat            (Proxies multi-turn chats to Gemini API)
             ├── /api/reflect-entry   (Structured entry analysis via Gemini API)
             └── /api/prompt-ideas    (Dynamic prompt generation via Gemini API)
                     │
                     └── [ Google Gemini API ] (process.env.GEMINI_API_KEY)
```

### Technology Matrix
- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Motion animations + Lucide React icons
- **Backend**: Express 4 running on Node.js (bundled to CommonJS `dist/server.cjs` with esbuild for container execution)
- **AI SDK**: `@google/genai` (Google Gen AI TypeScript SDK)
- **Database**: Google Cloud Firestore
- **Authentication**: Firebase Authentication (Google Identity Provider)
- **Markdown Rendering**: `react-markdown`

---

## Firebase Authentication & Security Rules

1. **Google Sign-In**: Uses standard Firebase `signInWithPopup(auth, googleProvider)` with client-side popups.
2. **Session Persistence**: User authentication state is maintained across browser sessions.
3. **Authorized Domains**: Ensure your Cloud Run custom domain is registered in the Firebase Authentication settings.

---

## Firestore Per-User Data Isolation

Data isolation is enforced at both the client SDK path level and the Cloud Firestore server level.

### Database Architecture
All student data is strictly nested under their unique Firebase Authentication UID (`request.auth.uid`):

```
/users/{userId}/
  ├── profile/{profileId}
  ├── entries/{entryId}
  ├── tasks/{taskId}
  └── chatHistory/{messageId}
```

### Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Strictly isolate user profile documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Strictly isolate all user subcollections (entries, tasks, profile, chat)
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This guarantees that **User A** can never query, read, or mutate records belonging to **User B**, even if attempting direct Firestore REST or SDK calls.

---

## Gemini AI Mentor & Reflection Engine

All Gemini API requests are executed exclusively on the Express backend (`server.ts`).

### Strict Server-Side Key Management
- The `GEMINI_API_KEY` is stored as an environment secret on the server.
- The browser client never touches, receives, or has access to the Gemini API key.

### Multi-Model Fallback & High-Availability
To safeguard against upstream model load spikes (e.g. HTTP 503 `UNAVAILABLE`), the backend employs a multi-tiered resilience pipeline:
1. **Primary Model**: `gemini-3.1-flash-lite` (fast, low-latency reflection and chat responses)
2. **Secondary Fallbacks**: `gemini-3.8-flash` and `gemini-flash-latest` with automated backoff
3. **Structured Heuristic Fallback**: Generates structured mindful reflections if upstream network connectivity is momentarily interrupted.

---

## Project Structure

```
.
├── .env.example                # Example environment variables declaration
├── .gitignore                  # Git ignore specifications
├── firestore.rules             # Cloud Firestore per-user isolation security rules
├── firebase-applet-config.json # Client Firebase configuration
├── firebase-blueprint.json     # Schema blueprint for database structure
├── index.html                  # HTML entry point with metadata sync
├── metadata.json               # App metadata, capabilities, and permissions
├── package.json                # Project dependencies and deployment scripts
├── server.ts                   # Express server entry point & Gemini API proxy
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite configuration with Tailwind CSS plugin
├── public/                     # Static assets and icons
└── src/
    ├── main.tsx                # React root mount point
    ├── App.tsx                 # Core layout, auth state, and routing
    ├── types.ts                # TypeScript interfaces and shared types
    ├── index.css               # Global Tailwind CSS imports
    ├── context/                # React context providers (AuthContext)
    ├── lib/
    │   └── firebase.ts         # Firebase App, Auth, and Firestore initialization
    └── components/
        ├── LandingPage.tsx     # Student welcome & Google Sign-In page
        ├── Navbar.tsx          # Responsive navigation & account menu
        ├── HomeDashboard.tsx   # Dashboard overview, mood check-in & quick stats
        ├── JournalScreen.tsx   # Entries browser with search, filters & cards
        ├── EntryEditor.tsx     # Full reflection editor with live AI summary
        ├── EntryDetailModal.tsx# Entry reader with markdown AI reflection view
        ├── AiChat.tsx          # Multi-turn conversational AI mentor
        ├── TasksScreen.tsx     # Academic to-dos and priority management
        ├── ProgressScreen.tsx  # Habit tracking, streak, and mood analytics
        └── ProfileScreen.tsx   # Student profile settings & account controls
```

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm or bun

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd my-ai-journal
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Gemini API key in `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 4. Build and Test Production Bundle Locally
```bash
npm run build
npm start
```

---

## Google Cloud Run Deployment

This project is pre-configured for deployment on **Google Cloud Run**.

### Recommended Deployment Workflow (Google AI Studio)
1. Click the **Deploy** button in the top-right header of Google AI Studio.
2. In the deployment dialog, specify:
   - **Google Cloud Project**: Select your linked project (e.g. `gen-lang-client-0717633440`).
   - **Service Name**: `my-ai-journal`
   - **Region**: Your preferred region (e.g., `us-central1` or `asia-southeast1`).
   - **Ingress**: Check **Allow unauthenticated invocations** for public web access.
   - **Labels**:
     - Key: `dev-tutorial`
     - Value: `cloud-run-ai-challenge`
3. Click **Deploy**.

### Post-Deployment: Authorize Public Domain in Firebase
To allow Google Sign-In on your production Cloud Run URL:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (`gen-lang-client-0717633440`).
3. Go to **Build > Authentication > Settings > Authorized domains**.
4. Click **Add domain** and input your Cloud Run service domain (e.g., `my-ai-journal-xxxxx.run.app`).

---

## Security & Privacy Standards

- **Zero Secret Leakage**: The Gemini API key is referenced exclusively via server-side environment variables (`process.env.GEMINI_API_KEY`) and is never packaged in client bundles or exposed in network responses.
- **Strict Data Segregation**: Every Firestore document query is scoped to the authenticated student UID, reinforced by Firestore Security Rules.
- **Input Sanitization**: Journal entries and chat messages are validated and sanitized on both client and server before processing.
- **Container Isolation**: The production server runs in a minimal, sandboxed container exposing only port `3000` with HTTP health probes enabled.
