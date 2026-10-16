'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, School, Copy, Check, ArrowRight, Sparkles, Trash2, User } from 'lucide-react'

interface Classroom {
  id: string
  class_code: string
  title: string
  subject: string | null
  instructor_name: string | null
  tutor_email: string
  created_at: string
}

export default function TutorLmsStudioPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [instructorName, setInstructorName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const tutorEmail = user?.email || 'dave.theoqed@gmail.com'

    const { data } = await supabase
      .from('lms_classrooms')
      .select('*')
      .eq('tutor_email', tutorEmail)
      .order('created_at', { ascending: false })

    if (data) setClassrooms(data)
    setLoading(false)
  }

  const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'THQ-'
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const tutorEmail = user?.email || 'dave.theoqed@gmail.com'

    const newCode = generateClassCode()

    const { data, error } = await supabase
      .from('lms_classrooms')
      .insert({
        title,
        subject: subject || null,
        instructor_name: instructorName || 'Tutor TheoQED',
        class_code: newCode,
        tutor_email: tutorEmail,
      })
      .select()
      .single()

    if (data && !error) {
      setClassrooms([data, ...classrooms])
      setShowModal(false)
      setTitle('')
      setSubject('')
      setInstructorName('')
    } else {
      alert('Gagal membuat kelas. Silakan coba lagi.')
    }
    setSubmitting(false)
  }

  const handleDeleteClassroom = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas LMS ini beserta seluruh data di dalamnya?')) return
    await supabase.from('lms_classrooms').delete().eq('id', id)
    setClassrooms(classrooms.filter((c) => c.id !== id))
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-indigo-600" /> Studio LMS Interaktif
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Kelas LMS</h1>
          <p className="text-xs text-slate-500 font-medium">Buat ruang kelas interaktif, kelola diskusi, beri tugas, dan nilai pekerjaan siswa.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Buat Kelas LMS Baru
        </button>
      </div>

      {/* Grid Kelas LMS */}
      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat kelas LMS...</div>
      ) : classrooms.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
          <School className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-sm">Belum Ada Kelas LMS</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Buat kelas interaktif pertama Anda untuk mulai berdiskusi dan memberikan tugas kepada siswa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col justify-between group hover:shadow-md transition-all"
            >
              <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-indigo-200 text-[10px] font-extrabold uppercase tracking-wider">
                    {item.subject || 'Mata Pelajaran'}
                  </span>
                  <button
                    onClick={() => handleDeleteClassroom(item.id)}
                    className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors"
                    title="Hapus Kelas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight text-white line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-indigo-200/80 flex items-center gap-1.5 pt-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Pengajar: {item.instructor_name || item.tutor_email}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Kode Kelas Siswa</span>
                    <span className="text-sm font-black text-indigo-600 tracking-wider">{item.class_code}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(item.class_code)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Salin Kode Kelas"
                  >
                    {copiedCode === item.class_code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/tutor/lms/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs w-full justify-center"
                  >
                    Buka Ruang Kelas <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Buat Kelas LMS Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-black text-slate-900">Buat Kelas LMS Baru</h2>
            <form onSubmit={handleCreateClassroom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kalkulus I - Kelas A"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran / Topik</label>
                <input
                  type="text"
                  placeholder="Misal: Matematika / Analisis Real"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pengajar</label>
                <input
                  type="text"
                  placeholder="Misal: Dave Marcellino, S.Pd."
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Membuat...' : 'Buat Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}