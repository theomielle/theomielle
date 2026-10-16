'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Video,
  Lock,
  ShieldCheck,
  Clock,
  Tag,
  Gift
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  video_url: string
  duration: string | null
  transcript_pdf: string | null
  description: string | null
  order_index: number
}

interface Module {
  id: string
  title: string
  order_index: number
  course_lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  instructor_name: string
  price: number | null
}

export default function StudentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})

  useEffect(() => {
    checkEnrollmentAndFetchCourse()
  }, [courseId])

  const checkEnrollmentAndFetchCourse = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email

    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseData) setCourse(courseData)

    if (userEmail) {
      const { data: enrollmentData } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_email', userEmail)
        .maybeSingle()

      if (enrollmentData && enrollmentData.status === 'active') {
        setIsEnrolled(true)
        setEnrollmentStatus('active')
      } else if (enrollmentData && enrollmentData.status === 'pending') {
        setIsEnrolled(false)
        setEnrollmentStatus('pending')
      } else {
        setIsEnrolled(false)
        setEnrollmentStatus(null)
      }
    } else {
      setIsEnrolled(false)
      setEnrollmentStatus(null)
    }

    const { data: modData } = await supabase
      .from('course_modules')
      .select(`
        id, title, order_index,
        course_lessons (
          id, title, video_url, duration, transcript_pdf, description, order_index
        )
      `)
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (modData) {
      const sortedModules = modData.map((mod: Module) => ({
        ...mod,
        course_lessons: (mod.course_lessons || []).sort(
          (a: Lesson, b: Lesson) => a.order_index - b.order_index
        ),
      }))
      setModules(sortedModules)

      if (sortedModules.length > 0 && sortedModules[0].course_lessons.length > 0) {
        setActiveLesson(sortedModules[0].course_lessons[0])
      }

      const initialOpenState: Record<string, boolean> = {}
      sortedModules.forEach((m: Module) => {
        initialOpenState[m.id] = true
      })
      setOpenModules(initialOpenState)
    }

    const { data: progressData } = await supabase
      .from('student_lesson_progress')
      .select('lesson_id')
      .eq('is_completed', true)

    if (progressData) {
      setCompletedLessonIds(progressData.map((p) => p.lesson_id))
    }

    setLoading(false)
  }

  // Klaim langsung untuk kelas gratis
  const handleClaimFreeCourse = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email || 'siswa.theoqed@gmail.com'

    const { error } = await supabase.from('course_enrollments').upsert({
      course_id: courseId,
      student_email: userEmail,
      status: 'active',
    }, { onConflict: 'user_id,course_id' })

    if (!error) {
      alert('Selamat! Akses kelas gratis berhasil diaktifkan.')
      setIsEnrolled(true)
      setEnrollmentStatus('active')
    } else {
      const { error: insertError } = await supabase.from('course_enrollments').insert({
        course_id: courseId,
        student_email: userEmail,
        status: 'active',
      })
      if (!insertError) {
        alert('Selamat! Akses kelas gratis berhasil diaktifkan.')
        setIsEnrolled(true)
        setEnrollmentStatus('active')
      }
    }
  }

  const toggleCompleteLesson = async (lessonId: string) => {
    const isCompleted = completedLessonIds.includes(lessonId)

    if (isCompleted) {
      await supabase.from('student_lesson_progress').delete().eq('lesson_id', lessonId)
      setCompletedLessonIds(completedLessonIds.filter((id) => id !== lessonId))
    } else {
      await supabase.from('student_lesson_progress').insert({
        lesson_id: lessonId,
        is_completed: true,
      })
      setCompletedLessonIds([...completedLessonIds, lessonId])
    }
  }

  const allLessons = modules.flatMap((m) => m.course_lessons)
  const totalLessons = allLessons.length
  const completedCount = allLessons.filter((l) => completedLessonIds.includes(l.id)).length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const isFree = !course?.price || course.price === 0

  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-400">
        Memuat data kelas...
      </div>
    )
  }

  // TAMPILAN JIKA BELUM TERDAFTAR / BELUM AKTIF
  if (!isEnrolled) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8 antialiased">
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                {course?.category}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full ${
                enrollmentStatus === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600'
              }`}>
                {enrollmentStatus === 'pending' ? <Clock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {enrollmentStatus === 'pending' ? 'Menunggu Verifikasi Tutor' : 'Akses Terkunci'}
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{course?.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              {course?.description || 'Pelajari materi mendalam dan kuasai konsep matematika tingkat lanjut secara sistematis.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Pengajar: {course?.instructor_name}
              </div>
              <div className="flex items-center gap-1.5 text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isFree ? 'Gratis' : `Rp ${course?.price?.toLocaleString('id-ID')}`}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Status Akses</span>
              <span className="text-sm font-bold text-slate-800">
                {enrollmentStatus === 'pending'
                  ? 'Permintaan Anda sedang ditinjau oleh tutor.'
                  : isFree
                    ? 'Kelas ini gratis! Klik tombol di samping untuk langsung mulai belajar.'
                    : 'Dapatkan akses penuh untuk mulai belajar materi video.'}
              </span>
            </div>

            {enrollmentStatus === 'pending' ? (
              <div className="px-6 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" /> Menunggu Persetujuan Tutor
              </div>
            ) : isFree ? (
              <button
                onClick={handleClaimFreeCourse}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md cursor-pointer"
              >
                <Gift className="w-4 h-4 text-emerald-200" />
                Klaim Akses Gratis Sekarang
              </button>
            ) : (
              <button
                onClick={() => router.push(`/student/courses/${courseId}/checkout`)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Dapatkan Akses Kelas
              </button>
            )}
          </div>
        </div>

        {/* Silabus Preview */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900">Kurikulum & Silabus Materi</h3>
          <div className="space-y-3">
            {modules.map((mod, idx) => (
              <div key={mod.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{mod.title}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> {mod.course_lessons.length} Video Materi
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // TAMPILAN PLAYER KELAS (AKSES AKTIF)
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 antialiased">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/student/my-courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Kelas Saya
        </Link>

        <h1 className="text-base font-black text-slate-900 tracking-tight hidden md:block">
          {course?.title}
        </h1>

        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
          Akses Aktif
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-md border border-slate-900 relative aspect-video flex items-center justify-center">
            {activeLesson && activeLesson.video_url ? (
              <iframe
                src={getEmbedUrl(activeLesson.video_url)}
                title={activeLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-slate-500 text-xs font-medium flex items-center gap-2">
                <Video className="w-5 h-5 text-slate-600" />
                <span>Pilih video materi di kurikulum untuk mulai belajar</span>
              </div>
            )}
          </div>

          {activeLesson && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block mb-0.5">
                    Materi Aktif
                  </span>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {activeLesson.title}
                  </h2>
                  {activeLesson.description && (
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-2xl">
                      {activeLesson.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleCompleteLesson(activeLesson.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-2xs shrink-0 ${
                    completedLessonIds.includes(activeLesson.id)
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completedLessonIds.includes(activeLesson.id)
                    ? 'Selesai Dipelajari'
                    : 'Tandai Selesai'}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span>Pengajar: {course?.instructor_name}</span>
                </div>

                {activeLesson.transcript_pdf && (
                  <a
                    href={activeLesson.transcript_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Unduh PDF Modul
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-5">
          <div className="space-y-2 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs font-black text-slate-900">
              <span>Progress Belajar</span>
              <span className="text-indigo-600 font-black">{progressPercent}%</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="text-[10px] font-bold text-slate-400">
              {completedCount} dari {totalLessons} Materi Selesai
            </div>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {modules.map((module, modIdx) => (
              <div key={module.id} className="border border-slate-200/80 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenModules((prev) => ({ ...prev, [module.id]: !prev[module.id] }))}
                  className="w-full p-3 bg-slate-50/80 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
                >
                  <span className="text-xs font-black text-slate-900">
                    Bab {modIdx + 1}: {module.title}
                  </span>
                  {openModules[module.id] ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {openModules[module.id] && (
                  <div className="divide-y divide-slate-100 bg-white">
                    {module.course_lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id
                      const isCompleted = completedLessonIds.includes(lesson.id)

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full p-3 flex items-center justify-between gap-3 text-left transition-colors ${
                            isActive ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                            <span className={`text-xs font-bold truncate ${
                              isActive ? 'text-indigo-900' : 'text-slate-700'
                            }`}>
                              {lesson.title}
                            </span>
                          </div>

                          {lesson.duration && (
                            <span className="text-[10px] font-medium text-slate-400 shrink-0">
                              {lesson.duration}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}