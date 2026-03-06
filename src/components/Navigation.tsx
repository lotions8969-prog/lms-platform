'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, LayoutDashboard, LogOut, FileVideo, Users, GraduationCap, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => { await logout(); router.replace('/login'); };

  if (!user) return null;
  const isAdmin = user.role === 'admin';

  const adminLinks = [
    { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard, exact: true },
    { href: '/admin/courses', label: 'コース管理', icon: BookOpen },
    { href: '/admin/videos', label: '動画', icon: FileVideo },
    { href: '/admin/submissions', label: '提出物', icon: Users },
  ];

  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <nav className="bg-zinc-950 sticky top-0 z-50 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-7">
            <Link href={isAdmin ? '/admin' : '/courses'} className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-7 h-7 bg-violet-600 rounded-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-[15px] tracking-tight">
                ENISHI <span className="text-violet-400">LESSONS</span>
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              {isAdmin ? (
                adminLinks.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link key={href} href={href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                        active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                      }`}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </Link>
                  );
                })
              ) : (
                <Link href="/courses"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                    pathname.startsWith('/courses') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}>
                  <GraduationCap className="w-3.5 h-3.5" />マイコース
                </Link>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="hidden sm:flex items-center gap-1 text-[11px] bg-violet-900/40 text-violet-300 border border-violet-800/50 px-2.5 py-1 rounded-full font-medium">
                管理者
              </span>
            )}
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {initials}
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-500 hidden sm:block" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-20">
                    <div className="px-3 py-2.5 border-b border-zinc-800">
                      <p className="text-[11px] text-zinc-500">ログイン中</p>
                      <p className="text-sm font-medium text-zinc-100 truncate">{user.email}</p>
                    </div>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors">
                      <LogOut className="w-4 h-4" />ログアウト
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
