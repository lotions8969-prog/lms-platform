'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, Users, FileVideo, BarChart2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courses: 0, submissions: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/courses').then((r) => r.json()),
      fetch('/api/submissions').then((r) => r.json()),
    ]).then(([courses, subs]) => {
      setStats({ courses: courses.length, submissions: subs.length, pending: subs.filter((s: any) => s.status === 'pending').length });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'コース数', value: stats.courses, icon: BookOpen, color: 'blue', href: '/admin/courses' },
    { label: '提出物数', value: stats.submissions, icon: FileVideo, color: 'purple', href: '/admin/submissions' },
    { label: 'レビュー待ち', value: stats.pending, icon: BarChart2, color: 'orange', href: '/admin/submissions' },
  ];
  const colorMap: Record<string, string> = { blue: 'bg-blue-100 text-blue-600', green: 'bg-green-100 text-green-600', purple: 'bg-purple-100 text-purple-600', orange: 'bg-orange-100 text-orange-600' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1></div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card) => (
            <Link key={card.label} href={card.href}>
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                {loading ? <div className="h-8 bg-gray-200 animate-pulse rounded w-12 mb-1" /> : <p className="text-3xl font-bold text-gray-900">{card.value}</p>}
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/courses" className="block bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
            <h2 className="font-semibold text-gray-900 mb-2">コース管理</h2>
            <p className="text-sm text-gray-500">コースの作成・編集、レッスンの追加</p>
          </Link>
          <Link href="/admin/submissions" className="block bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
            <h2 className="font-semibold text-gray-900 mb-2">提出物レビュー</h2>
            <p className="text-sm text-gray-500">受講生の録画提出物にフィードバックを提供</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
