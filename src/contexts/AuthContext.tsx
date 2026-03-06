'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserData {
  id: string;
  email: string;
  role: 'admin' | 'student';
  displayName?: string;
  progress: Record<string, { completedLessons: string[]; quizScores: Record<string, number>; completed: boolean }>;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: 'admin' | 'student') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    setUser(data.user);
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ログインに失敗しました');
    await refreshUser();
  };

  const register = async (email: string, password: string, role: 'admin' | 'student' = 'student') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '登録に失敗しました');
    await refreshUser();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
