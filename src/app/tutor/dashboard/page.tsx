'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  School,
  FileCheck2,
  Wallet,
  Calendar,
  Plus,
  Users,
  Video,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Library,
  AlertCircle,
  BookOpen
} from 'lucide-react'

interface PendingSubmission {
  id: string
  student_email: string
  submitted_at: string
  lms_assignments: {
    title: string
    lms_classrooms: {
      title: string
    }
  }
}

interface PendingPremiumSub {
  id: string
  amount: number
  created_at: string
  profiles?: {
    full_name: string | null
    email: string | null
  }
}

interface UpcomingLes {
  id: string
  student_email: string
  subject: string
  session_type: 'online' | 'offline'
  meeting_link: string | null
  scheduled_at: string
  duration_minutes: number
  profiles?: {
    full_name: string | null
  }
}

export default function TutorDashboardPage() {
  const supabase = createClient()

  const [stats, setStats] = useState({
    classrooms: 0,
    pendingGrades: 0,
    pendingPayments: 0,
    upcomingSchedules: 0,
  })

  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([])
  const [pendingPremiumSubs, setPendingPremiumSubs] = useState<PendingPremiumSub[]>([])
  const [upcomingLesList, setUpcomingLesList] = useState<UpcomingLes[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTutorDashboardData()
  }, [])

  const fetchTutorDashboardData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const tutorEmail = user?.email || 'dave.theoqed@gmail.com'

    // 1. Fetch Total Classrooms
    const { count: classCount } = await supabase
      .from('lms_classrooms')
      .select('*', { count: 'exact', head: true })
      .eq('tutor_email', tutorEmail)

    // 2. Fetch Pending Submissions to Grade
    const { data: subData, count: gradeCount } = await supabase
      .from('lms_submissions')
      .select(`
        id, student_email, submitted_at,
        lms_assignments!inner (
          title,
          lms_classrooms!inner (
            title, tutor_email
          )
        )
      `, { count: 'exact' })
      .eq('lms_assignments.lms_classrooms.tutor_email', tutorEmail)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false })
      .limit(3)

    if (subData) setPendingSubmissions(subData as any)

    // 3. Fetch Pending Premium Payment Requests
    const { data: premData, count: premCount } = await supabase
      .from('premium_subscriptions')
      .select('id, amount, created_at, profiles(full_name, email)', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(3)

    if (premData) setPendingPremiumSubs(premData as any)

    // 4. Fetch Upcoming Les Schedules
    const { data: schedData, count: schedCount } = await supabase
      .from('les_schedules')
      .select('*, profiles(full_name)', { count: 'exact' })
      .eq('tutor_email', tutorEmail)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(3)

    if (schedData) setUpcomingLesList(schedData as any)

    setStats({
      classrooms: classCount || 0,
      pendingGrades: gradeCount || 0,
      pendingPayments: premCount || 0,
      upcomingSchedules: schedCount || 0,
    })

    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat studio tutor...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Executive Tutor Command Center
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Studio Pengajar TheoQED</h1>
          <p className="text-xs text-slate-500 font-medium max-w-xl">
            Kelola kelas LMS interaktif, periksa tugas masuk dari siswa, verifikasi transaksi pembayaran, dan jadwalkan sesi les private.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/tutor/lms"
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs"
          >
            + Buat Kelas LMS
          </Link>
          <Link
            href="/tutor/schedule"
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
          >
            + Jadwal Les
          </Link>
        </div>
      </div>

      {/* Grid Stats Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/tutor/lms"
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-600/50 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kelas LMS</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.classrooms}</div>
          <span className="text-[10px] font-bold text-slate-500 block">Ruang kelas aktif</span>
        </Link>

        <Link
          href="/tutor/assignments"
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-600/50 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tugas Perlu Dinilai</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.pendingGrades}</div>
          <span className="text-[10px] font-bold text-amber-600 block">
            {stats.pendingGrades > 0 ? 'Menunggu pemeriksaan' : 'Semua tugas terperiksa'}
          </span>
        </Link>

        <Link
          href="/tutor/billing"
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-600/50 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Verifikasi Premium</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.pendingPayments}</div>
          <span className="text-[10px] font-bold text-indigo-600 block">Permohonan pending</span>
        </Link>

        <Link
          href="/tutor/schedule"
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-600/50 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Jadwal Les Private</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.upcomingSchedules}</div>
          <span className="text-[10px] font-bold text-slate-500 block">Agenda mendatang</span>
        </Link>
      </div>

      {/* Grid 2 Kolom: Tugas Pending & Jadwal Les Terdekat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Kolom 1: Tugas Masuk Belum Dinilai */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-indigo-600" /> Tugas Siswa Menunggu Penilaian
            </h3>
            <Link href="/tutor/assignments" className="text-[10px] font-bold text-indigo-600 hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="space-y-3">
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">
                Semua tugas dari siswa sudah diperiksa.
              </div>
            ) : (
              pendingSubmissions.map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900">{sub.lms_assignments?.title}</span>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      Belum Dinilai
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Siswa: {sub.student_email}</span>
                    <span>{new Date(sub.submitted_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Agenda Les Private Terdekat */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Jadwal Bimbingan Les Terdekat
            </h3>
            <Link href="/tutor/schedule" className="text-[10px] font-bold text-indigo-600 hover:underline">
              Kelola Jadwal →
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingLesList.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">
                Belum ada agenda les private terdekat.
              </div>
            ) : (
              upcomingLesList.map((les) => (
                <div key={les.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900">{les.subject}</span>
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                      {les.session_type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-600 font-medium">
                    <span>Siswa: {les.profiles?.full_name || les.student_email}</span>
                    <span className="font-bold text-slate-900">
                      {new Date(les.scheduled_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} | {new Date(les.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Management Studio Shortcuts */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Studio Pengelolaan Konten</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/tutor/bank-soal"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-2 group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit group-hover:bg-slate-900 group-hover:text-white transition-all">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              Studio Bank Soal
            </h4>
            <span className="text-[10px] text-slate-400 block font-medium">Input soal & pembahasan LaTeX</span>
          </Link>

          <Link
            href="/tutor/library"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-2 group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit group-hover:bg-slate-900 group-hover:text-white transition-all">
              <Library className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              Studio Perpustakaan
            </h4>
            <span className="text-[10px] text-slate-400 block font-medium">Kelola modul TheoNotes & Buku Teks</span>
          </Link>

          <Link
            href="/tutor/courses"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-2 group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit group-hover:bg-slate-900 group-hover:text-white transition-all">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              Studio Course Digital
            </h4>
            <span className="text-[10px] text-slate-400 block font-medium">Buat modul video & materi permanen</span>
          </Link>

          <Link
            href="/tutor/billing"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-2 group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit group-hover:bg-slate-900 group-hover:text-white transition-all">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              Studio Billing & SPP
            </h4>
            <span className="text-[10px] text-slate-400 block font-medium">Terbitkan tagihan & verifikasi transaksi</span>
          </Link>
        </div>
      </div>
    </div>
  )
}