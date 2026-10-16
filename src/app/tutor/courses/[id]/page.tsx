'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Video,
  Settings,
  Layers,
  Eye,
  Users,
  Clock,
  GripVertical
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
  is_published: boolean
  image_url: string | null
  price: number | null
}

interface Enrollment {
  id: string
  student_email: string | null
  status: string
  enrolled_at: string
}

export default function TutorCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params)
  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [activeTab, setActiveTab] = useState<'curriculum' | 'students' | 'settings'>('curriculum')
  const [loading, setLoading] = useState(true)

  // State Drag and Drop
  const [draggedLesson, setDraggedLesson] = useState<{ lessonId: string; sourceModuleId: string } | null>(null)
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null)

  // State Pengaturan Course
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editCategory, setEditCategory] = useState('Kuliah')
  const [editIsPublished, setEditIsPublished] = useState(true)
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editPrice, setEditPrice] = useState<number>(0)

  // State Modal Bab
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [moduleTitle, setModuleTitle] = useState('')

  // State Modal Materi (Add / Edit)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [lessonModalMode, setLessonModalMode] = useState<'add' | 'edit'>('add')
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  
  const [lessonTitle, setLessonTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [transcriptPdf, setTranscriptPdf] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')

  // State Tambah Siswa Manual
  const [newStudentEmail, setNewStudentEmail] = useState('')

  useEffect(() => {
    fetchCourseDetail()
    fetchEnrollments()
  }, [courseId])

  const fetchCourseDetail = async () => {
    setLoading(true)
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseData) {
      setCourse(courseData)
      setEditTitle(courseData.title)
      setEditDesc(courseData.description || '')
      setEditCategory(courseData.category || 'Kuliah')
      setEditIsPublished(courseData.is_published ?? true)
      setEditImageUrl(courseData.image_url || '')
      setEditPrice(courseData.price || 0)
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
    }
    setLoading(false)
  }

  const fetchEnrollments = async () => {
    const { data } = await supabase
      .from('course_enrollments')
      .select('id, student_email, status, enrolled_at')
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false })

    if (data) setEnrollments(data)
  }

  // --- LOGIKA DRAG AND DROP REORDER MATERI ---
  const handleDragStart = (e: React.DragEvent, lessonId: string, sourceModuleId: string) => {
    e.stopPropagation()
    setDraggedLesson({ lessonId, sourceModuleId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, lessonId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (lessonId) setDragOverLessonId(lessonId)
  }

  const handleDrop = async (e: React.DragEvent, targetModuleId: string, targetLessonId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverLessonId(null)

    if (!draggedLesson) return
    const { lessonId: sourceLessonId, sourceModuleId } = draggedLesson
    setDraggedLesson(null)

    if (sourceLessonId === targetLessonId) return

    // Clone data modul untuk reorder lokal instan
    const newModules: Module[] = JSON.parse(JSON.stringify(modules))
    const sourceMod = newModules.find((m) => m.id === sourceModuleId)
    const targetMod = newModules.find((m) => m.id === targetModuleId)

    if (!sourceMod || !targetMod) return

    const sourceLessonIndex = sourceMod.course_lessons.findIndex((l) => l.id === sourceLessonId)
    if (sourceLessonIndex === -1) return

    // Ambil materi yang digeser
    const [movedLesson] = sourceMod.course_lessons.splice(sourceLessonIndex, 1)

    // Sisipkan ke posisi baru
    if (targetLessonId) {
      const targetIndex = targetMod.course_lessons.findIndex((l) => l.id === targetLessonId)
      targetMod.course_lessons.splice(targetIndex, 0, movedLesson)
    } else {
      targetMod.course_lessons.push(movedLesson)
    }

    // Perbarui state lokal secara cepat
    setModules(newModules)

    // Simpan posisi dan urutan baru ke Supabase
    const updates: { id: string; module_id: string; order_index: number }[] = []
    newModules.forEach((mod) => {
      mod.course_lessons.forEach((les, idx) => {
        updates.push({
          id: les.id,
          module_id: mod.id,
          order_index: idx + 1,
        })
      })
    })

    for (const item of updates) {
      await supabase
        .from('course_lessons')
        .update({ module_id: item.module_id, order_index: item.order_index })
        .eq('id', item.id)
    }
  }

  const handleAddStudentAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudentEmail) return

    const { error } = await supabase.from('course_enrollments').insert({
      course_id: courseId,
      student_email: newStudentEmail,
      status: 'active',
    })

    if (!error) {
      setNewStudentEmail('')
      fetchEnrollments()
    } else {
      alert('Siswa dengan email tersebut sudah terdaftar atau mengajukan akses.')
    }
  }

  const handleUpdateEnrollmentStatus = async (enrollmentId: string, status: string) => {
    const { error } = await supabase
      .from('course_enrollments')
      .update({ status })
      .eq('id', enrollmentId)

    if (!error) {
      fetchEnrollments()
    }
  }

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!confirm('Cabut dan hapus akses siswa ini dari course?')) return
    await supabase.from('course_enrollments').delete().eq('id', enrollmentId)
    fetchEnrollments()
  }

  const handleUpdateCourseSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data } = await supabase
      .from('courses')
      .update({
        title: editTitle,
        description: editDesc,
        category: editCategory,
        is_published: editIsPublished,
        image_url: editImageUrl || null,
        price: editPrice,
      })
      .eq('id', courseId)
      .select()
      .single()

    if (data) {
      setCourse(data)
      alert('Pengaturan kelas berhasil disimpan!')
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!moduleTitle) return

    const { data } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: moduleTitle,
        order_index: modules.length + 1,
      })
      .select()
      .single()

    if (data) {
      setModules([...modules, { ...data, course_lessons: [] }])
      setModuleTitle('')
      setShowModuleModal(false)
    }
  }

  const openAddLessonModal = (moduleId: string) => {
    setActiveModuleId(moduleId)
    setActiveLessonId(null)
    setLessonTitle('')
    setVideoUrl('')
    setDuration('')
    setTranscriptPdf('')
    setLessonDesc('')
    setLessonModalMode('add')
    setShowLessonModal(true)
  }

  const openEditLessonModal = (lesson: Lesson, moduleId: string) => {
    setActiveModuleId(moduleId)
    setActiveLessonId(lesson.id)
    setLessonTitle(lesson.title)
    setVideoUrl(lesson.video_url || '')
    setDuration(lesson.duration || '')
    setTranscriptPdf(lesson.transcript_pdf || '')
    setLessonDesc(lesson.description || '')
    setLessonModalMode('edit')
    setShowLessonModal(true)
  }

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonTitle || !videoUrl) return

    if (lessonModalMode === 'add') {
      const targetModule = modules.find((m) => m.id === activeModuleId)
      const nextOrder = targetModule ? targetModule.course_lessons.length + 1 : 1

      const { error } = await supabase.from('course_lessons').insert({
        module_id: activeModuleId,
        title: lessonTitle,
        video_url: videoUrl,
        duration: duration || null,
        transcript_pdf: transcriptPdf || null,
        description: lessonDesc || null,
        order_index: nextOrder,
      })

      if (!error) {
        fetchCourseDetail()
        setShowLessonModal(false)
      } else {
        alert('Gagal menambahkan materi.')
      }
    } else {
      const { error } = await supabase
        .from('course_lessons')
        .update({
          title: lessonTitle,
          video_url: videoUrl,
          duration: duration || null,
          transcript_pdf: transcriptPdf || null,
          description: lessonDesc || null,
        })
        .eq('id', activeLessonId)

      if (!error) {
        fetchCourseDetail()
        setShowLessonModal(false)
      } else {
        alert('Gagal memperbarui materi.')
      }
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Hapus bab ini beserta seluruh materinya?')) return
    await supabase.from('course_modules').delete().eq('id', moduleId)
    setModules(modules.filter((m) => m.id !== moduleId))
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Hapus materi video ini?')) return
    await supabase.from('course_lessons').delete().eq('id', lessonId)
    fetchCourseDetail()
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-400 font-medium">
        Memuat studio kelas...
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 antialiased">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/tutor/courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kelas
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/student/courses/${courseId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Siswa
          </Link>
        </div>
      </div>

      {course && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
                  {course.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  course.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {course.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{course.title}</h1>
              <p className="text-xs text-slate-500 font-medium">{course.description || 'Belum ada deskripsi.'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'curriculum' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kurikulum & Materi
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'students' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Manajemen Akses Siswa ({enrollments.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'settings' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Pengaturan Kelas
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: KURIKULUM & REORDER MATERI */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900">Daftar Bab & Video Pembelajaran</h3>
            <button
              onClick={() => setShowModuleModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" /> Tambah Bab Baru
            </button>
          </div>

          {modules.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Layers className="w-5 h-5 text-slate-400 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-sm">Kurikulum Masih Kosong</h3>
            </div>
          ) : (
            modules.map((module, modIndex) => (
              <div
                key={module.id}
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e, module.id)}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs transition-colors"
              >
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                      {modIndex + 1}
                    </span>
                    <h3 className="text-xs font-black text-slate-900">{module.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddLessonModal(module.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Video
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 min-h-[50px]">
                  {module.course_lessons.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400 font-medium">
                      Tarik materi ke sini untuk memindahkan ke bab ini.
                    </div>
                  ) : (
                    module.course_lessons.map((lesson, lesIndex) => (
                      <div
                        key={lesson.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lesson.id, module.id)}
                        onDragOver={(e) => handleDragOver(e, lesson.id)}
                        onDrop={(e) => handleDrop(e, module.id, lesson.id)}
                        className={`p-4 flex items-center justify-between gap-4 transition-all bg-white hover:bg-slate-50/80 cursor-grab active:cursor-grabbing ${
                          dragOverLessonId === lesson.id ? 'border-t-2 border-indigo-600 bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-600 shrink-0" />
                          <span className="text-slate-400 text-xs font-bold w-4">{lesIndex + 1}.</span>
                          <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">{lesson.title}</span>
                            {lesson.description && (
                              <span className="text-[11px] text-slate-500 block truncate">{lesson.description}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => openEditLessonModal(lesson, module.id)}
                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                            title="Edit Materi"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                            title="Hapus Materi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: MANAJEMEN AKSES SISWA */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">Beri Akses Manual ke Siswa</h3>
            <form onSubmit={handleAddStudentAccess} className="flex gap-3">
              <input
                type="email"
                required
                placeholder="Masukkan email siswa..."
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shrink-0"
              >
                Beri Akses Aktif
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="p-5 bg-slate-50/80 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Daftar Siswa & Status Akses</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {enrollments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">Belum ada siswa yang meminta atau diberi akses ke kelas ini.</div>
              ) : (
                enrollments.map((item) => (
                  <div key={item.id} className="p-5 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{item.student_email || 'Siswa Terdaftar'}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3" /> Diminta pada: {new Date(item.enrolled_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.status === 'active' ? 'Aktif' : 'Pending'}
                      </span>

                      {item.status === 'pending' ? (
                        <button
                          onClick={() => handleUpdateEnrollmentStatus(item.id, 'active')}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800"
                        >
                          Setujui
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateEnrollmentStatus(item.id, 'pending')}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-[11px] font-bold hover:bg-amber-100"
                        >
                          Jadikan Pending
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteEnrollment(item.id)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Cabut Akses"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENGATURAN KELAS */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900">Pengaturan Informasi Kelas</h3>
          <form onSubmit={handleUpdateCourseSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kelas</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Harga Kelas (Rp)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 150000"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                >
                  <option value="Kuliah">Kuliah</option>
                  <option value="Matematika">Matematika</option>
                  <option value="Olimpiade">Olimpiade</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL Gambar Banner (Embed Link)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Publikasi</label>
              <select
                value={editIsPublished ? 'true' : 'false'}
                onChange={(e) => setEditIsPublished(e.target.value === 'true')}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              >
                <option value="true">Published (Publik)</option>
                <option value="false">Draft (Privat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none"
              />
            </div>

            <button type="submit" className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold">
              Simpan Perubahan
            </button>
          </form>
        </div>
      )}

      {/* Modal Tambah Bab */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Tambah Bab Baru</h3>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Judul Bab..."
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModuleModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Batal</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Video Materi */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900">
              {lessonModalMode === 'add' ? 'Tambah Video Materi' : 'Edit Video Materi'}
            </h3>
            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Materi</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pengantar Himpunan Bilangan"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL YouTube Video</label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durasi (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 08:15"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link File PDF Modul</label>
                  <input
                    type="text"
                    placeholder="https://...file.pdf"
                    value={transcriptPdf}
                    onChange={(e) => setTranscriptPdf(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Materi</label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan singkat mengenai materi video ini..."
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2.5 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800"
                >
                  {lessonModalMode === 'add' ? 'Simpan Materi' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}