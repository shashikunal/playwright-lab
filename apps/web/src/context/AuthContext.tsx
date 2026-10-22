import type { UserProfile, UserRole } from "@pil/shared";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthContextType = {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "pil-auth-token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("pil-auth-profile");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as UserProfile;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) return;

    fetch("/api/app/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Unauthorized"))))
      .then((data: { profile: UserProfile }) => {
        setUser(data.profile);
        localStorage.setItem("pil-auth-profile", JSON.stringify(data.profile));
      })
      .catch(() => {
        logout();
      });
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const res = await fetch("/api/app/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Invalid credentials");
    }

    const data: { profile: UserProfile } = await res.json();
    setUser(data.profile);
    localStorage.setItem(STORAGE_KEY, data.profile.token);
    localStorage.setItem("pil-auth-profile", JSON.stringify(data.profile));
    return data.profile;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("pil-auth-profile");
    fetch("/api/app/auth/logout", { method: "POST" }).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
