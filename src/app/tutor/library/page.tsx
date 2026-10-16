'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BookPlus,
  FolderPlus,
  FilePlus,
  Plus,
  BookOpen,
  FileText,
  Trash2,
  Sparkles,
  Lock,
  Star,
  Layers,
  Tag
} from 'lucide-react'

interface LibraryBook {
  id: string
  sector: string
  title: string
  authors: string | null
  isbn: string | null
  cover_url: string | null
  description: string | null
  tags: string[] | null
  rating: number
  is_premium: boolean
}

interface ChapterItem {
  id: string
  book_id: string
  title: string
  order_index: number
}

export default function TutorLibraryStudioPage() {
  const [books, setBooks] = useState<LibraryBook[]>([])
  const [activeSector, setActiveSector] = useState<string>('all')
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null)
  const [chapters, setChapters] = useState<ChapterItem[]>([])
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Modal State Buku Baru
  const [showBookModal, setShowBookModal] = useState(false)
  const [bookTitle, setBookTitle] = useState('')
  const [bookSector, setBookSector] = useState('textbook_solution')
  const [bookAuthors, setBookAuthors] = useState('')
  const [bookIsbn, setBookIsbn] = useState('')
  const [bookCoverUrl, setBookCoverUrl] = useState('')
  const [bookDesc, setBookDesc] = useState('')
  const [bookTags, setBookTags] = useState('')
  const [bookIsPremium, setBookIsPremium] = useState(false)

  // Modal State Bab (Chapter) Baru
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterOrder, setChapterOrder] = useState(1)

  // Modal State Halaman (Page) Baru
  const [showPageModal, setShowPageModal] = useState(false)
  const [pageTitle, setPageTitle] = useState('')
  const [pageContent, setPageContent] = useState('')
  const [pageIsLocked, setPageIsLocked] = useState(false)
  const [pageOrder, setPageOrder] = useState(1)

  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchBooks()
  }, [activeSector])

  useEffect(() => {
    if (selectedBook) {
      fetchChapters(selectedBook.id)
    } else {
      setChapters([])
    }
  }, [selectedBook])

  const fetchBooks = async () => {
    setLoading(true)

    let query = supabase.from('library_books').select('*')
    if (activeSector !== 'all') {
      query = query.eq('sector', activeSector)
    }

    const { data } = await query.order('created_at', { ascending: false })
    if (data) setBooks(data)

    setLoading(false)
  }

  const fetchChapters = async (bookId: string) => {
    const { data } = await supabase
      .from('library_chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('order_index', { ascending: true })

    if (data) setChapters(data)
  }

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookTitle.trim()) return

    setSubmitting(true)
    const tagArray = bookTags ? bookTags.split(',').map((t) => t.trim()).filter(Boolean) : []

    const { error } = await supabase.from('library_books').insert({
      title: bookTitle.trim(),
      sector: bookSector,
      authors: bookAuthors.trim() || null,
      isbn: bookIsbn.trim() || null,
      cover_url: bookCoverUrl.trim() || null,
      description: bookDesc.trim() || null,
      tags: tagArray.length > 0 ? tagArray : null,
      is_premium: bookIsPremium,
    })

    if (!error) {
      setShowBookModal(false)
      setBookTitle('')
      setBookAuthors('')
      setBookIsbn('')
      setBookCoverUrl('')
      setBookDesc('')
      setBookTags('')
      fetchBooks()
    } else {
      alert('Gagal membuat modul perpustakaan.')
    }
    setSubmitting(false)
  }

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBook || !chapterTitle.trim()) return

    const { error } = await supabase.from('library_chapters').insert({
      book_id: selectedBook.id,
      title: chapterTitle.trim(),
      order_index: chapterOrder,
    })

    if (!error) {
      setShowChapterModal(false)
      setChapterTitle('')
      fetchChapters(selectedBook.id)
    }
  }

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChapterId || !pageTitle.trim()) return

    setSubmitting(true)
    const { error } = await supabase.from('library_pages').insert({
      chapter_id: selectedChapterId,
      title: pageTitle.trim(),
      content_markdown: pageContent.trim(),
      is_locked: pageIsLocked,
      order_index: pageOrder,
    })

    if (!error) {
      alert('Halaman materi berhasil dibuat!')
      setShowPageModal(false)
      setPageTitle('')
      setPageContent('')
    } else {
      alert('Gagal membuat halaman.')
    }
    setSubmitting(false)
  }

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Hapus modul perpustakaan ini beserta seluruh bab dan halamannya?')) return
    await supabase.from('library_books').delete().eq('id', id)
    if (selectedBook?.id === id) setSelectedBook(null)
    fetchBooks()
  }

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('Hapus bab ini beserta halamannya?')) return
    await supabase.from('library_chapters').delete().eq('id', id)
    if (selectedBook) fetchChapters(selectedBook.id)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Studio Perpustakaan & TheoNotes
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kelola Buku Teks & Modul TheoNotes</h1>
          <p className="text-xs text-slate-500 font-medium">
            Tambah modul baru, susun bab materi, dan input teks penjelasan berformat Markdown & LaTeX.
          </p>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs shrink-0 cursor-pointer"
        >
          <BookPlus className="w-4 h-4" /> Tambah Modul/Buku Baru
        </button>
      </div>

      {/* Selector Sektor */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { id: 'all', label: 'Semua Koleksi' },
          { id: 'textbook_solution', label: 'Textbook Solution' },
          { id: 'theonotes', label: 'TheoNotes' },
          { id: 'modul_sekolah', label: 'Modul Sekolah' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSector(s.id)
              setSelectedBook(null)
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSector === s.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: List Buku */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Daftar Modul Perpustakaan</h3>

          {loading ? (
            <div className="text-center py-16 text-xs font-bold text-slate-400">Memuat modul perpustakaan...</div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-extrabold text-slate-900 text-xs">Belum Ada Modul</h4>
              <p className="text-[11px] text-slate-500">Klik tombol di atas untuk menambah modul pertama.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {books.map((b) => {
                const isSelected = selectedBook?.id === b.id

                return (
                  <div
                    key={b.id}
                    className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                        : 'bg-white border-slate-200/80 text-slate-900 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedBook(b)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-3 rounded-xl shrink-0 ${isSelected ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {b.sector === 'textbook_solution' ? 'Textbook' : b.sector === 'theonotes' ? 'TheoNotes' : 'Modul'}
                          </span>
                          {b.is_premium && (
                            <span className="text-[9px] font-black text-amber-500 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Premium
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black truncate">{b.title}</h4>
                        {b.authors && <p className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{b.authors}</p>}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBook(b.id)
                      }}
                      className={`p-2 rounded-xl transition-colors shrink-0 ${
                        isSelected ? 'text-rose-300 hover:bg-white/10' : 'text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Hapus Modul"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Structure Bab & Halaman (Jika ada buku terpilih) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Struktur Bab & Halaman</h3>

          {selectedBook ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-5 shadow-xs">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Modul Terpilih</span>
                <h3 className="text-sm font-black text-slate-900">{selectedBook.title}</h3>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700">Daftar Bab ({chapters.length})</span>
                <button
                  onClick={() => setShowChapterModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Tambah Bab
                </button>
              </div>

              <div className="space-y-2">
                {chapters.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl">
                    Belum ada bab dibuat di modul ini.
                  </div>
                ) : (
                  chapters.map((chap, idx) => (
                    <div key={chap.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Bab {idx + 1}: {chap.title}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedChapterId(chap.id)
                              setShowPageModal(true)
                            }}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[10px] font-bold"
                          >
                            + Halaman
                          </button>
                          <button
                            onClick={() => handleDeleteChapter(chap.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-xs font-bold text-slate-400 shadow-xs">
              Pilih salah satu modul di sebelah kiri untuk mengelola bab dan halamannya.
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah Modul/Buku */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900">Tambah Modul / Buku Baru</h3>
            <form onSubmit={handleCreateBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Buku / Modul</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Elementary Linear Algebra 11th Edition"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sektor / Jenis</label>
                  <select
                    value={bookSector}
                    onChange={(e) => setBookSector(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  >
                    <option value="textbook_solution">Textbook Solution</option>
                    <option value="theonotes">TheoNotes</option>
                    <option value="modul_sekolah">Modul Sekolah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pengarang / Tim</label>
                  <input
                    type="text"
                    placeholder="Misal: Howard Anton"
                    value={bookAuthors}
                    onChange={(e) => setBookAuthors(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Gambar Sampul (Cover Image)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={bookCoverUrl}
                  onChange={(e) => setBookCoverUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tag Topik (Pisahkan Koma)</label>
                <input
                  type="text"
                  placeholder="Vektor, Matriks, Determinan"
                  value={bookTags}
                  onChange={(e) => setBookTags(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan ringkas isi modul..."
                  value={bookDesc}
                  onChange={(e) => setBookDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bookPremiumCheck"
                  checked={bookIsPremium}
                  onChange={(e) => setBookIsPremium(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="bookPremiumCheck" className="text-xs font-bold text-slate-700">
                  Khusus Pengguna Premium
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Simpan Modul'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Bab */}
      {showChapterModal && selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Tambah Bab: {selectedBook.title}</h3>
            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Bab</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Chapter 1 - Systems of Linear Equations"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urutan Bab (Order Index)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={chapterOrder}
                  onChange={(e) => setChapterOrder(Number(e.target.value))}
                  className="w-24 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold">
                  Simpan Bab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Halaman Materi */}
      {showPageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900">Tambah Halaman Materi / Pembahasan</h3>
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Subbab / Halaman</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 1.1 Logika Proposisional"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Isi Materi (Markdown / LaTeX)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Tuliskan isi materi, rumus LaTeX seperti $\frac{a}{b}$, atau definisi..."
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pageLockedCheck"
                  checked={pageIsLocked}
                  onChange={(e) => setPageIsLocked(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="pageLockedCheck" className="text-xs font-bold text-slate-700">
                  Terkunci (Hanya Akses Premium)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPageModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Simpan Halaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}