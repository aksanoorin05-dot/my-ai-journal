import React from "react";
import {
  Home,
  BookOpen,
  CheckSquare,
  TrendingUp,
  User as UserIcon,
  Plus,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageView } from "../types";

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, loginWithGoogle, logout } = useAuth();


  const mainNavItems: {
    page: PageView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { page: "home", label: "Home", icon: Home },
    { page: "journal", label: "Journal", icon: BookOpen },
    { page: "tasks", label: "Tasks", icon: CheckSquare },
    { page: "progress", label: "Progress", icon: TrendingUp },
    { page: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <button
              id="nav-brand-logo"
              onClick={() => onNavigate("home")}
              className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-zinc-900 tracking-tight text-base flex items-center gap-1.5">
                  MyAI Journal
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Student
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 hidden sm:block">
                  Reflect · Plan · Grow
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    id={`nav-link-${item.page}`}
                    onClick={() => onNavigate(item.page)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-indigo-600" : "text-zinc-500"
                      }`}
                    />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Area */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* AI Chat button */}
              <button
                id="nav-ai-chat-btn"
                onClick={() => onNavigate("chat")}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  currentPage === "chat"
                    ? "bg-violet-100 border-violet-300 text-violet-800 font-semibold"
                    : "bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200"
                }`}
                title="AI Reflection Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                <span>AI Reflection</span>
              </button>

              {/* New Entry Button */}
              <button
                id="nav-new-entry-btn"
                onClick={() => onNavigate("new-entry")}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow-indigo-200 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">New Entry</span>
                <span className="xs:hidden">Write</span>
              </button>

              {/* User Avatar / Profile Quick Button */}
              {user ? (
                <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-zinc-200">
                  <button
                    onClick={() => onNavigate("profile")}
                    className="flex items-center gap-2 text-left p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                    title="View Profile"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "Student"}
                        className="w-8 h-8 rounded-full border border-zinc-200 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {(user.displayName || "S").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-medium text-zinc-700 max-w-[100px] truncate">
                      {user.displayName || "Student"}
                    </span>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                  <button
                    id="nav-about-btn"
                    onClick={() => onNavigate("landing")}
                    className="hidden sm:inline-flex items-center text-xs font-medium text-zinc-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    About
                  </button>
                  <button
                    id="nav-signin-btn"
                    onClick={() => loginWithGoogle()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                  >
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar - Student Mobile-First UX */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-lg px-2 py-1.5">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                id={`mobile-bottom-${item.page}`}
                onClick={() => onNavigate(item.page)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? "text-indigo-600 font-semibold scale-105"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 ${
                    isActive ? "text-indigo-600 stroke-[2.5]" : "text-zinc-400"
                  }`}
                />
                <span className="text-[10px] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
