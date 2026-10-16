'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  FolderPlus,
  FilePlus,
  Plus,
  Folder,
  FileText,
  Trash2,
  ChevronRight,
  Sparkles,
  Lock,
  Layers
} from 'lucide-react'

interface FolderItem {
  id: string
  parent_id: string | null
  sector: string
  title: string
  description: string | null
}

interface PaperItem {
  id: string
  folder_id: string
  title: string
  year: number | null
  difficulty_level: string
  is_premium: boolean
}

export default function TutorBankSoalStudioPage() {
  const [sector, setSector] = useState<'sekolah' | 'seleksi' | 'olimpiade' | 'kuliah'>('kuliah')
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [papers, setPapers] = useState<PaperItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Modal State Folder
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [folderTitle, setFolderTitle] = useState('')
  const [folderDesc, setFolderDesc] = useState('')

  // Modal State Paper
  const [showPaperModal, setShowPaperModal] = useState(false)
  const [paperTitle, setPaperTitle] = useState('')
  const [paperYear, setPaperYear] = useState<number>(new Date().getFullYear())
  const [paperDifficulty, setPaperDifficulty] = useState('medium')
  const [paperIsPremium, setPaperIsPremium] = useState(false)

  // Modal State Item Soal
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [selectedPaper, setSelectedPaper] = useState<PaperItem | null>(null)
  const [qNumber, setQNumber] = useState(1)
  const [qMarkdown, setQMarkdown] = useState('')
  const [qSolution, setQSolution] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setSelectedFolderId(null)
  }, [sector])

  useEffect(() => {
    fetchFoldersAndPapers()
  }, [sector, selectedFolderId])

  const fetchFoldersAndPapers = async () => {
    setLoading(true)

    let folderQuery = supabase.from('bank_soal_folders').select('*').eq('sector', sector)
    if (selectedFolderId) {
      folderQuery = folderQuery.eq('parent_id', selectedFolderId)
    } else {
      folderQuery = folderQuery.is('parent_id', null)
    }

    const { data: fData } = await folderQuery.order('order_index', { ascending: true })
    if (fData) setFolders(fData)

    if (selectedFolderId) {
      const { data: pData } = await supabase
        .from('bank_soal_papers')
        .select('*')
        .eq('folder_id', selectedFolderId)
        .order('created_at', { ascending: false })

      if (pData) setPapers(pData)
    } else {
      setPapers([])
    }

    setLoading(false)
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderTitle.trim()) return

    const { error } = await supabase.from('bank_soal_folders').insert({
      sector,
      parent_id: selectedFolderId,
      title: folderTitle.trim(),
      description: folderDesc.trim() || null,
    })

    if (!error) {
      setShowFolderModal(false)
      setFolderTitle('')
      setFolderDesc('')
      fetchFoldersAndPapers()
    }
  }

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFolderId || !paperTitle.trim()) return

    const { error } = await supabase.from('bank_soal_papers').insert({
      folder_id: selectedFolderId,
      title: paperTitle.trim(),
      year: paperYear || null,
      difficulty_level: paperDifficulty,
      is_premium: paperIsPremium,
    })

    if (!error) {
      setShowPaperModal(false)
      setPaperTitle('')
      fetchFoldersAndPapers()
    }
  }

  const handleAddQuestionItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPaper || !qMarkdown.trim()) return

    setSubmitting(true)
    const { error } = await supabase.from('bank_soal_items').insert({
      paper_id: selectedPaper.id,
      question_number: qNumber,
      question_markdown: qMarkdown.trim(),
      solution_markdown: qSolution.trim() || null,
    })

    if (!error) {
      alert(`Soal nomor ${qNumber} berhasil ditambahkan!`)
      setQNumber(qNumber + 1)
      setQMarkdown('')
      setQSolution('')
    } else {
      alert('Gagal menambahkan soal.')
    }
    setSubmitting(false)
  }

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Hapus folder ini beserta seluruh isinya?')) return
    await supabase.from('bank_soal_folders').delete().eq('id', id)
    fetchFoldersAndPapers()
  }

  const handleDeletePaper = async (id: string) => {
    if (!confirm('Hapus berkas soal ini?')) return
    await supabase.from('bank_soal_papers').delete().eq('id', id)
    fetchFoldersAndPapers()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Studio Pengelolaan Konten
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kelola Bank Soal & Pembahasan</h1>
          <p className="text-xs text-slate-500 font-medium">
            Buat folder berjenjang, unggah berkas ujian, dan input pembahasan rumus LaTeX.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFolderModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
          >
            <FolderPlus className="w-4 h-4 text-indigo-600" /> Buat Folder Baru
          </button>
          {selectedFolderId && (
            <button
              onClick={() => setShowPaperModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs"
            >
              <FilePlus className="w-4 h-4" /> Buat Berkas Soal
            </button>
          )}
        </div>
      </div>

      {/* Selector Sektor */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { id: 'sekolah', label: 'Sekolah (SMP & SMA)' },
          { id: 'seleksi', label: 'Seleksi & UTBK' },
          { id: 'olimpiade', label: 'Olimpiade' },
          { id: 'kuliah', label: 'Perguruan Tinggi' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSector(s.id as any)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              sector === s.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Explorer Content */}
      <div className="space-y-6">
        {selectedFolderId && (
          <button
            onClick={() => setSelectedFolderId(null)}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            ← Kembali ke Folder Utama
          </button>
        )}

        {loading ? (
          <div className="text-center py-16 text-xs font-bold text-slate-400">Memuat data folder...</div>
        ) : (
          <div className="space-y-6">
            {/* Folder Grid */}
            {folders.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {folders.map((f) => (
                  <div
                    key={f.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <button
                      onClick={() => setSelectedFolderId(f.id)}
                      className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">{f.title}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block">Klik untuk membuka</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(f.id)}
                      className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Folder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Papers Grid */}
            {papers.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Berkas Paket Soal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {papers.map((p) => (
                    <div
                      key={p.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <h4 className="text-xs font-black text-slate-900 truncate">{p.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 block">Tahun {p.year || '-'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedPaper(p)
                            setShowQuestionModal(true)
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                        >
                          <Plus className="w-3.5 h-3.5 inline mr-1" /> Tambah Soal
                        </button>
                        <button
                          onClick={() => handleDeletePaper(p.id)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
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
        )}
      </div>

      {/* Modal Buat Folder */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Buat Folder Baru</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Folder / Kampus / Topik</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Institut Teknologi Bandung atau SMA Kelas 11"
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold">
                  Simpan Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Buat Berkas Soal */}
      {showPaperModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Buat Berkas Soal Baru</h3>
            <form onSubmit={handleCreatePaper} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Berkas Soal</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: UTS Matematika 1A 2024"
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun</label>
                  <input
                    type="number"
                    value={paperYear}
                    onChange={(e) => setPaperYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kesulitan</label>
                  <select
                    value={paperDifficulty}
                    onChange={(e) => setPaperDifficulty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  >
                    <option value="easy">Mudah</option>
                    <option value="medium">Sedang</option>
                    <option value="hard">Sulit / HOTS</option>
                    <option value="olympiad">Olimpiade</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="premiumCheck"
                  checked={paperIsPremium}
                  onChange={(e) => setPaperIsPremium(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="premiumCheck" className="text-xs font-bold text-slate-700">
                  Khusus Pengguna Premium
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaperModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold">
                  Simpan Berkas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Item Soal + Solution */}
      {showQuestionModal && selectedPaper && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900">Input Soal: {selectedPaper.title}</h3>
            <form onSubmit={handleAddQuestionItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Soal</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qNumber}
                  onChange={(e) => setQNumber(Number(e.target.value))}
                  className="w-24 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teks Soal (Mendukung Markdown & LaTeX)</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Misal: Hitunglah limit berikut $\lim_{x \to 0} \frac{\sin x}{x}$..."
                  value={qMarkdown}
                  onChange={(e) => setQMarkdown(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pembahasan & Solusi Lengkap</label>
                <textarea
                  rows={5}
                  placeholder="Tuliskan langkah-langkah pembuktian atau penyelesaian..."
                  value={qSolution}
                  onChange={(e) => setQSolution(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Selesai
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan & Tambah Soal Lagi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}