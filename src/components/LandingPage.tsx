import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Brain,
  MessageSquare,
  Search,
  ArrowRight,
  Lock,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface LandingPageProps {
  onExploreDemo?: () => void;
}

export function LandingPage({ onExploreDemo }: LandingPageProps) {
  const { loginWithGoogle, authError, clearError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await loginWithGoogle();
    } catch {
      // Handled in AuthContext
    } finally {
      setSigningIn(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-white to-zinc-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 tracking-tight text-lg">My AI Journal</h1>
            <p className="text-xs text-zinc-500">Student Reflection Sanctuary</p>
          </div>
        </div>

        <button
          id="landing-signin-top-button"
          onClick={handleSignIn}
          disabled={signingIn}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-indigo-700 bg-white hover:bg-zinc-50 border border-zinc-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
        >
          {signingIn ? (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign In</span>
        </button>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        {authError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between gap-3 text-left">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={clearError}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-medium mb-6">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>Tailored for students & mindful learners</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight sm:leading-tight mb-6">
          Your Personal AI-Powered <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            Journal & Reflection Companion
          </span>
        </h2>

        <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Capture your thoughts, daily study experiences, and goals in complete privacy.
          Engage in multi-turn AI conversations with Gemini to gain deeper clarity, celebrate wins, and navigate academic stress.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            id="landing-google-signin-hero"
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-200 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
          >
            {signingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <span>Continue with Google Sign-In</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          {onExploreDemo && (
            <button
              id="landing-explore-demo-btn"
              onClick={onExploreDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:bg-zinc-100 border border-zinc-200/90 shadow-xs transition-all focus:outline-none focus:ring-4 focus:ring-zinc-100"
            >
              <span>Explore Demo Preview</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Strictly separated user data
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-600" /> Private Cloud Firestore
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-600" /> Powered by Gemini
          </span>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-900 text-base mb-2">Private Student Journal</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Create, edit, organize with tags, track your mood, and quickly search all your entries anytime.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-900 text-base mb-2">Gemini AI Reflection</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Engage in multi-turn dialogues with an AI mentor that understands your journal context to inspire reflection and growth.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-900 text-base mb-2">Per-User Data Isolation</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Enforced by strict Firestore security rules. Your journal entries are private to you and never accessible to other students.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 py-8 border-t border-zinc-200/60 text-center text-xs text-zinc-400">
        <p>My AI Journal • Secure student journaling with Cloud Firestore and Google Gemini AI</p>
      </footer>
    </div>
  );
}
