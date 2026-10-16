'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Megaphone,
  FileText,
  Users,
  Plus,
  Send,
  Calendar,
  Clock,
  MessageCircle,
  ExternalLink,
  Award,
  CheckCircle2,
  Trash2,
  UserCheck
} from 'lucide-react'

interface Classroom {
  id: string
  title: string
  subject: string | null
  instructor_name: string | null
  class_code: string
  tutor_email: string
}

interface Comment {
  id: string
  announcement_id: string
  author_email: string
  content: string
  created_at: string
}

interface Announcement {
  id: string
  author_email: string
  content: string
  created_at: string
  comments?: Comment[]
}

interface Assignment {
  id: string
  title: string
  instructions: string | null
  due_date: string | null
  max_points: number
  created_at: string
}

interface Submission {
  id: string
  assignment_id: string
  student_email: string
  file_url: string | null
  submission_text: string | null
  score: number | null
  feedback: string | null
  submitted_at: string
  status: string
}

interface Member {
  id: string
  student_email: string
  joined_at: string
}

export default function TutorClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classroomId } = use(params)
  const supabase = createClient()

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people'>('stream')
  const [loading, setLoading] = useState(true)

  // Stream & Comments State
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  // Assignment & Grading State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [assignTitle, setAssignTitle] = useState('')
  const [assignInstructions, setAssignInstructions] = useState('')
  const [assignDueDate, setAssignDueDate] = useState('')
  const [assignPoints, setAssignPoints] = useState(100)

  // Grading Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [scoreInput, setScoreInput] = useState<number>(100)
  const [feedbackInput, setFeedbackInput] = useState('')

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

    // Pengumuman & Komentar
    const { data: streamData } = await supabase
      .from('lms_announcements')
      .select(`
        *,
        comments:lms_comments (*)
      `)
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false })

    if (streamData) setAnnouncements(streamData)

    // Tugas Kelas
    const { data: taskData } = await supabase
      .from('lms_assignments')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false })

    if (taskData) setAssignments(taskData)

    // Anggota Kelas
    const { data: memberData } = await supabase
      .from('lms_classroom_members')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('joined_at', { ascending: false })

    if (memberData) setMembers(memberData)

    setLoading(false)
  }

  // Posting Pengumuman
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnnouncement.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    const tutorEmail = user?.email || classroom?.tutor_email || 'dave.theoqed@gmail.com'

    const { data, error } = await supabase
      .from('lms_announcements')
      .insert({
        classroom_id: classroomId,
        author_email: tutorEmail,
        content: newAnnouncement,
      })
      .select()
      .single()

    if (data && !error) {
      setAnnouncements([{ ...data, comments: [] }, ...announcements])
      setNewAnnouncement('')
    }
  }

  // Posting Komentar Diskusi
  const handlePostComment = async (announcementId: string) => {
    const content = commentInputs[announcementId]
    if (!content || !content.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    const tutorEmail = user?.email || 'dave.theoqed@gmail.com'

    const { data, error } = await supabase
      .from('lms_comments')
      .insert({
        announcement_id: announcementId,
        author_email: tutorEmail,
        content: content.trim(),
      })
      .select()
      .single()

    if (data && !error) {
      setAnnouncements(announcements.map((a) => {
        if (a.id === announcementId) {
          return { ...a, comments: [...(a.comments || []), data] }
        }
        return a
      }))
      setCommentInputs({ ...commentInputs, [announcementId]: '' })
    }
  }

  // Buat Tugas Baru
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignTitle.trim()) return

    const { data, error } = await supabase
      .from('lms_assignments')
      .insert({
        classroom_id: classroomId,
        title: assignTitle,
        instructions: assignInstructions || null,
        due_date: assignDueDate ? new Date(assignDueDate).toISOString() : null,
        max_points: assignPoints,
      })
      .select()
      .single()

    if (data && !error) {
      setAssignments([data, ...assignments])
      setShowAssignmentModal(false)
      setAssignTitle('')
      setAssignInstructions('')
      setAssignDueDate('')
    }
  }

  // Buka Modal Pemeriksaan Tugas Siswa
  const handleOpenSubmissions = async (task: Assignment) => {
    setSelectedAssignment(task)
    const { data } = await supabase
      .from('lms_submissions')
      .select('*')
      .eq('assignment_id', task.id)
      .order('submitted_at', { ascending: false })

    if (data) setSubmissions(data)
  }

  // Pilih Pekerjaan Siswa untuk Dinilai
  const handleSelectSubmission = (sub: Submission) => {
    setSelectedSubmission(sub)
    setScoreInput(sub.score ?? selectedAssignment?.max_points ?? 100)
    setFeedbackInput(sub.feedback || '')
  }

  // Simpan Penilaian & Feedback
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return

    const { error } = await supabase
      .from('lms_submissions')
      .update({
        score: scoreInput,
        feedback: feedbackInput || null,
        status: 'graded',
      })
      .eq('id', selectedSubmission.id)

    if (!error) {
      alert('Nilai dan umpan balik berhasil disimpan!')
      setSubmissions(submissions.map((s) => s.id === selectedSubmission.id ? { ...s, score: scoreInput, feedback: feedbackInput, status: 'graded' } : s))
      setSelectedSubmission(null)
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Keluarkan siswa ini dari kelas?')) return
    await supabase.from('lms_classroom_members').delete().eq('id', memberId)
    setMembers(members.filter((m) => m.id !== memberId))
  }

  if (loading) {
    return <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat ruang kelas...</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 antialiased">
      <Link
        href="/tutor/lms"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kelas
      </Link>

      {/* Classroom Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-[10px] font-black uppercase tracking-wider">
            {classroom?.subject || 'Mata Pelajaran'}
          </span>
          <span className="text-xs font-black bg-indigo-500/30 px-3.5 py-1 rounded-xl text-indigo-100">
            Kode: {classroom?.class_code}
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">{classroom?.title}</h1>
        <p className="text-xs text-indigo-200/80">
          Pengajar: <strong className="text-white">{classroom?.instructor_name || classroom?.tutor_email}</strong>
        </p>
      </div>

      {/* Classroom Navigation Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setActiveTab('stream')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'stream' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" /> Stream / Diskusi
        </button>
        <button
          onClick={() => setActiveTab('classwork')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'classwork' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> Tugas Kelas ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('people')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'people' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Anggota Kelas ({members.length})
        </button>
      </div>

      {/* TAB 1: STREAM & DISKUSI */}
      {activeTab === 'stream' && (
        <div className="space-y-6">
          <form onSubmit={handlePostAnnouncement} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Pengumuman Baru</span>
            <textarea
              rows={3}
              required
              placeholder="Bagikan pengumuman atau materi baru ke seluruh siswa..."
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 resize-none"
            />
            <div className="flex justify-end">
              <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
                <Send className="w-3.5 h-3.5" /> Posting Pengumuman
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400 font-medium">
                Belum ada pengumuman di forum kelas ini.
              </div>
            ) : (
              announcements.map((post) => (
                <div key={post.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-extrabold text-slate-900">{post.author_email}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(post.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>

                  {/* Thread Komentar Diskusi */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {post.comments?.length || 0} Komentar Kelas
                    </span>

                    <div className="space-y-2">
                      {post.comments?.map((c) => (
                        <div key={c.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                            <span>{c.author_email}</span>
                            <span>{new Date(c.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-800">{c.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Tambahkan komentar kelas..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handlePostComment(post.id)}
                        className="flex-1 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none"
                      />
                      <button
                        onClick={() => handlePostComment(post.id)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800"
                      >
                        Kirim
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TUGAS KELAS & PEMERIKSAAN HASIL */}
      {activeTab === 'classwork' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900">Daftar Tugas & Penugasan</h3>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" /> Buat Tugas Baru
            </button>
          </div>

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
                      <p className="text-xs text-slate-600 line-clamp-2">{task.instructions || 'Tidak ada petunjuk khusus.'}</p>
                    </div>
                    {task.due_date && (
                      <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" /> Tenggat: {new Date(task.due_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-400">Poin Maksimal: {task.max_points}</span>
                    <button
                      onClick={() => handleOpenSubmissions(task)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                    >
                      <Award className="w-3.5 h-3.5" /> Periksa Pengumpulan Siswa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ANGGOTA KELAS */}
      {activeTab === 'people' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 bg-slate-50/80 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Siswa Terdaftar ({members.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {members.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">Belum ada siswa yang bergabung dengan kode kelas ini.</div>
            ) : (
              members.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">{m.student_email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">Bergabung: {new Date(m.joined_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    <button
                      onClick={() => handleDeleteMember(m.id)}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                      title="Keluarkan Siswa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Pemeriksaan & Penilaian Tugas Siswa */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedAssignment.title}</h3>
                <span className="text-[11px] text-slate-400 font-bold">Daftar Pengumpulan Tugas Siswa</span>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="text-xs font-bold text-slate-400 hover:text-slate-800">
                Tutup
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 font-bold">Belum ada siswa yang mengumpulkan tugas ini.</div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{sub.student_email}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        sub.status === 'graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {sub.status === 'graded' ? `Nilai: ${sub.score}/${selectedAssignment.max_points}` : 'Belum Dinilai'}
                      </span>
                    </div>

                    {sub.submission_text && (
                      <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60 whitespace-pre-line">
                        {sub.submission_text}
                      </p>
                    )}

                    {sub.file_url && (
                      <a
                        href={sub.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Buka File Pekerjaan Siswa
                      </a>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                      <button
                        onClick={() => handleSelectSubmission(sub)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                      >
                        Beri Nilai & Catatan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Beri Nilai Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Beri Nilai: {selectedSubmission.student_email}</h3>
            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nilai / Skor (Maks: {selectedAssignment?.max_points})</label>
                <input
                  type="number"
                  min="0"
                  max={selectedAssignment?.max_points || 100}
                  required
                  value={scoreInput}
                  onChange={(e) => setScoreInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Umpan Balik Pengajar</label>
                <textarea
                  rows={3}
                  placeholder="Beri catatan perbaikan atau pujian..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
                  Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Buat Tugas */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-black text-slate-900">Buat Tugas Baru</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Tugas 1 - Latihan Limit Fungsi"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tenggat Waktu</label>
                  <input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Poin Maksimal</label>
                  <input
                    type="number"
                    min="1"
                    value={assignPoints}
                    onChange={(e) => setAssignPoints(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Petunjuk Pekerjaan</label>
                <textarea
                  rows={3}
                  placeholder="Instruksi pengerjaan tugas..."
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
                  Buat Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}