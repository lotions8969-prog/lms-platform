'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, LayoutDashboard, LogOut, Shield, Users, FileVideo } from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!user) return null;
  const isAdmin = user.role === 'admin';

  const adminLinks = [
    { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard, exact: true },
    { href: '/admin/courses', label: 'コース管理', icon: BookOpen },
    { href: '/admin/videos', label: '動画ライブラリ', icon: FileVideo },
    { href: '/admin/submissions', label: '提出物確認', icon: Users },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-1">
            <Link href={isAdmin ? '/admin' : '/courses'} className="flex items-center gap-2 mr-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">LMS</span>
            </Link>

            {isAdmin ? (
              adminLinks.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <Icon className="w-4 h-4" />{label}
                  </Link>
                );
              })
            ) : (
              <Link href="/courses"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith('/courses') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                コース一覧
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                <Shield className="w-3 h-3" />管理者
              </span>
            )}
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />ログアウト
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
