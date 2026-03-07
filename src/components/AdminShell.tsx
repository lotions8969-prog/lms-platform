'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Users, ClipboardList,
  FileVideo, BarChart3, FileCheck, Menu, X,
  LogOut, ExternalLink, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard, exact: true },
  { href: '/admin/courses', label: 'コース管理', icon: BookOpen },
  { href: '/admin/users', label: 'ユーザー管理', icon: Users },
  { href: '/admin/surveys', label: 'アンケート', icon: ClipboardList },
  { href: '/admin/submissions', label: '提出物レビュー', icon: FileCheck },
  { href: '/admin/reports', label: 'レポート', icon: BarChart3 },
  { href: '/admin/videos', label: '動画ライブラリ', icon: FileVideo },
];

function SidebarInner({ onNav, closeButton }: { onNav?: () => void; closeButton?: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-gray-900 font-bold text-sm leading-none tracking-tight">ENISHI</p>
              <p className="text-indigo-500 text-[10px] font-semibold tracking-widest mt-0.5">ADMIN</p>
            </div>
          </div>
          {closeButton}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href}
              onClick={onNav}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}>
              <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-0.5">
        <Link href="/courses" target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
          <ExternalLink className="w-3.5 h-3.5" />受講者画面を見る
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 text-left">
          <LogOut className="w-3.5 h-3.5" />ログアウト
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
            {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-xs font-medium truncate">{user?.displayName || user?.email}</p>
            <p className="text-gray-400 text-[10px]">管理者</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.replace('/courses');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen z-30 shrink-0">
        <SidebarInner />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-200 z-50 md:hidden flex flex-col overflow-y-auto">
            <SidebarInner onNav={() => setMobileOpen(false)} closeButton={
              <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            } />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-gray-900 font-bold text-sm">ENISHI ADMIN</p>
          </div>
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
            {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
          </div>
        </div>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
