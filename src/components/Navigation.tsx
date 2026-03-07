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
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href={isAdmin ? '/admin' : '/courses'} className="flex items-center gap-2.5 shrink-0">
              <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-[15px] tracking-tight">
                ENISHI <span className="text-violet-600">LESSONS</span>
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1">
              {isAdmin ? (
                adminLinks.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link key={href} href={href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                        active ? 'bg-violet-50 text-violet-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </Link>
                  );
                })
              ) : (
                <Link href="/courses"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                    pathname.startsWith('/courses') ? 'bg-violet-50 text-violet-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}>
                  <GraduationCap className="w-3.5 h-3.5" />マイコース
                </Link>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="hidden sm:flex items-center gap-1 text-[11px] bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full font-semibold">
                管理者
              </span>
            )}
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {initials}
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <p className="text-[11px] text-gray-400">ログイン中</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 hover:text-red-500 hover:bg-gray-50 transition-colors">
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
