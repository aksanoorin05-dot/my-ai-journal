import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  auth,
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
} from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google sign in failed:", err);
      // Don't show scary error if user simply closed the popup
      if (err.code === "auth/popup-closed-by-user") {
        return;
      }
      setAuthError(
        err.message || "Failed to sign in with Google. Please check your connection."
      );
      throw err;
    }
  };

  const logout = async () => {
    try {
      setAuthError(null);
      await signOutUser();
    } catch (err: any) {
      console.error("Sign out failed:", err);
      setAuthError(err.message || "Failed to sign out.");
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
