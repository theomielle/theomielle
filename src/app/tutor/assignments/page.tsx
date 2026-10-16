'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckSquare, ExternalLink, Award, Clock, CheckCircle2, Search, Filter } from 'lucide-react'

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
  lms_assignments: {
    title: string
    max_points: number
    lms_classrooms: {
      title: string
    }
  }
}

export default function TutorAssignmentsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'graded'>('submitted')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Penilaian
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null)
  const [scoreInput, setScoreInput] = useState<number>(100)
  const [feedbackInput, setFeedbackInput] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchAllSubmissions()
  }, [])

  const fetchAllSubmissions = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const tutorEmail = user?.email || 'dave.theoqed@gmail.com'

    // Ambil seluruh submission tugas milik kelas yang diajar tutor ini
    const { data } = await supabase
      .from('lms_submissions')
      .select(`
        *,
        lms_assignments!inner (
          title, max_points,
          lms_classrooms!inner (
            title, tutor_email
          )
        )
      `)
      .eq('lms_assignments.lms_classrooms.tutor_email', tutorEmail)
      .order('submitted_at', { ascending: false })

    if (data) {
      setSubmissions(data as unknown as Submission[])
    }
    setLoading(false)
  }

  const handleOpenGradeModal = (sub: Submission) => {
    setSelectedSub(sub)
    setScoreInput(sub.score ?? sub.lms_assignments?.max_points ?? 100)
    setFeedbackInput(sub.feedback || '')
  }

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSub) return

    setSaving(true)
    const { error } = await supabase
      .from('lms_submissions')
      .update({
        score: scoreInput,
        feedback: feedbackInput || null,
        status: 'graded',
      })
      .eq('id', selectedSub.id)

    if (!error) {
      setSubmissions(submissions.map((s) => s.id === selectedSub.id ? { ...s, score: scoreInput, feedback: feedbackInput, status: 'graded' } : s))
      setSelectedSub(null)
    } else {
      alert('Gagal menyimpan nilai.')
    }
    setSaving(false)
  }

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus
    const matchesSearch =
      sub.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.lms_assignments?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.lms_assignments?.lms_classrooms?.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 antialiased">
      {/* Banner Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> Modul Evaluasi LMS
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pemeriksaan Tugas Siswa</h1>
          <p className="text-xs text-slate-500 font-medium">Pusat peninjauan dan penilaian seluruh tugas masuk dari berbagai kelas LMS.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('submitted')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filterStatus === 'submitted' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Belum Dinilai
          </button>
          <button
            onClick={() => setFilterStatus('graded')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filterStatus === 'graded' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sudah Dinilai
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        <input
          type="text"
          placeholder="Cari berdasarkan email siswa, judul tugas, atau nama kelas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-slate-900 bg-transparent focus:outline-none"
        />
      </div>

      {/* Daftar Pengumpulan Tugas */}
      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat berkas pekerjaan siswa...</div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-sm">Tidak Ada Tugas Ditemukan</h3>
          <p className="text-xs text-slate-500">Semua pengumpulan tugas pada filter ini sudah diperiksa atau belum ada tugas masuk.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                    {sub.lms_assignments?.lms_classrooms?.title}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    sub.status === 'graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {sub.status === 'graded' ? `Nilai: ${sub.score}/${sub.lms_assignments?.max_points}` : 'Menunggu Penilaian'}
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 truncate">{sub.lms_assignments?.title}</h3>
                
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-indigo-900">Siswa: {sub.student_email}</div>
                  {sub.submission_text && (
                    <p className="text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 font-normal">
                      "{sub.submission_text}"
                    </p>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                  <Clock className="w-3 h-3" /> Dikumpulkan pada: {new Date(sub.submitted_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full md:w-auto">
                {sub.file_url && (
                  <a
                    href={sub.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Lihat Dokumen
                  </a>
                )}

                <button
                  onClick={() => handleOpenGradeModal(sub)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs"
                >
                  <Award className="w-3.5 h-3.5" /> {sub.status === 'graded' ? 'Ubah Nilai' : 'Beri Nilai'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Beri Nilai Central */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">
                {selectedSub.lms_assignments?.lms_classrooms?.title}
              </span>
              <h3 className="text-base font-black text-slate-900">{selectedSub.lms_assignments?.title}</h3>
              <p className="text-xs text-slate-500">Siswa: {selectedSub.student_email}</p>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nilai Akhir (Maks: {selectedSub.lms_assignments?.max_points})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedSub.lms_assignments?.max_points || 100}
                  required
                  value={scoreInput}
                  onChange={(e) => setScoreInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Umpan Balik / Catatan Pengajar</label>
                <textarea
                  rows={3}
                  placeholder="Berikan umpan balik atau apresiasi pekerjaan siswa..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Nilai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}