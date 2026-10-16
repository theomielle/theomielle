'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, PlayCircle, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'

interface EnrolledCourse {
  id: string
  status: string
  courses: {
    id: string
    title: string
    description: string
    category: string
    instructor_name: string
    image_url: string | null
  }
}

export default function MyCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMyCourses()
  }, [])

  const fetchMyCourses = async () => {
    setLoading(true)

    // 1. Ambil data user yang sedang login
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email

    if (!userEmail) {
      setLoading(false)
      return
    }

    // 2. Ambil data enrollment yang statusnya active DAN milik email user yang sedang login
    const { data } = await supabase
      .from('course_enrollments')
      .select(`
        id, status,
        courses (
          id, title, description, category, instructor_name, image_url
        )
      `)
      .eq('status', 'active')
      .eq('student_email', userEmail) // <-- KUNCI UTAMA: Hanya tampilkan milik siswa yang login

    if (data) {
      setEnrolledCourses(data as unknown as EnrolledCourse[])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 antialiased">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-emerald-600" /> Ruang Belajar Siswa
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kelas Saya</h1>
        <p className="text-xs text-slate-500 font-medium max-w-xl">
          Seluruh kelas yang telah disetujui dan aktif akses pembelajarannya.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat kelas saya...</div>
      ) : enrolledCourses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-sm">Belum Ada Kelas Aktif</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Anda belum mendaftar kelas atau pendaftaran Anda masih dalam status verifikasi oleh tutor.
          </p>
          <Link
            href="/student/courses"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
          >
            Buka Katalog Kelas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((item) => {
            const course = item.courses
            if (!course) return null

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col justify-between group hover:shadow-md transition-all"
              >
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-black text-sm tracking-tight bg-gradient-to-br from-slate-900 to-indigo-950">
                      TheoQED Academy
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Akses Aktif
                  </span>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-base tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {course.description || 'Materi pembelajaran terstruktur.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
                      <span className="truncate">{course.instructor_name}</span>
                    </div>

                    <Link
                      href={`/student/courses/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs w-full justify-center"
                    >
                      <PlayCircle className="w-4 h-4 text-emerald-400" /> Buka & Pelajari
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}