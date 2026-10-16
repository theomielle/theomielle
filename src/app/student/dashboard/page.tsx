'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Crown,
  School,
  BookOpen,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Library,
  Video,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface StudentProfile {
  full_name: string | null
  email: string | null
  is_premium: boolean
  subscription_expires_at: string | null
}

interface UpcomingSchedule {
  id: string
  subject: string
  session_type: 'online' | 'offline'
  meeting_link: string | null
  location_address: string | null
  scheduled_at: string
  duration_minutes: number
}

export default function StudentDashboardPage() {
  const supabase = createClient()

  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [upcomingSchedule, setUpcomingSchedule] = useState<UpcomingSchedule | null>(null)
  const [counts, setCounts] = useState({
    classrooms: 0,
    courses: 0,
    unpaidBills: 0,
    isLesStudent: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentDashboardData()
  }, [])

  const fetchStudentDashboardData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // 1. Fetch Profile
      const { data: profData } = await supabase
        .from('profiles')
        .select('full_name, email, is_premium, subscription_expires_at')
        .eq('id', user.id)
        .single()

      if (profData) setProfile(profData)

      // 2. Fetch Classrooms Count
      const { count: classCount } = await supabase
        .from('lms_classroom_members')
        .select('*', { count: 'exact', head: true })
        .eq('student_email', user.email)

      // 3. Fetch Course Purchases Count
      const { count: courseCount } = await supabase
        .from('course_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'confirmed')

      // 4. Fetch Unpaid Les Bills Count
      const { count: billCount } = await supabase
        .from('les_bills')
        .select('*', { count: 'exact', head: true })
        .eq('student_email', user.email)
        .eq('status', 'unpaid')

      // 5. Check if Les Student & Get Upcoming Les Schedule
      const { data: schedData } = await supabase
        .from('les_schedules')
        .select('*')
        .eq('student_email', user.email)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)

      const isLes = (classCount || 0) > 0 || (billCount || 0) > 0 || (schedData && schedData.length > 0)

      setCounts({
        classrooms: classCount || 0,
        courses: courseCount || 0,
        unpaidBills: billCount || 0,
        isLesStudent: !!isLes,
      })

      if (schedData && schedData.length > 0) {
        setUpcomingSchedule(schedData[0])
      }
    }

    setLoading(false)
  }

  // Menentukan Tipe Pengguna (4 Tier)
  const getUserTierLabel = () => {
    const isPrem = profile?.is_premium
    const isLes = counts.isLesStudent

    if (isPrem && isLes) return { label: 'Siswa Les Private + Premium', color: 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white' }
    if (isPrem) return { label: 'Member Premium', color: 'bg-amber-500 text-white' }
    if (isLes) return { label: 'Siswa Les Private', color: 'bg-indigo-600 text-white' }
    return { label: 'Akun Gratis (Free Plan)', color: 'bg-slate-100 text-slate-700' }
  }

  if (loading) {
    return <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat dashboard siswa...</div>
  }

  const tier = getUserTierLabel()

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 antialiased">
      {/* Banner Welcome & Tier Badge */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
            <span className={`px-2.5 py-0.5 rounded-full ${tier.color}`}>{tier.label}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Selamat Datang, {profile?.full_name || 'Siswa TheoQED'}! 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xl">
            Siap untuk melanjutkan pembelajaran hari ini? Akses kelas LMS, modul TheoNotes, dan latihan bank soal kamu di sini.
          </p>
        </div>

        {!profile?.is_premium && (
          <Link
            href="/student/billing"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Zap className="w-4 h-4 text-amber-400" /> Upgrade Akses Premium
          </Link>
        )}
      </div>

      {/* Grid Quick Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/student/lms"
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-600/50 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kelas LMS</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.classrooms}</div>
          <span className="text-[10px] font-bold text-slate-500 block">Ruang kelas aktif</span>
        </Link>

        <Link
          href="/student/my-courses"
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-600/50 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Course Saya</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.courses}</div>
          <span className="text-[10px] font-bold text-slate-500 block">Course akses permanen</span>
        </Link>

        <Link
          href="/student/schedule"
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-600/50 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Jadwal Les</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{upcomingSchedule ? 1 : 0}</div>
          <span className="text-[10px] font-bold text-slate-500 block">Sesi terdekat mendatang</span>
        </Link>

        <Link
          href="/student/billing"
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-600/50 hover:shadow-md transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status Billing</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.unpaidBills}</div>
          <span className="text-[10px] font-bold text-rose-600 block">
            {counts.unpaidBills > 0 ? 'Tagihan SPP pending' : 'Semua tagihan lunas'}
          </span>
        </Link>
      </div>

      {/* Pertemuan Les Private Terdekat (Jika ada) */}
      {upcomingSchedule && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Agenda Bimbingan Les Private Terdekat
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase text-indigo-200">
              Sesi {upcomingSchedule.session_type}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-black text-white">{upcomingSchedule.subject}</h3>
              <div className="flex items-center gap-4 text-xs text-indigo-200 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(upcomingSchedule.scheduled_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Pukul {new Date(upcomingSchedule.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
            </div>

            {upcomingSchedule.session_type === 'online' && upcomingSchedule.meeting_link && (
              <a
                href={upcomingSchedule.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-2xl bg-white text-slate-900 text-xs font-black hover:bg-slate-100 transition-all shadow-md shrink-0 flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-indigo-600" /> Masuk Ruang Les
              </a>
            )}
          </div>
        </div>
      )}

      {/* Direct Shortcuts Modules */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Akses Modul & Pembelajaran</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/student/bank-soal"
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all space-y-3 group"
          >
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 w-fit group-hover:bg-slate-900 group-hover:text-white transition-all">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                Bank Soal Interaktif
              </h4>
              <p className="text-xs text-slate-500 font-medium line-clamp-2">
                Akses ribuan kumpulan soal dan pembahasan untuk jenjang Sekolah, UTBK, OSN, hingga Mata Kuliah.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-1">
              Buka Bank Soal <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/student/library"
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all space-y-3 group"
          >
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 w-fit group-hover:bg-slate-900 group-hover:text-white transition-all">
              <Library className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                Perpustakaan & TheoNotes
              </h4>
              <p className="text-xs text-slate-500 font-medium line-clamp-2">
                Kunci jawaban buku teks dunia, rangkuman rumus ringkas, dan modul matematika/sains interaktif.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-1">
              Buka Perpustakaan <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/student/courses"
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all space-y-3 group"
          >
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 w-fit group-hover:bg-slate-900 group-hover:text-white transition-all">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                Katalog Course Digital
              </h4>
              <p className="text-xs text-slate-500 font-medium line-clamp-2">
                Beli dan pelajari video kursus matematika & sains terstruktur dengan akses permanen selamanya.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-1">
              Jelajahi Course <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}