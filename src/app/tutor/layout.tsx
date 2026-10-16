'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  School,
  FileCheck2,
  Library,
  FileSpreadsheet,
  Calendar,
  Wallet,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const tutorNavItems = [
  { href: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tutor/courses', label: 'Courses', icon: BookOpen },
  { href: '/tutor/lms', label: 'Classrooms LMS', icon: School },
  { href: '/tutor/assignments', label: 'Pemeriksaan Tugas', icon: FileCheck2 },
  { href: '/tutor/bank-soal', label: 'Bank Soal Studio', icon: FileSpreadsheet },
  { href: '/tutor/library', label: 'Perpustakaan Studio', icon: Library },
  { href: '/tutor/schedule', label: 'Kelola Jadwal Les', icon: Calendar },
  { href: '/tutor/billing', label: 'Billing & Keuangan', icon: Wallet },
]

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <aside
        className={`bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 sticky top-0 h-screen z-30 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                  T
                </span>
                <span className="font-black text-slate-900 text-base tracking-tight">TheoQED Studio</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors mx-auto cursor-pointer"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {tutorNavItems.map((item) => {
              const Icon = item.icon
              const isActive = mounted && pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${ isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 min-w-0 overflow-y-auto">{children}</main>
    </div>
  )
}