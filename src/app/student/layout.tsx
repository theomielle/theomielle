'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Globe,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  School,
  Video,
  FileSpreadsheet,
  Library,
  User,
} from 'lucide-react'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Courses', href: '/student/courses', icon: Video },
    { label: 'My Courses', href: '/student/my-courses', icon: GraduationCap },
    { label: 'My Classrooms', href: '/student/lms', icon: School },
    { label: 'Bank Soal', href: '/student/bank-soal', icon: FileSpreadsheet },
    { label: 'Perpustakaan & TheoNotes', href: '/student/library', icon: Library },
    { label: 'Jadwal Les', href: '/student/schedule', icon: Calendar },
    { label: 'Riwayat SPP', href: '/student/billing', icon: CreditCard },
    { label: 'Profil Saya', href: '/student/profile', icon: User },
  ]

  return (
    <div className="h-screen bg-[#F8F9FA] text-slate-900 font-sans flex overflow-hidden antialiased">
      
      {/* Sidebar Statis Modern */}
      <aside
        className={`h-full bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out z-40 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="space-y-6">
          
          {/* Header Brand & Toggle */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-1`}>
            {!collapsed && (
              <Link href="/student/dashboard" className="flex items-center gap-3 overflow-hidden">
                <div className="h-9 w-9 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-base shrink-0 shadow-xs">
                  Q
                </div>
                <div className="transition-opacity duration-200">
                  <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">TheoQED</h1>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                    Student Portal
                  </span>
                </div>
              </Link>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
              title={collapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = mounted && pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 space-y-1">
          <Link
            href="/"
            title={collapsed ? 'Landing Page' : undefined}
            className={`flex items-center gap-3.5 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Landing Page</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Keluar' : undefined}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Keluar Sesi</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 h-full overflow-y-auto p-6 md:p-10">
        {children}
      </main>

    </div>
  )
}