'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, LayoutDashboard, LogOut, Shield, Users } from 'lucide-react';

export default function Navigation() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!user) return null;

  const isAdmin = userData?.role === 'admin';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href={isAdmin ? '/admin' : '/courses'} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">LMS</span>
            </Link>

            {isAdmin ? (
              <div className="flex items-center gap-1">
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    ダッシュボード
                  </span>
                </Link>
                <Link
                  href="/admin/courses"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith('/admin/courses') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    コース管理
                  </span>
                </Link>
                <Link
                  href="/admin/submissions"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith('/admin/submissions') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    提出物確認
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                href="/courses"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/courses') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                コース一覧
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                <Shield className="w-3 h-3" />
                管理者
              </span>
            )}
            <span className="text-sm text-gray-500">{userData?.email || user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
