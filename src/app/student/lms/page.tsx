'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, School, ArrowRight, Sparkles, Key, BookOpen } from 'lucide-react'

interface ClassroomMember {
  id: string
  classroom_id: string
  joined_at: string
  lms_classrooms: {
    id: string
    title: string
    subject: string | null
    class_code: string
    tutor_email: string
  }
}

export default function StudentLmsDashboardPage() {
  const [joinedClasses, setJoinedClasses] = useState<ClassroomMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [classCodeInput, setClassCodeInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchJoinedClassrooms()
  }, [])

  const fetchJoinedClassrooms = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email || 'siswa.theoqed@gmail.com'

    const { data } = await supabase
      .from('lms_classroom_members')
      .select(`
        id, classroom_id, joined_at,
        lms_classrooms (
          id, title, subject, class_code, tutor_email
        )
      `)
      .eq('student_email', userEmail)
      .order('joined_at', { ascending: false })

    if (data) {
      setJoinedClasses(data as unknown as ClassroomMember[])
    }
    setLoading(false)
  }

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classCodeInput) return

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email || 'siswa.theoqed@gmail.com'

    // 1. Cari kelas berdasarkan kode yang diinput
    const { data: targetClass, error: findError } = await supabase
      .from('lms_classrooms')
      .select('id, title')
      .eq('class_code', classCodeInput.trim().toUpperCase())
      .single()

    if (findError || !targetClass) {
      alert('Kode kelas tidak ditemukan. Pastikan kode yang Anda masukkan benar.')
      setSubmitting(false)
      return
    }

    // 2. Gabungkan siswa ke kelas tersebut
    const { error: joinError } = await supabase
      .from('lms_classroom_members')
      .insert({
        classroom_id: targetClass.id,
        student_email: userEmail,
      })

    if (!joinError) {
      alert(`Berhasil bergabung ke kelas "${targetClass.title}"!`)
      setShowJoinModal(false)
      setClassCodeInput('')
      fetchJoinedClassrooms()
    } else {
      alert('Anda sudah terdaftar di kelas ini.')
    }

    setSubmitting(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Classroom Interaktif
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kelas LMS Saya</h1>
          <p className="text-xs text-slate-500 font-medium">Ruang kelas interaktif untuk berdiskusi, membaca pengumuman, dan mengumpulkan tugas.</p>
        </div>

        <button
          onClick={() => setShowJoinModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Gabung Kelas Baru
        </button>
      </div>

      {/* Grid Daftar Kelas LMS yang Diikuti */}
      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat kelas LMS Anda...</div>
      ) : joinedClasses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4">
          <School className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-sm">Belum Ada Kelas LMS</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Masukkan kode kelas dari tutor Anda untuk bergabung ke ruang kelas interaktif.
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
          >
            <Key className="w-4 h-4" /> Masukkan Kode Kelas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {joinedClasses.map((item) => {
            const classroom = item.lms_classrooms
            if (!classroom) return null

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col justify-between group hover:shadow-md transition-all"
              >
                <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-indigo-200 text-[10px] font-extrabold uppercase tracking-wider">
                      {classroom.subject || 'Mata Pelajaran'}
                    </span>
                    <School className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight text-white line-clamp-1">{classroom.title}</h3>
                    <p className="text-xs text-indigo-200/80">Pengajar: {classroom.tutor_email}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Kode Kelas:</span>
                    <span className="text-xs font-black text-indigo-600 tracking-wider">{classroom.class_code}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href={`/student/lms/${classroom.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs w-full justify-center"
                    >
                      Masuk Ruang Kelas <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Gabung Kelas LMS */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">Gabung Kelas LMS</h2>
              <p className="text-xs text-slate-500 font-medium">Mintalah kode kelas kepada tutor Anda, lalu masukkan di bawah ini.</p>
            </div>

            <form onSubmit={handleJoinClassroom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: THQ-82A"
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 uppercase tracking-widest font-black focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Memeriksa...' : 'Gabung Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}