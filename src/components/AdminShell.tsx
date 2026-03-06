'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Users, ClipboardList,
  FileVideo, BarChart3, FileCheck, Menu, X,
  ChevronRight, LogOut, ExternalLink, Sparkles,
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

function SidebarInner({ onNav }: { onNav?: () => void }) {
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
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none tracking-tight">ENISHI</p>
            <p className="text-violet-400 text-[10px] font-semibold tracking-widest mt-0.5">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href}
              onClick={onNav}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-zinc-800 pt-3 space-y-1">
        <Link href="/courses" target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800">
          <ExternalLink className="w-3.5 h-3.5" />受講者画面を見る
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 hover:text-rose-400 transition-colors rounded-lg hover:bg-zinc-800 text-left">
          <LogOut className="w-3.5 h-3.5" />ログアウト
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="w-7 h-7 bg-violet-700 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
            {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-300 text-xs font-medium truncate">{user?.displayName || user?.email}</p>
            <p className="text-zinc-600 text-[10px]">管理者</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-56 bg-zinc-900 border-r border-zinc-800 fixed left-0 top-0 h-screen z-30 shrink-0">
        <SidebarInner />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-screen w-56 bg-zinc-900 border-r border-zinc-800 z-50 md:hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
              <p className="text-white font-bold text-sm">ENISHI ADMIN</p>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarInner onNav={() => setMobileOpen(false)} />
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-white font-bold text-sm">ENISHI ADMIN</p>
          <div className="w-8 h-8 bg-violet-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
