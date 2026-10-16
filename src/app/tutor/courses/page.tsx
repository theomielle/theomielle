'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, BookOpen, Edit3, Trash2, Eye, Sparkles, GraduationCap } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  instructor_name: string
  category: string
  is_published: boolean
  created_at: string
}

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Kuliah')
  const [instructorName, setInstructorName] = useState('Dave Marcellino')
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setCourses(data)
    setLoading(false)
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        category,
        instructor_name: instructorName,
        is_published: true
      })
      .select()
      .single()

    if (data) {
      setCourses([data, ...courses])
      setShowModal(false)
      setTitle('')
      setDescription('')
    }
    setSubmitting(false)
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus kelas ini beserta seluruh materi di dalamnya?')) return

    await supabase.from('courses').delete().eq('id', id)
    setCourses(courses.filter((c) => c.id !== id))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 antialiased">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-500" /> Tutor Studio
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Course Mandiri</h1>
          <p className="text-xs text-slate-500 font-medium">Buat dan kelola materi pembelajaran, bab, serta playlist video untuk siswa.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" /> Buat Kelas Baru
        </button>
      </div>

      {/* Grid List Course */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400 font-medium">Memuat data kelas...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Belum Ada Kelas</h3>
          <p className="text-xs text-slate-500">Mulai tambahkan kelas pertama kamu untuk dipelajari oleh siswa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                    {course.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-lg tracking-tight line-clamp-1">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {course.description || 'Belum ada deskripsi kelas.'}
                </p>

                <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1 pt-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {course.instructor_name}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/student/courses/${course.id}`}
                  target="_blank"
                  className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Preview Tampilan Siswa"
                >
                  <Eye className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Hapus Kelas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/tutor/courses/${course.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Kelola Materi
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Kelas Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-black text-slate-900">Buat Kelas Baru</h2>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Real Analysis I"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                  >
                    <option value="Kuliah">Kuliah</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Olimpiade">Olimpiade</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pengajar</label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan konsep yang dipelajari..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  {submitting ? 'Simpan...' : 'Buat Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}