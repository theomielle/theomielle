'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Trash2, Users, Sparkles, Clock } from 'lucide-react'

interface Enrollment {
  id: string
  status: string
  enrolled_at: string
  courses: {
    title: string
  } | { title: string }[] | null
}

export default function TutorEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        id, status, enrolled_at,
        courses ( title )
      `)
      .order('enrolled_at', { ascending: false })

    if (data) {
      setEnrollments(data as Enrollment[])
    }
    setLoading(false)
  }

  // Setujui Akses Siswa
  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('course_enrollments')
      .update({ status: 'active' })
      .eq('id', id)

    if (!error) {
      fetchEnrollments()
    }
  }

  // Hapus / Tolak Pendaftaran
  const handleDelete = async (id: string) => {
    if (!confirm('Hapus akses pendaftaran ini?')) return
    await supabase.from('course_enrollments').delete().eq('id', id)
    setEnrollments(enrollments.filter((e) => e.id !== id))
  }

  // Helper aman untuk mengambil judul course terlepas dari bentuk relasinya
  const getCourseTitle = (courses: Enrollment['courses']) => {
    if (!courses) return 'Kelas Mandiri'
    if (Array.isArray(courses)) {
      return courses[0]?.title || 'Kelas Mandiri'
    }
    return courses.title || 'Kelas Mandiri'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 antialiased">
      <div className="bg-white p-8 rounded-3xl border border-slate-200/85 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-500" /> Tutor Studio
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verifikasi Pendaftaran & Akses Siswa</h1>
          <p className="text-xs text-slate-500 font-medium">Setujui pembayaran siswa yang masuk untuk membukakan akses penuh ke kelas.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400 font-medium">Memuat data pendaftaran...</div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-5 h-5 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-sm">Belum Ada Siswa Mendaftar</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {enrollments.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {getCourseTitle(item.courses)}
                  </span>
                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">
                      Diajukan pada: {new Date(item.enrolled_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {item.status === 'active' ? 'Aktif (Disetujui)' : 'Pending (Menunggu)'}
                  </span>

                  {item.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Setujui Akses
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}