'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Megaphone,
  FileText,
  Users,
  Calendar,
  Clock,
  Upload,
  CheckCircle2
} from 'lucide-react'

interface Classroom {
  id: string
  title: string
  subject: string | null
  class_code: string
  tutor_email: string
}

interface Announcement {
  id: string
  author_email: string
  content: string
  created_at: string
}

interface Assignment {
  id: string
  title: string
  instructions: string | null
  due_date: string | null
  max_points: number
  created_at: string
}

export default function StudentClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classroomId } = use(params)
  const supabase = createClient()

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork'>('stream')
  const [loading, setLoading] = useState(true)

  // Submission State
  const [selectedTask, setSelectedTask] = useState<Assignment | null>(null)
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [submissionText, setSubmissionText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchClassroomDetails()
  }, [classroomId])

  const fetchClassroomDetails = async () => {
    setLoading(true)

    const { data: classData } = await supabase
      .from('lms_classrooms')
      .select('*')
      .eq('id', classroomId)
      .single()

    if (classData) setClassroom(classData)

    const { data: streamData } = await supabase
      .from('lms_announcements')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false })

    if (streamData) setAnnouncements(streamData)

    const { data: taskData } = await supabase
      .from('lms_assignments')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false })

    if (taskData) setAssignments(taskData)

    setLoading(false)
  }

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask || (!submissionUrl && !submissionText)) return

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const studentEmail = user?.email || 'siswa.theoqed@gmail.com'

    const { error } = await supabase.from('lms_submissions').insert({
      assignment_id: selectedTask.id,
      student_email: studentEmail,
      file_url: submissionUrl || null,
      submission_text: submissionText || null,
      status: 'submitted',
    })

    if (!error) {
      alert('Tugas berhasil dikumpulkan!')
      setSelectedTask(null)
      setSubmissionUrl('')
      setSubmissionText('')
    } else {
      alert('Gagal mengumpulkan tugas.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat ruang kelas...</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 antialiased">
      <Link
        href="/student/lms"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Kelas Saya
      </Link>

      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white shadow-md space-y-3">
        <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-[10px] font-black uppercase tracking-wider inline-block">
          {classroom?.subject || 'Mata Pelajaran'}
        </span>
        <h1 className="text-2xl font-black tracking-tight text-white">{classroom?.title}</h1>
        <p className="text-xs text-indigo-200/80">Pengajar: {classroom?.tutor_email}</p>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setActiveTab('stream')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'stream' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" /> Forum Diskusi / Stream
        </button>
        <button
          onClick={() => setActiveTab('classwork')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'classwork' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> Tugas Kelas ({assignments.length})
        </button>
      </div>

      {activeTab === 'stream' && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 font-medium">
              Belum ada pengumuman dari tutor.
            </div>
          ) : (
            announcements.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">{post.author_email}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(post.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'classwork' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 font-medium">
              Belum ada tugas yang diberikan di kelas ini.
            </div>
          ) : (
            assignments.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900">{task.title}</h4>
                    <p className="text-xs text-slate-600">{task.instructions || 'Tidak ada petunjuk khusus.'}</p>
                  </div>
                  {task.due_date && (
                    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" /> Tenggat: {new Date(task.due_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                  >
                    <Upload className="w-3.5 h-3.5" /> Kerjakan / Kumpulkan Tugas
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Kumpulkan Tugas */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Kumpulkan: {selectedTask.title}</h3>
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link File / Modul Pekerjaan</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/..."
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Jawaban Teks</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan catatan atau rangkuman jawaban..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Kumpulkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}